const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../docs/app.js'),'utf8')
  .split("$('#animalCanvas').addEventListener('pointerdown'")[0];
const context=vm.createContext({});
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const base={rw:640,rh:512,pitch:12,d:100,z:1};

test('manufacturer reference: 640 × 512, 12 µm, 35 mm, 100 m',()=>{
  context.v=base;
  const c=run('calc(35,v)');
  close(c.sw,7.68);close(c.sh,6.144);
  assert.equal(c.hdeg.toFixed(2),'12.52');assert.equal(c.vdeg.toFixed(2),'10.03');
  close(c.w,21.942857142857143);close(c.h,17.554285714285715);
  close(c.ifov,12/35);close(1.5/c.opticalW*640,43.75);
});

test('720 sensor/distance/lens/zoom combinations preserve optical scale',()=>{
  const presets=[[256,192,12],[320,240,12],[384,288,12],[384,288,17],
    [400,300,12],[640,480,17],[640,512,12],[1280,1024,12]];
  for(const [rw,rh,pitch] of presets)for(const d of [10,50,100,250,500])
    for(const z of [1,2,8])for(const f of [1,3.2,9.1,35,50,300]){
      context.v={rw,rh,pitch,d,z};context.f=f;
      const c=run('calc(f,v)');
      close(c.w,d*rw*pitch/1000/f/z);close(c.h,d*rh*pitch/1000/f/z);
      close(c.w/c.h,rw/rh);close(c.opticalW,c.w*z);
      close(c.opticalW/rw,d*pitch/1000/f);
    }
});

test('animal feet and ground use one eye height, with an invertible drag projection',()=>{
  for(const h of [.5,.9,1.22,2.18])for(const d of [10,50,100,250,500])
    for(const zoom of [1,2,8]){
      context.v={...base,z:zoom};context.d=d;context.h=h;
      run('selectedAnimal.h=h');
      const frame={w:base.d*7.68/35/zoom,h:base.d*6.144/35/zoom};
      context.frame=frame;
      const center=run('animalGroundY(d,v,frame)');
      close(center+h/2/(frame.h*d/base.d),run('groundY(d,v,frame)'));
      close((run('groundY(d,v,frame)')-.5)*(frame.h*d/base.d),1.6);
      context.y=center;close(run('distanceAtGroundY(y,v,frame)'),d);
    }
});

test('world positions stay fixed when the camera field changes',()=>{
  context.item={x:.73,d:120};context.fieldW=40;
  const offset=run('sceneObjectX(item,fieldW)-.5');
  context.fieldW=20;close(run('sceneObjectX(item,fieldW)-.5'),offset*2);
  context.item={x:.5,d:120};close(run('sceneObjectX(item,fieldW)'),.5);
});

test('small lengths and pixel footprints never round to zero',()=>{
  for(const value of [.00002,.000167,.00167,.009,.012,.5]){
    context.measurement=value;
    for(const formatter of ['fmtLength','fmtSpatial','fmtPerception']){
      const formatted=run(`${formatter}(measurement)`);
      assert.ok(Number(formatted.replaceAll('.','').replace(',','.'))>0,formatted);
    }
  }
});

test('vegetation spans the ground area with separated trunks and varied growth',()=>{
  const trees=run('treeLayout'),plants=run('fieldPlantLayout');
  assert.ok(trees.length>=250);assert.equal(plants.length,3000);
  for(const layout of [trees,plants]){
    assert.ok(layout.every(item=>Number.isFinite(item.worldX)&&item.d>=10&&item.d<=500));
    assert.equal(Math.min(...layout.slice(0,30).map(item=>item.d)),10);
    assert.equal(Math.max(...layout.slice(0,30).map(item=>item.d)),500);
  }
  assert.ok(trees.some(t=>t.h<8)&&trees.some(t=>t.h>18));
  assert.ok(trees.slice(0,120).some(t=>Math.abs(t.worldX)<2),'centre contains trees at 40 percent density');
  for(let i=0;i<trees.length;i++)for(let j=0;j<i;j++)
    assert.ok(Math.hypot(trees[i].worldX-trees[j].worldX,trees[i].d-trees[j].d)>=1.8);
  assert.ok(plants.some(p=>p.worldX<0)&&plants.some(p=>p.worldX>0));
  assert.ok(plants.filter(p=>p.kind==='bush').length<plants.length*.1);
});

test('vegetation density uses valid steps of ten with zero as fallback',()=>{
  for(const [input,expected] of [[8,10],[44,40],[55,60],[-20,0],[150,100],[NaN,0]]){
    context.density=input;assert.equal(run('snapTen(density)'),expected);
  }
});

test('camera view tracks the animal without changing scale or ground contact',()=>{
  context.document={querySelector:()=>({checked:false})};
  for(const height of [.5,.9,2.18])for(const d of [10,100,500])
    for(const x of [-4,0,4])for(const z of [1,8]){
      context.v={...base,d,z};context.height=height;context.x=x;
      run('selectedAnimal.h=height;animalWorldX=x');
      const c=run('calc(35,v)');context.c=c;
      const frame=run('perceptionFrame(v,c)');context.frame=frame;
      close(run('animalScreenX(v,frame)'),.5);close(run('animalGroundY(v.d,v,frame)'),.5);
      close(frame.w,c.w);close(frame.h,c.h);
      close(run('groundY(v.d,v,frame)'),.5+height/(2*frame.h));
      for(const distance of [10,200,500]){
        context.distance=distance;
        context.y=run('animalGroundY(distance,v,frame)');
        close(run('distanceAtGroundY(y,v,frame)'),distance);
      }
      context.item={worldX:x,d};
      close(run('sceneObjectX(item,frame.w,v,frame)'),.5);
    }
  context.document={querySelector:()=>({checked:true})};
  assert.equal(run('perceptionFrame(v,c).aimX'),undefined);
});

test('background tree line keeps its 500 metre scale and ground anchor',()=>{
  for(const sceneName of ['forest','field'])for(const d of [10,100,500])
    for(const z of [1,8])for(const aimY of [0,.012]){
      context.v={...base,d,z};context.aimY=aimY;context.sceneName=sceneName;
      run('frame={...calc(35,v),aimY,aimX:.02};scene=sceneBackgrounds[sceneName]');
      const p=run('backgroundPlacement(v,frame,640,512,{width:1536,height:1024},scene)');
      const scene=run('scene'),frame=run('frame');
      close(p.scaleY*scene.treePixels,scene.treeHeight/(frame.h*500/d)*512);
      close(p.y+p.scaleY*scene.basePixelY,run('groundY(500,v,frame)*512'));
      close(p.scaleX/p.scaleY,(640/frame.w)/(512/frame.h));
    }
});
