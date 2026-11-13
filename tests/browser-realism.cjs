// Run against an isolated Chromium/Edge profile with remote debugging enabled.
const assert=require('node:assert/strict');
const fs=require('node:fs');

(async()=>{
  const endpoint=process.env.CDP_URL||'http://127.0.0.1:9227';
  const pages=await (await fetch(`${endpoint}/json/list`)).json();
  const page=pages.find(p=>p.type==='page'&&p.url.includes('/docs/index.html'));
  assert.ok(page,'Open docs/index.html in the debugging browser first.');
  const ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let id=0;const pending=new Map(),errors=[];
  ws.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.id){pending.get(message.id)?.(message);pending.delete(message.id)}
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const key=++id;
    const timer=setTimeout(()=>{pending.delete(key);reject(new Error(`Timeout: ${method}`))},30000);
    pending.set(key,result=>{clearTimeout(timer);resolve(result)});
    ws.send(JSON.stringify({id:key,method,params}));
  });
  const evaluate=async expression=>{
    const response=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    assert.ok(!response.result?.exceptionDetails,JSON.stringify(response.result?.exceptionDetails));
    return response.result.result.value;
  };
  try{
    await send('Runtime.enable');
    await send('Page.enable');
    const loaded=new Promise((resolve,reject)=>{
      const listener=event=>{
        if(JSON.parse(event.data).method==='Page.loadEventFired'){
          clearTimeout(timer);ws.removeEventListener('message',listener);resolve();
        }
      };
      const timer=setTimeout(()=>{ws.removeEventListener('message',listener);reject(new Error('Page load timed out'))},15000);
      ws.addEventListener('message',listener);
    });
    await send('Page.reload',{ignoreCache:true});await loaded;
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    const result=await evaluate(`(async()=>{
      const checks=[];
      const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label)};
      const close=(a,b)=>Math.abs(a-b)<1e-7;
      const settle=async()=>{
        for(let i=0;i<200;i++){
          if($('#animalCanvas').dataset.drawVersion===String(drawVersion))return;
          await new Promise(r=>setTimeout(r,10));
        }
        throw new Error('Rendering did not finish: '+$('#inputError').textContent);
      };
      for(let i=0;i<200&&!assetsReady;i++)await new Promise(r=>setTimeout(r,10));
      check(assetsReady,'assets initialized');
      await settle();
      check([...document.querySelectorAll('#results details')].every(d=>!d.open),'technical results start collapsed');
      check(!$('#sensorDetails').open,'manual sensor settings start collapsed');
      const firstDetails=$('#results details');
      firstDetails.querySelector('summary').click();
      check(firstDetails.open,'result details expand');
      const firstAnimalPixels=firstDetails.querySelector('.animal-pixels b').textContent;
      $('#distance').value=200;render();await settle();
      check($('#results details').open,'result details remain open after input changes');
      check($('#results details .animal-pixels b').textContent!==firstAnimalPixels,'expanded numbers update');
      check(!document.querySelectorAll('#results details')[1].open,'other result cards stay collapsed');
      $('#results details summary').click();$('#distance').value=100;render();await settle();
      check(!$('#results details').open,'closed result stays collapsed');
      $('#preset').value='custom';$('#preset').dispatchEvent(new Event('change'));
      check($('#sensorDetails').open,'custom sensor selection opens manual controls');
      $('#preset').value='640,512,12';$('#preset').dispatchEvent(new Event('change'));$('#sensorDetails').open=false;
      lenses=[35,50];renderLensList();$('#distance').value=100;$('#netd').value='off';
      for(const [src,bounds] of Object.entries(spriteBounds)){
        const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
        const buffer=document.createElement('canvas');buffer.width=image.width;buffer.height=image.height;
        const ctx=buffer.getContext('2d');ctx.drawImage(image,0,0);
        const pixels=ctx.getImageData(0,0,image.width,image.height).data;
        let left=image.width,top=image.height,right=-1,bottom=-1;
        for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]){
          left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
        }
        check(JSON.stringify(bounds)===JSON.stringify([left,top,right-left+1,bottom-top+1]),'source alpha bounds '+src);
      }
      for(const animal of animals){
        const sprite=await loadRaster(animal.img);
        check(close(animal.w/animal.h,sprite.width/sprite.height),animal.id+': silhouette proportions');
        const alpha=sprite.getContext('2d').getImageData(0,0,sprite.width,sprite.height).data;
        const edge=(axis,value)=>{
          for(let i=0;i<(axis==='x'?sprite.height:sprite.width);i++){
            const x=axis==='x'?value:i,y=axis==='x'?i:value;
            if(alpha[(y*sprite.width+x)*4+3])return true;
          }return false;
        };
        check(edge('x',0)&&edge('x',sprite.width-1)&&edge('y',0)&&edge('y',sprite.height-1),animal.id+': no transparent padding');
        selectedAnimal=animal;renderAnimals();
        for(const scene of ['forest','field','none'])for(const perception of [true,false])for(const zoom of [1,8]){
          document.querySelector('[data-scene="'+scene+'"]').click();
          $('#perceptionEnabled').checked=perception;$('#digitalZoom').value=zoom;
          $('#previewLens').value='1';render();await settle();
          const v=values(),outer=calc(35,v),frame=perceptionFrame(v,outer),canvas=$('#animalCanvas');
          check(close(animalBounds.bottom/canvas.height,groundY(100,v,frame)),animal.id+'/'+scene+'/'+perception+'/'+zoom+': shared ground plane');
          if(!perception){
            check(close(animalBounds.centerX/canvas.width,.5),'tracked horizontal centre');
            check(close(animalBounds.centerY/canvas.height,.5),'tracked vertical centre');
          }
          check(canvas.dataset.previewLens==='50','selected lens is rendered');
          check(close(animalBounds.w/canvas.width,animal.w/frame.w),'silhouette width matches metric scale');
          check(!$('#inputError').textContent,'no rendering error');
        }
      }
      selectedAnimal=animals[0];animalWorldX=2;
      $('#perceptionEnabled').checked=false;$('#previewLens').value='0';
      for(const option of [...$('#preset').options].filter(o=>o.value!=='custom')){
        $('#preset').value=option.value;$('#preset').dispatchEvent(new Event('change'));await settle();
        const v=values(),frame=calc(35,v),canvas=$('#animalCanvas');
        check(Math.abs(canvas.width/canvas.height-v.rw/v.rh)<.01,'canvas aspect '+option.value);
        check(close(animalBounds.centerX/canvas.width,.5),'tracked x survives preset change');
        check(animalWorldX===2,'tracking preserves world position');
      }
      $('#resW').value=80;$('#resH').value=2048;render();await settle();
      check(Math.abs($('#animalCanvas').width/$('#animalCanvas').height-80/2048)<.001,'extreme portrait sensor');
      $('#resW').value=2048;$('#resH').value=60;render();await settle();
      check(Math.abs($('#animalCanvas').width/$('#animalCanvas').height-2048/60)<.1,'extreme landscape sensor');
      $('#resW').value='';render();check($('#viewport').hidden,'invalid input hides scene');
      $('#preset').value='640,512,12';$('#preset').dispatchEvent(new Event('change'));
      $('#distance').value=100;$('#digitalZoom').value=1;$('#previewLens').value='0';
      $('#perceptionEnabled').checked=true;animalWorldX=0;selectedAnimal=animals[0];
      document.querySelector('[data-scene="forest"]').click();renderAnimals();render();await settle();
      for(const netd of ['15','18','20','25','30','35','40','50','off']){
        $('#netd').value=netd;render();await settle();
        check($('#animalCanvas').dataset.netd===netd,'noise setting '+netd);
      }
      const originalDraw=CanvasRenderingContext2D.prototype.drawImage;
      let sensorImage;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        if(this.canvas===$('#animalCanvas')&&image.width===640&&image.height===512)sensorImage=image;
        return originalDraw.call(this,image,...args);
      };
      try{
        render();await settle();
        const data=()=>sensorImage.getContext('2d').getImageData(0,0,640,512).data;
        const unzoomed=new Uint8ClampedArray(data());
        $('#digitalZoom').value=8;render();await settle();
        check(data().every((value,i)=>value===unzoomed[i]),'digital zoom preserves the complete native sensor image');
        $('#digitalZoom').value=1;$('#previewLens').value=1;render();await settle();
        check(data().some((value,i)=>value!==unzoomed[i]),'changing preview lens changes captured sensor detail');
        $('#previewLens').value=0;
        const source='assets/thermal-field-bush.png',savedSprite=rasterCache.get(source),savedLayout=fieldPlantLayout.slice(),savedDensity=$('#fieldPlantCount').value;
        const solid=document.createElement('canvas');solid.width=100;solid.height=100;
        const ctx=solid.getContext('2d');ctx.fillStyle='rgb(20,20,20)';ctx.fillRect(0,0,100,100);
        rasterCache.set(source,Promise.resolve(solid));$('#fieldPlantCount').value=100;
        try{
          selectedScene='field';fieldPlantLayout.splice(0,fieldPlantLayout.length,{x:.5,d:50,h:5,w:10,kind:'bush'});
          render();await settle();
          const center=()=>data()[(Math.floor(animalGroundY(100,values(),calc(35,values()))*512)*640+320)*4];
          const covered=center();check(covered===20,'opaque foreground blocks the animal');
          fieldPlantLayout[0]={x:.5,d:300,h:5,w:10,kind:'bush'};render();await settle();
          check(center()>covered,'animal is drawn in front of more distant vegetation');
        }finally{rasterCache.set(source,savedSprite);fieldPlantLayout.splice(0,fieldPlantLayout.length,...savedLayout);$('#fieldPlantCount').value=savedDensity;}
      }finally{CanvasRenderingContext2D.prototype.drawImage=originalDraw;}
      for(const [scene,id] of [['forest','treeCount'],['field','fieldPlantCount']]){
        document.querySelector('[data-scene="'+scene+'"]').click();
        check($('#'+id).step==='10','density slider uses steps of ten: '+scene);
        for(const density of [0,10,50,100]){
          $('#'+id).value=density;$('#'+id).dispatchEvent(new Event('input'));await settle();
          check($('#'+id+'Label').textContent===density+' %','density output '+scene+'/'+density);
          check(!$('#inputError').textContent,'density renders '+scene+'/'+density);
        }
        $('#'+id).value=40;$('#'+id).dispatchEvent(new Event('input'));await settle();
      }
      check($('#distance').step==='10','distance slider uses ten metre steps');
      $('#perceptionEnabled').checked=false;animalWorldX=-3;
      for(const distance of [10,100,500])for(const zoom of [1,8])for(const preview of [0,1]){
        $('#distance').value=distance;$('#digitalZoom').value=zoom;$('#previewLens').value=preview;
        render();await settle();
        check($('#animalCanvas').dataset.animalX==='0.5000'&&$('#animalCanvas').dataset.animalY==='0.5000','tracking '+distance+'/'+zoom+'/'+preview);
      }
      $('#perceptionEnabled').checked=true;$('#distance').value=100;$('#digitalZoom').value=1;$('#previewLens').value=0;animalWorldX=0;
      selectedScene='forest';render();await settle();
      return {checks:checks.length,animals:animals.map(a=>({name:a.name,size:a.size}))};
    })()`);
    // Real pointer events exercise capture, coordinate conversion and RAF updates.
    const performDrag=async()=>{
    await evaluate(`document.documentElement.style.scrollBehavior='auto';$('#animalCanvas').scrollIntoView({block:'center',behavior:'instant'});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));`);
    const drag=await evaluate(`(()=>{
      const v=values(),frame=perceptionFrame(v,calc(35,v)),canvas=$('#animalCanvas'),r=canvas.getBoundingClientRect();
      return {x:r.left+animalBounds.centerX/canvas.width*r.width,y:r.top+animalBounds.centerY/canvas.height*r.height,
        targetX:r.left+.55*r.width,targetY:r.top+animalGroundY(200,v,frame)*r.height};
    })()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:drag.x,y:drag.y});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:drag.x,y:drag.y,button:'left',clickCount:1});
    const anchor=await evaluate('JSON.stringify({animalDrag,animalBounds,rect:$("#animalCanvas").getBoundingClientRect()})');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:drag.targetX,y:drag.targetY,buttons:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:drag.targetX,y:drag.targetY,button:'left',clickCount:1});
    const dragged=await evaluate(`new Promise(resolve=>setTimeout(()=>resolve(Number($('#distance').value)),100))`);
    assert.ok(Math.abs(dragged-200)<=2,`drag distance: ${dragged}; ${JSON.stringify(drag)}; ${anchor}`);
    return dragged;
    };
    const dragged=await performDrag();
    await evaluate(`(async()=>{$('#perceptionEnabled').checked=false;$('#distance').value=100;animalWorldX=2;render();while($('#animalCanvas').dataset.drawVersion!==String(drawVersion))await new Promise(r=>setTimeout(r,10))})()`);
    const trackedDragged=await performDrag();
    const centred=await evaluate(`({x:$('#animalCanvas').dataset.animalX,y:$('#animalCanvas').dataset.animalY})`);
    assert.deepEqual(centred,{x:'0.5000',y:'0.5000'});
    assert.deepEqual(errors,[]);
    await evaluate(`$('#distance').value=100;animalWorldX=0;render();`);
    if(process.env.AUDIT_SCREENSHOT){
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
      fs.writeFileSync(process.env.AUDIT_SCREENSHOT,Buffer.from(shot.result.data,'base64'));
    }
    await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:false});
    await evaluate(`document.querySelectorAll('details').forEach(d=>d.open=true)`);
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const mobile=await evaluate(`(()=>{
      const r=$('#animalCanvas').getBoundingClientRect(),v=values(),frame=perceptionFrame(v,calc(35,v));
      return {width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,canvasWidth:r.width,aspectError:Math.abs(r.width/r.height-frame.w/frame.h),overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right+scrollX>document.documentElement.clientWidth+1).map(e=>({tag:e.tagName,cls:e.className,id:e.id})).slice(0,15)};
    })()`);
    assert.ok(mobile.scrollWidth<=mobile.width+1,JSON.stringify(mobile));
    assert.ok(mobile.canvasWidth<=mobile.width&&mobile.aspectError<.01,JSON.stringify(mobile));
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    console.log(JSON.stringify({...result,pointerDragDistance:dragged,trackedDragDistance:trackedDragged,mobileWidth:mobile.width,runtimeErrors:errors.length},null,2));
  }finally{ws.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
