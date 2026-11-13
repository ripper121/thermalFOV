const $ = (s) => document.querySelector(s);
const colors = ['#ff5b2e','#ffb020','#75b8ff','#71d6a6','#d18cff'];
const sceneBackgrounds = {
  forest:{src:'assets/background-forest-white-hot.png',focusY:.45},
  field:{src:'assets/background-field-white-hot.png',focusY:.49},
  none:{src:null,focusY:.5}
};
const animals = [
  {id:'boar',name:'Wildschwein',w:1.5,img:'assets/thermal-animal-wild-boar.png'},
  {id:'deer',name:'Rothirsch',w:2.1,img:'assets/thermal-animal-red-deer.png'},
  {id:'roe',name:'Rehwild',w:1.2,img:'assets/thermal-animal-roe-deer.png'},
  {id:'fox',name:'Rotfuchs',w:.9,img:'assets/thermal-animal-red-fox.png'}
];
const treeSprites = {
  conifer:'assets/thermal-tree-conifer.png',
  deciduous:'assets/thermal-tree-deciduous.png'
};
const fieldSprites = {
  bush:'assets/thermal-field-bush.png',
  beet:'assets/thermal-field-beet.png',
  rapeseed:'assets/thermal-field-rapeseed.png'
};
// Alpha bounds measured from the source PNGs: x, y, width, height.
// Keep pixel reads out of the app so local-file previews also work.
const spriteBounds = {
  'assets/thermal-animal-wild-boar.png':[37,37,1468,876],
  'assets/thermal-animal-red-deer.png':[25,25,956,991],
  'assets/thermal-animal-roe-deer.png':[25,25,990,1007],
  'assets/thermal-animal-red-fox.png':[38,38,1527,858],
  'assets/thermal-tree-conifer.png':[0,0,1016,1536],
  'assets/thermal-tree-deciduous.png':[0,0,1312,1199],
  'assets/thermal-field-bush.png':[0,0,1535,1024],
  'assets/thermal-field-beet.png':[19,24,1798,833],
  'assets/thermal-field-rapeseed.png':[31,19,1737,868]
};
const humanPerception = {name:'Vergleichsausschnitt',ha:39.6,va:27};
const observerHeight = 1.6;
function fixedUnit(index,salt){const value=Math.sin((index+1)*12.9898+salt*78.233)*43758.5453;return value-Math.floor(value)}
// Fixed positions keep the forest identical across renders and page reloads.
// Dimensions and depths are in metres; x is normalized in the reference frame.
const treeLayoutBase = [
  {x:.08,d:10,h:14,w:5,kind:'deciduous'},
  {x:.89,d:80,h:16,w:5.5,kind:'conifer'},
  {x:.24,d:150,h:12,w:4,kind:'conifer'},
  {x:.72,d:220,h:17,w:6.5,kind:'deciduous'},
  {x:.42,d:290,h:14,w:4.5,kind:'conifer'},
  {x:.96,d:360,h:18,w:7,kind:'deciduous'},
  {x:.58,d:430,h:11,w:3.8,kind:'conifer'},
  {x:.14,d:500,h:15,w:5.5,kind:'deciduous'},
  {x:.81,d:45,h:13,w:4.2,kind:'conifer'},
  {x:.33,d:115,h:18,w:7,kind:'deciduous'},
  {x:.65,d:185,h:15,w:5,kind:'conifer'},
  {x:.03,d:255,h:16,w:6,kind:'deciduous'},
  {x:.51,d:325,h:12,w:4,kind:'conifer'},
  {x:.92,d:395,h:17,w:6.5,kind:'deciduous'},
  {x:.19,d:465,h:13,w:4.5,kind:'conifer'},
  {x:.76,d:60,h:15,w:5.5,kind:'deciduous'},
  {x:.47,d:200,h:15,w:5.5,kind:'deciduous'},
  {x:.11,d:340,h:11,w:3.8,kind:'conifer'},
  {x:.86,d:450,h:14,w:4.8,kind:'conifer'},
  {x:.38,d:490,h:16,w:6,kind:'deciduous'}
];
const treeLayout=[...treeLayoutBase,...Array.from({length:80},(_,offset)=>{
  const index=offset+treeLayoutBase.length,kind=index%3===0?'deciduous':'conifer';
  const h=(kind==='deciduous'?11:10)+fixedUnit(index,3)*(kind==='deciduous'?8:7);
  return {x:.02+fixedUnit(index,1)*.96,d:Math.round(10+fixedUnit(index,2)*490),h,w:h*(kind==='deciduous'?.34+.1*fixedUnit(index,4):.28+.08*fixedUnit(index,4)),kind};
})];
// Fixed field vegetation from near foreground to the distant field edge.
const fieldPlantLayoutBase = [
  {x:.08,d:10,h:1.4,w:2.2,kind:'bush'},
  {x:.88,d:80,h:.55,w:1.1,kind:'beet'},
  {x:.24,d:150,h:.7,w:1.4,kind:'rapeseed'},
  {x:.68,d:220,h:1.1,w:1.8,kind:'bush'},
  {x:.43,d:290,h:.5,w:1,kind:'beet'},
  {x:.95,d:360,h:.65,w:1.3,kind:'rapeseed'},
  {x:.5,d:430,h:1.5,w:2.4,kind:'bush'},
  {x:.14,d:500,h:.48,w:.95,kind:'beet'},
  {x:.79,d:45,h:.62,w:1.2,kind:'rapeseed'},
  {x:.34,d:115,h:1.2,w:2,kind:'bush'},
  {x:.63,d:185,h:.52,w:1,kind:'beet'},
  {x:.03,d:255,h:.68,w:1.35,kind:'rapeseed'},
  {x:.49,d:325,h:.6,w:1.2,kind:'rapeseed'},
  {x:.19,d:395,h:1.3,w:2.1,kind:'bush'},
  {x:.91,d:465,h:.5,w:1,kind:'beet'},
  {x:.73,d:60,h:.7,w:1.4,kind:'rapeseed'},
  {x:.39,d:200,h:1.45,w:2.3,kind:'bush'},
  {x:.12,d:340,h:.52,w:1.05,kind:'beet'},
  {x:.84,d:450,h:.65,w:1.3,kind:'rapeseed'},
  {x:.52,d:490,h:1.25,w:2,kind:'bush'}
];
const fieldPlantKinds=['bush','beet','rapeseed'];
const fieldPlantLayout=[...fieldPlantLayoutBase,...Array.from({length:80},(_,offset)=>{
  const index=offset+fieldPlantLayoutBase.length,kind=fieldPlantKinds[index%fieldPlantKinds.length];
  const h=kind==='bush'?.9+fixedUnit(index,7)*.8:kind==='beet'?.35+fixedUnit(index,7)*.25:.45+fixedUnit(index,7)*.3;
  const w=kind==='bush'?h*(1.4+fixedUnit(index,8)*.35):kind==='beet'?.65+fixedUnit(index,8)*.5:.8+fixedUnit(index,8)*.65;
  return {x:.02+fixedUnit(index,5)*.96,d:Math.round(10+fixedUnit(index,6)*490),h,w,kind};
})];
let lenses = [35,50];
let selectedAnimal = animals[0];
let selectedScene = 'forest';
let drawVersion = 0;
let animalWorldX = 0;
let animalBounds = null;
let animalDrag = null;
let pendingDragPoint = null;
let dragAnimationFrame = 0;
let assetsReady = false;
const rasterCache = new Map();
const netdNoiseCache = new Map();

function lensRow(value,index){
  const row=document.createElement('div'); row.className='lens-row'; row.style.setProperty('--lens',colors[index%colors.length]);
  row.innerHTML=`<span class="dot"></span><input aria-label="Brennweite ${index+1}" type="number" min="1" max="300" step="any" value="${value}"><button aria-label="Brennweite entfernen" type="button">×</button>`;
  row.querySelector('input').addEventListener('input',e=>{lenses[index]=e.target.valueAsNumber;render()});
  row.querySelector('button').addEventListener('click',()=>{if(lenses.length>1){lenses.splice(index,1);renderLensList();render()}});
  return row;
}
function renderLensList(){const list=$('#lensList');list.innerHTML='';lenses.forEach((l,i)=>list.append(lensRow(l,i)))}
function renderAnimals(){const picker=$('#animalPicker');picker.innerHTML='';animals.forEach(a=>{const b=document.createElement('button');b.type='button';b.className='animal-card'+(a.id===selectedAnimal.id?' active':'');b.innerHTML=`<img src="${a.img}" alt="${a.name}"><span class="animal-info"><strong>${a.name}</strong><small>${a.size}</small></span>`;b.addEventListener('click',()=>{selectedAnimal=a;renderAnimals();render()});picker.append(b)})}
function loadRaster(src){
  if(!src)return Promise.resolve(null);
  if(!rasterCache.has(src))rasterCache.set(src,new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{try{
      // Dimensions refer to the visible silhouette, never transparent PNG padding.
      const [left,top,width,height]=spriteBounds[src]||[0,0,img.width,img.height];
      const cropped=document.createElement('canvas');cropped.width=width;cropped.height=height;
      cropped.getContext('2d').drawImage(img,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
      resolve(cropped);
    }catch(error){reject(new Error(`Grafik nicht lesbar: ${src}. ${error.message}`))}};
    img.onerror=()=>reject(new Error(`Grafik konnte nicht geladen werden: ${src}`));img.src=src;
  }));
  return rasterCache.get(src);
}
function netdNoiseTexture(width,height){
  const key=`${width}x${height}`;
  if(netdNoiseCache.has(key))return netdNoiseCache.get(key);
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d'),image=ctx.createImageData(width,height),data=image.data;
  let seed=(width*73856093^height*19349663^0x9e3779b9)>>>0;
  for(let i=0;i<width*height;i++){
    let sum=0;
    for(let sample=0;sample<6;sample++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;sum+=(seed>>>0)/4294967296}
    const value=clamp(Math.round(128+(sum/6-.5)*320),0,255),offset=i*4;
    data[offset]=value;data[offset+1]=value;data[offset+2]=value;data[offset+3]=255;
  }
  ctx.putImageData(image,0,0);netdNoiseCache.set(key,canvas);
  if(netdNoiseCache.size>12)netdNoiseCache.delete(netdNoiseCache.keys().next().value);
  return canvas;
}
function applyNetdNoise(ctx,v){
  if(v.netd===null)return;
  const {width,height}=ctx.canvas,texture=netdNoiseTexture(width,height);
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=clamp(v.netd/300,.04,.18);ctx.imageSmoothingEnabled=false;ctx.drawImage(texture,0,0);ctx.restore();
}
function drawTree(ctx,tree,v,frame,index,sprite){
  const fieldW=frame.w*tree.d/v.d,fieldH=frame.h*tree.d/v.d,canvas=ctx.canvas;
  const w=tree.w/fieldW*canvas.width,h=tree.h/fieldH*canvas.height,x=sceneObjectX(tree,fieldW)*canvas.width;
  const baseY=groundY(tree.d,v,frame)*canvas.height;
  ctx.save();
  ctx.globalAlpha=1;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(index%2){ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(sprite,-w/2,baseY-h,w,h)}
  else ctx.drawImage(sprite,x-w/2,baseY-h,w,h);
  ctx.restore();
}
function drawFieldPlant(ctx,plant,v,frame,index,sprite){
  const fieldW=frame.w*plant.d/v.d,fieldH=frame.h*plant.d/v.d,canvas=ctx.canvas;
  const w=plant.w/fieldW*canvas.width,h=plant.h/fieldH*canvas.height,x=sceneObjectX(plant,fieldW)*canvas.width;
  const baseY=groundY(plant.d,v,frame)*canvas.height;
  ctx.save();ctx.globalAlpha=1;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(index%2){ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(sprite,-w/2,baseY-h,w,h)}
  else ctx.drawImage(sprite,x-w/2,baseY-h,w,h);
  ctx.restore();
}
function forestTreeCount(){return selectedScene==='forest'?$('#treeCount').valueAsNumber:0}
function fieldPlantCount(){return selectedScene==='field'?$('#fieldPlantCount').valueAsNumber:0}
function updateSceneControls(){
  $('#treeControl').hidden=selectedScene!=='forest';
  $('#fieldPlantControl').hidden=selectedScene!=='field';
  $('#treeCountLabel').textContent=$('#treeCount').valueAsNumber;
  $('#fieldPlantCountLabel').textContent=$('#fieldPlantCount').valueAsNumber;
}
function restoreSceneCounts(){
  let trees=8,plants=8;
  try{
    const storedTrees=localStorage.getItem('thermalFovTreeCount'),storedPlants=localStorage.getItem('thermalFovFieldPlantCount');
    if(storedTrees!==null)trees=clamp(Number(storedTrees),0,treeLayout.length);
    if(storedPlants!==null)plants=clamp(Number(storedPlants),0,fieldPlantLayout.length);
  }catch{}
  $('#treeCount').max=treeLayout.length;$('#treeCount').value=Number.isFinite(trees)?trees:8;
  $('#fieldPlantCount').max=fieldPlantLayout.length;$('#fieldPlantCount').value=Number.isFinite(plants)?plants:8;
  updateSceneControls();
}
function perceptionFrame(v,cameraOuter){
  if(!$('#perceptionEnabled').checked)return {name:'Kamerasichtfeld',ha:cameraOuter.hdeg,va:cameraOuter.vdeg,w:cameraOuter.w,h:cameraOuter.h,isPerception:false};
  const mode=humanPerception;
  return {...mode,w:2*v.d*Math.tan(mode.ha*Math.PI/360),h:2*v.d*Math.tan(mode.va*Math.PI/360),isPerception:true};
}
// Horizontal optical axis, flat ground; distance is depth along that axis.
function groundY(distance,v,frame){return .5+observerHeight/(frame.h*distance/v.d)}
function animalGroundY(distance,v,frame){return .5+(observerHeight-selectedAnimal.h/2)/(frame.h*distance/v.d)}
function distanceAtGroundY(y,v,frame){
  return clamp((observerHeight-selectedAnimal.h/2)/(Math.max(.000001,y-.5)*(frame.h/v.d)),10,500);
}
function sceneObjectX(item,fieldW){
  const worldX=(item.x-.5)*2*item.d*Math.tan(humanPerception.ha*Math.PI/360);
  return .5+worldX/fieldW;
}
function drawGround(ctx,v,frame,background){
  const {width,height}=ctx.canvas;
  ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);
  if(selectedScene==='none')return;
  const sky=ctx.createLinearGradient(0,0,0,height/2);sky.addColorStop(0,'#121212');sky.addColorStop(1,'#292929');
  ctx.fillStyle=sky;ctx.fillRect(0,0,width,height/2);
  const ground=ctx.createLinearGradient(0,height/2,0,height);ground.addColorStop(0,'#353535');ground.addColorStop(1,'#505050');
  ctx.fillStyle=ground;ctx.fillRect(0,height/2,width,height/2);
  if(background){
    // Decorative scenery; align its meadow transition with the ground horizon.
    const focus=background.height*sceneBackgrounds[selectedScene].focusY;
    const angularScale=Math.tan(humanPerception.ha*Math.PI/360)/(frame.w/(2*v.d));
    const scale=Math.max(width/background.width*angularScale,width/background.width,height/2/focus,height/2/(background.height-focus));
    const imageW=background.width*scale,imageH=background.height*scale;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(background,(width-imageW)/2,height/2-focus*scale,imageW,imageH);
    ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(0,0,width,height);
  }
  // Ground lines share the exact same projection as the feet of every object.
  ctx.strokeStyle='#ffffff18';ctx.lineWidth=1;
  for(const distance of [10,20,50,100,200,500,1000]){
    const y=groundY(distance,v,frame)*height;
    if(y>height)continue;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();
  }
}
async function drawPixelScene(v,frame,cameraOuter){
  const version=++drawVersion,canvas=$('#animalCanvas'),displayCtx=canvas.getContext('2d'),animal=selectedAnimal;
  const ratio=frame.w/frame.h;
  canvas.width=frame.isPerception?1000:v.rw;
  canvas.height=frame.isPerception?Math.round(canvas.width/ratio):v.rh;
  animalBounds=null;
  const [animalImg,coniferImg,deciduousImg,bushImg,beetImg,rapeseedImg,backgroundImg]=await Promise.all([loadRaster(animal.img),loadRaster(selectedScene==='forest'?treeSprites.conifer:null),loadRaster(selectedScene==='forest'?treeSprites.deciduous:null),loadRaster(selectedScene==='field'?fieldSprites.bush:null),loadRaster(selectedScene==='field'?fieldSprites.beet:null),loadRaster(selectedScene==='field'?fieldSprites.rapeseed:null),loadRaster(sceneBackgrounds[selectedScene].src)]);if(version!==drawVersion)return;
  const visibleTrees=treeLayout.slice(0,forestTreeCount()).map((tree,index)=>({...tree,index})).sort((a,b)=>b.d-a.d);
  const visiblePlants=fieldPlantLayout.slice(0,fieldPlantCount()).map((plant,index)=>({...plant,index})).sort((a,b)=>b.d-a.d);
  const fieldImages={bush:bushImg,beet:beetImg,rapeseed:rapeseedImg};
  const drawScene=(ctx,sceneFrame)=>{
    drawGround(ctx,v,sceneFrame,backgroundImg);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const drawVegetation=predicate=>{
      visibleTrees.filter(predicate).forEach(tree=>drawTree(ctx,tree,v,sceneFrame,tree.index,tree.kind==='conifer'?coniferImg:deciduousImg));
      visiblePlants.filter(predicate).forEach(plant=>drawFieldPlant(ctx,plant,v,sceneFrame,plant.index,fieldImages[plant.kind]));
    };
    drawVegetation(item=>item.d>=v.d);
    const w=animal.w/sceneFrame.w*ctx.canvas.width,h=animal.h/sceneFrame.h*ctx.canvas.height;
    const centerX=(.5+animalWorldX/sceneFrame.w)*ctx.canvas.width,centerY=animalGroundY(v.d,v,sceneFrame)*ctx.canvas.height;
    ctx.drawImage(animalImg,centerX-w/2,centerY-h/2,w,h);
    drawVegetation(item=>item.d<v.d);
  };
  // Context is geometric; the entire camera image is sampled on one sensor grid.
  drawScene(displayCtx,frame);
  const sensor=document.createElement('canvas');sensor.width=v.rw;sensor.height=v.rh;
  const sensorCtx=sensor.getContext('2d');
  drawScene(sensorCtx,{w:cameraOuter.opticalW,h:cameraOuter.opticalH});
  applyNetdNoise(sensorCtx,v);
  const opticalW=cameraOuter.opticalW/frame.w*canvas.width,opticalH=cameraOuter.opticalH/frame.h*canvas.height;
  const displayW=cameraOuter.w/frame.w*canvas.width,displayH=cameraOuter.h/frame.h*canvas.height;
  displayCtx.save();displayCtx.beginPath();displayCtx.rect((canvas.width-displayW)/2,(canvas.height-displayH)/2,displayW,displayH);displayCtx.clip();
  displayCtx.imageSmoothingEnabled=false;
  displayCtx.drawImage(sensor,(canvas.width-opticalW)/2,(canvas.height-opticalH)/2,opticalW,opticalH);
  displayCtx.restore();
  const w=animal.w/frame.w*canvas.width,h=animal.h/frame.h*canvas.height;
  const centerX=(.5+animalWorldX/frame.w)*canvas.width,centerY=animalGroundY(v.d,v,frame)*canvas.height,left=centerX-w/2,top=centerY-h/2;
  animalBounds={left,top,right:left+w,bottom:top+h,centerX,centerY,w,h};
  canvas.dataset.animalX=(centerX/canvas.width).toFixed(4);canvas.dataset.animalY=(centerY/canvas.height).toFixed(4);canvas.dataset.animalDistance=String(v.d);
  canvas.dataset.previewLens=String(cameraOuter.f);
  canvas.dataset.netd=v.netd===null?'off':String(v.netd);
  canvas.dataset.drawVersion=String(version);
}
function clamp(n,min,max){return Math.min(max,Math.max(min,n))}
function values(){
  const inputs=[...document.querySelectorAll('.controls input[type="number"]')];
  const invalid=inputs.find(input=>!input.checkValidity()||!Number.isFinite(input.valueAsNumber));
  inputs.forEach(input=>input.setAttribute('aria-invalid',String(!input.checkValidity()||!Number.isFinite(input.valueAsNumber))));
  $('#inputError').textContent=invalid?'Bitte alle Zahlenfelder ausfüllen und die angegebenen Eingabegrenzen beachten.':'';
  if(invalid)return null;
  const netdValue=$('#netd').value;
  return {rw:$('#resW').valueAsNumber,rh:$('#resH').valueAsNumber,pitch:$('#pitch').valueAsNumber,d:$('#distance').valueAsNumber,z:$('#digitalZoom').valueAsNumber,netd:netdValue==='off'?null:Number(netdValue)};
}
function calc(f,v){const sw=v.rw*v.pitch/1000,sh=v.rh*v.pitch/1000,sd=Math.hypot(sw,sh);const ha=2*Math.atan(sw/(2*f)),va=2*Math.atan(sh/(2*f)),da=2*Math.atan(sd/(2*f));const opticalW=2*v.d*Math.tan(ha/2),opticalH=2*v.d*Math.tan(va/2);const displayHa=2*Math.atan(Math.tan(ha/2)/v.z),displayVa=2*Math.atan(Math.tan(va/2)/v.z),displayDa=2*Math.atan(Math.tan(da/2)/v.z);return {f,sw,sh,ha,va,da,opticalW,opticalH,w:opticalW/v.z,h:opticalH/v.z,hdeg:displayHa*180/Math.PI,vdeg:displayVa*180/Math.PI,ddeg:displayDa*180/Math.PI,ifov:v.pitch/1000/f*1000}}
function fmt(n,d=1){return n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d})}
function fmtLength(n){return fmt(n,n<.01?5:n<1?3:1)}
function fmtSpatial(n){return fmt(n,n<.001?6:n<.01?5:3)}
function fmtPerception(n){return fmt(n,n<.01?5:n<1?3:n<10?1:0)}
function fmtPx(n){return n<10?fmt(n,1):Math.round(n).toLocaleString('de-DE')}
function renderDistanceScale(){
  const scale=$('#distanceScale');
  scale.innerHTML=Array.from({length:50},(_,i)=>{const m=10+i*10,pct=(m-10)/490*100,major=m===10||m%50===0;return `<span class="distance-tick${major?' major':''}" style="left:${pct}%" title="${m} m">${major?`<b>${m}</b>`:''}</span>`}).join('');
}
function render(){
  if(!assetsReady)return;
  const v=values();
  $('#viewport').hidden=!v;
  if(!v){++drawVersion;$('#results').innerHTML='';$('#sensorSize').textContent='—';return}
  const cs=lenses.map(f=>calc(f,v)),cameraOuter=cs.reduce((a,b)=>a.w>b.w?a:b),frame=perceptionFrame(v,cameraOuter),perceptionEnabled=frame.isPerception;
  const previewSelect=$('#previewLens'),previewIndex=clamp(Number(previewSelect.value)||0,0,cs.length-1);
  previewSelect.innerHTML=cs.map((c,i)=>`<option value="${i}">${fmt(c.f,1)} mm</option>`).join('');previewSelect.value=String(previewIndex);
  const previewCamera=cs[previewIndex];
  const viewport=$('#viewport'),ratio=frame.w/frame.h,gridRows=16/ratio;
  viewport.style.setProperty('--sensor-ratio',ratio);
  viewport.style.setProperty('--grid-x','6.25%');
  viewport.style.setProperty('--grid-y',`${100/gridRows}%`);
  const netdText=v.netd===null?'NETD Aus':`${v.netd} mK`;
  $('#distanceLabel').textContent=v.d;$('#chipDistance').textContent=`${v.d} m`;$('#resolutionLabel').textContent=`${v.rw} × ${v.rh} px`;$('#zoomLabel').textContent=`${fmt(v.z,1)}×`;$('#zoomChip').textContent=`White Hot · ${fmt(v.z,1)}× · ${netdText}`;$('#netdLabel').textContent=v.netd===null?'Aus':`${v.netd} mK`;$('#sensorSize').textContent=`${fmt(cameraOuter.sw,2)} × ${fmt(cameraOuter.sh,2)} mm`;
  $('#perceptionName').textContent=perceptionEnabled?`${frame.name} (${fmt(frame.ha)}° × ${fmt(frame.va)}°)`:`Aus · ${frame.name} (${fmt(frame.ha)}° × ${fmt(frame.va)}°)`;$('#perceptionSize').textContent=`${fmtPerception(frame.w)} × ${fmtPerception(frame.h)} m`;
  $('#perceptionToggleLabel').textContent=perceptionEnabled?'Ein':'Aus';$('.perception-control').classList.toggle('is-off',!perceptionEnabled);
  const layers=$('#fovLayers');layers.innerHTML='';
  cs.slice().sort((a,b)=>b.w-a.w).forEach(c=>{const el=document.createElement('div'),i=cs.indexOf(c);el.className='fov-layer';el.style.setProperty('--lens',colors[i%colors.length]);el.style.width=`${(c.w/frame.w)*100}%`;el.style.height=`${(c.h/frame.h)*100}%`;el.dataset.label=`${c.f} mm${i===previewIndex?' (Vorschau)':''} · ${fmtLength(c.w)} × ${fmtLength(c.h)} m · ${fmt(v.z,1)}×`;layers.append(el)});
  $('#axisX').textContent=`↔ ${fmtPerception(frame.w)} m`;$('#axisY').textContent=`↕ ${fmtPerception(frame.h)} m`;
  const sceneLabel=selectedScene==='forest'?`Wald mit ${forestTreeCount()} zusätzlichen Bäumen`:selectedScene==='field'?`Feld mit ${fieldPlantCount()} zusätzlichen Pflanzen`:'schwarzem Hintergrund';
  const av=$('#animalVisual');av.title=`${selectedAnimal.name}: ${selectedAnimal.size}. Ziehen zum Verschieben und Ändern der Entfernung.`;$('#animalCanvas').setAttribute('aria-label',`${selectedAnimal.name} vor ${sceneLabel} im ${frame.name}, White Hot. Mit der Maus verschiebbar; die Höhe bestimmt die Entfernung.`);drawPixelScene(v,frame,previewCamera).catch(error=>{$('#inputError').textContent=error.message});
  $('#results').innerHTML=cs.map((c,i)=>{const animalPxW=selectedAnimal.w/c.w*v.rw,animalPxH=selectedAnimal.h/c.h*v.rh,nativePxW=selectedAnimal.w/c.opticalW*v.rw,nativePxH=selectedAnimal.h/c.opticalH*v.rh;return `<article class="result-card" style="--lens:${colors[i%colors.length]}"><header><strong>${c.f} mm · ${fmt(v.z,1)}×</strong><span>H ${fmt(c.hdeg)}° · V ${fmt(c.vdeg)}° · D ${fmt(c.ddeg)}°</span></header><div class="metrics"><div class="metric"><span>FOV Breite</span><b>${fmtLength(c.w)} m</b></div><div class="metric"><span>FOV Höhe</span><b>${fmtLength(c.h)} m</b></div><div class="metric"><span>Anzeige m / px</span><b>${fmtSpatial(c.w/v.rw)}</b></div><div class="metric"><span>Nativ m / px</span><b>${fmtSpatial(c.opticalW/v.rw)}</b></div><div class="metric"><span>IFOV</span><b>${fmt(c.ifov,c.ifov<.1?3:2)} mrad</b></div><div class="metric animal-pixels"><span>${selectedAnimal.name} im Bild</span><b>${fmtPx(animalPxW)} × ${fmtPx(animalPxH)} px</b><small>Nativ erfasst: ${fmtPx(nativePxW)} × ${fmtPx(nativePxH)} Sensorpixel</small></div></div></article>`}).join('');
  const pct=(v.d-10)/490*100;$('#distance').style.background=`linear-gradient(90deg,var(--heat) ${pct}%,#343a45 ${pct}%)`;
}

function canvasPoint(event){
  const canvas=$('#animalCanvas'),rect=canvas.getBoundingClientRect();
  return {x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
}
function pointHitsAnimal(point){
  if(!animalBounds)return false;
  const padding=Math.max(18,Math.min(animalBounds.w,animalBounds.h)*.5);
  return point.x>=animalBounds.left-padding&&point.x<=animalBounds.right+padding&&point.y>=animalBounds.top-padding&&point.y<=animalBounds.bottom+padding;
}
function applyAnimalDrag(){
  dragAnimationFrame=0;
  if(!animalDrag||!pendingDragPoint)return;
  const canvas=$('#animalCanvas'),point=pendingDragPoint;
  pendingDragPoint=null;
  const v=values();if(!v)return;
  const cameraOuter=lenses.map(f=>calc(f,v)).reduce((a,b)=>a.w>b.w?a:b),frame=perceptionFrame(v,cameraOuter);
  const centerY=clamp((point.y-animalDrag.offsetY)/canvas.height,animalGroundY(500,v,frame),animalGroundY(10,v,frame));
  const distance=Math.round(distanceAtGroundY(centerY,v,frame));
  animalWorldX=(clamp((point.x-animalDrag.offsetX)/canvas.width,0,1)-.5)*frame.w*distance/v.d;
  $('#distance').value=String(distance);
  render();
}
function finishAnimalDrag(event){
  if(!animalDrag||event.pointerId!==animalDrag.pointerId)return;
  if(dragAnimationFrame){cancelAnimationFrame(dragAnimationFrame);applyAnimalDrag()}
  const canvas=$('#animalCanvas');
  if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  animalDrag=null;pendingDragPoint=null;$('#animalVisual').classList.remove('dragging');
}

$('#animalCanvas').addEventListener('pointerdown',event=>{
  const point=canvasPoint(event);
  if(!pointHitsAnimal(point))return;
  animalDrag={pointerId:event.pointerId,offsetX:point.x-animalBounds.centerX,offsetY:point.y-animalBounds.centerY};
  pendingDragPoint=point;event.currentTarget.setPointerCapture(event.pointerId);$('#animalVisual').classList.add('dragging');event.preventDefault();
});
$('#animalCanvas').addEventListener('pointermove',event=>{
  if(!animalDrag){$('#animalVisual').classList.toggle('can-drag',pointHitsAnimal(canvasPoint(event)));return}
  if(event.pointerId!==animalDrag.pointerId)return;
  pendingDragPoint=canvasPoint(event);
  if(!dragAnimationFrame)dragAnimationFrame=requestAnimationFrame(applyAnimalDrag);
  event.preventDefault();
});
$('#animalCanvas').addEventListener('pointerup',finishAnimalDrag);
$('#animalCanvas').addEventListener('pointercancel',finishAnimalDrag);
$('#animalCanvas').addEventListener('pointerleave',()=>{if(!animalDrag)$('#animalVisual').classList.remove('can-drag')});

$('#preset').addEventListener('change',e=>{if(e.target.value==='custom')return;const [w,h,p]=e.target.value.split(',');$('#resW').value=w;$('#resH').value=h;$('#pitch').value=p;render()});
['resW','resH','pitch'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#preset').value='custom';render()}));
$('#distance').addEventListener('input',render);
$('#digitalZoom').addEventListener('input',render);
$('#previewLens').addEventListener('change',render);
$('#netd').addEventListener('change',e=>{try{localStorage.setItem('thermalFovNetd',e.target.value)}catch{}render()});
$('#perceptionEnabled').addEventListener('change',e=>{try{localStorage.setItem('thermalFovPerceptionEnabled',String(e.target.checked))}catch{}render()});
$('#treeCount').addEventListener('input',e=>{updateSceneControls();try{localStorage.setItem('thermalFovTreeCount',e.target.value)}catch{}render()});
$('#fieldPlantCount').addEventListener('input',e=>{updateSceneControls();try{localStorage.setItem('thermalFovFieldPlantCount',e.target.value)}catch{}render()});
$('#addLens').addEventListener('click',()=>{if(!values())return;lenses.push(Math.min(300,lenses[lenses.length-1]+10));renderLensList();render()});
document.querySelectorAll('[data-lens]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.lens;if(!lenses.includes(n)){lenses.push(n);renderLensList();render()}}));
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{selectedScene=b.dataset.scene;document.querySelectorAll('[data-scene]').forEach(x=>x.classList.toggle('active',x===b));updateSceneControls();render()}));
try{const storedPerception=localStorage.getItem('thermalFovPerceptionEnabled');if(storedPerception!==null)$('#perceptionEnabled').checked=storedPerception==='true'}catch{}
try{const storedNetd=localStorage.getItem('thermalFovNetd');if(['off','15','18','20','25','30','35','40','50'].includes(storedNetd))$('#netd').value=storedNetd}catch{}
async function initialize(){
  // Overall height includes head, ears and antlers. Keep the original silhouette
  // proportions instead of squeezing it into a box with a shoulder-height label.
  await Promise.all(animals.map(async animal=>{
    const sprite=await loadRaster(animal.img);
    animal.h=animal.w*sprite.height/sprite.width;
    animal.size=`${fmt(animal.w,2)} × ${fmt(animal.h,2)} m`;
  }));
  assetsReady=true;
  restoreSceneCounts();renderDistanceScale();renderLensList();renderAnimals();render();
}
initialize().catch(error=>{$('#inputError').textContent=error.message});
