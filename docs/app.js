const $ = (s) => document.querySelector(s);
const colors = ['#ff5b2e','#ffb020','#75b8ff','#71d6a6','#d18cff'];
const animals = [
  {id:'boar',name:'Wildschwein',size:'1,50 × 0,85 m',w:1.5,h:.85,img:'assets/pictogram-wild-boar.png'},
  {id:'deer',name:'Rothirsch',size:'2,10 × 1,40 m',w:2.1,h:1.4,img:'assets/pictogram-red-deer.png'},
  {id:'roe',name:'Rehwild',size:'1,20 × 0,75 m',w:1.2,h:.75,img:'assets/pictogram-roe-deer.png'},
  {id:'fox',name:'Rotfuchs',size:'0,90 × 0,40 m',w:.9,h:.4,img:'assets/pictogram-red-fox.png'}
];
let lenses = [35,50];
let selectedAnimal = animals[0];
const animalImages = new Map();

function lensRow(value,index){
  const row=document.createElement('div'); row.className='lens-row'; row.style.setProperty('--lens',colors[index%colors.length]);
  row.innerHTML=`<span class="dot"></span><input aria-label="Brennweite ${index+1}" type="number" min="4" max="200" step="1" value="${value}"><button aria-label="Brennweite entfernen" type="button">×</button>`;
  row.querySelector('input').addEventListener('input',e=>{lenses[index]=clamp(+e.target.value||1,1,300);render()});
  row.querySelector('button').addEventListener('click',()=>{if(lenses.length>1){lenses.splice(index,1);renderLensList();render()}});
  return row;
}
function renderLensList(){const list=$('#lensList');list.innerHTML='';lenses.forEach((l,i)=>list.append(lensRow(l,i)))}
function renderAnimals(){const picker=$('#animalPicker');picker.innerHTML='';animals.forEach(a=>{const b=document.createElement('button');b.type='button';b.className='animal-card'+(a.id===selectedAnimal.id?' active':'');b.innerHTML=`<img src="${a.img}" alt="${a.name}"><span class="animal-info"><strong>${a.name}</strong><small>${a.size}</small></span>`;b.addEventListener('click',()=>{selectedAnimal=a;renderAnimals();render()});picker.append(b)})}
function drawPixelAnimal(v,outer){
  const canvas=$('#animalCanvas'),ctx=canvas.getContext('2d'),animal=selectedAnimal,src=animal.img;
  canvas.width=Math.round(v.rw);canvas.height=Math.round(v.rh);canvas.dataset.src=src;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
  const draw=(img)=>{if(canvas.dataset.src!==src)return;const w=Math.max(1,animal.w/outer.w*canvas.width),h=Math.max(1,animal.h/outer.h*canvas.height);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h)};
  if(animalImages.has(src)){draw(animalImages.get(src));return}
  const img=new Image();img.onload=()=>{animalImages.set(src,img);draw(img)};img.src=src;
}
function clamp(n,min,max){return Math.min(max,Math.max(min,n))}
function values(){return {rw:clamp(+$('#resW').value||640,1,10000),rh:clamp(+$('#resH').value||512,1,10000),pitch:clamp(+$('#pitch').value||12,.1,100),d:+$('#distance').value,z:+$('#digitalZoom').value}}
function calc(f,v){const sw=v.rw*v.pitch/1000,sh=v.rh*v.pitch/1000,sd=Math.hypot(sw,sh);const ha=2*Math.atan(sw/(2*f)),va=2*Math.atan(sh/(2*f)),da=2*Math.atan(sd/(2*f));const opticalW=2*v.d*Math.tan(ha/2),opticalH=2*v.d*Math.tan(va/2);const displayHa=2*Math.atan(Math.tan(ha/2)/v.z),displayVa=2*Math.atan(Math.tan(va/2)/v.z),displayDa=2*Math.atan(Math.tan(da/2)/v.z);return {f,sw,sh,ha,va,da,opticalW,opticalH,w:opticalW/v.z,h:opticalH/v.z,hdeg:displayHa*180/Math.PI,vdeg:displayVa*180/Math.PI,ddeg:displayDa*180/Math.PI,ifov:v.pitch/1000/f*1000}}
function fmt(n,d=1){return n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d})}
function fmtPx(n){return n<10?fmt(n,1):Math.round(n).toLocaleString('de-DE')}
function render(){
  const v=values(),cs=lenses.map(f=>calc(f,v)),outer=cs.reduce((a,b)=>a.w>b.w?a:b);
  const viewport=$('#viewport'),ratio=v.rw/v.rh,gridRows=16/ratio;
  viewport.style.setProperty('--sensor-ratio',ratio);
  viewport.style.setProperty('--grid-x','6.25%');
  viewport.style.setProperty('--grid-y',`${100/gridRows}%`);
  $('#distanceLabel').textContent=v.d;$('#chipDistance').textContent=`${v.d} m`;$('#resolutionLabel').textContent=`${v.rw} × ${v.rh} px`;$('#zoomLabel').textContent=`${fmt(v.z,1)}×`;$('#zoomChip').textContent=`Sensor-Ausgabe · ${fmt(v.z,1)}×`;$('#sensorSize').textContent=`${fmt(outer.sw,2)} × ${fmt(outer.sh,2)} mm`;
  const layers=$('#fovLayers');layers.innerHTML='';
  cs.slice().sort((a,b)=>b.w-a.w).forEach(c=>{const el=document.createElement('div'),i=cs.indexOf(c);el.className='fov-layer';el.style.setProperty('--lens',colors[i%colors.length]);el.style.width=`${(c.w/outer.w)*100}%`;el.style.height=`${(c.h/outer.h)*100}%`;el.dataset.label=`${c.f} mm · ${fmt(c.w)} × ${fmt(c.h)} m · ${fmt(v.z,1)}×`;layers.append(el)});
  $('#axisX').textContent=`↔ ${fmt(outer.w)} m`;$('#axisY').textContent=`↕ ${fmt(outer.h)} m`;
  const av=$('#animalVisual');av.title=`${selectedAnimal.name}: ${selectedAnimal.size}`;$('#animalCanvas').setAttribute('aria-label',`${selectedAnimal.name} in durchschnittlicher Größe, gerendert mit ${v.rw} × ${v.rh} Pixeln`);drawPixelAnimal(v,outer);
  $('#results').innerHTML=cs.map((c,i)=>{const animalPxW=selectedAnimal.w/c.w*v.rw,animalPxH=selectedAnimal.h/c.h*v.rh,nativePxW=selectedAnimal.w/c.opticalW*v.rw,nativePxH=selectedAnimal.h/c.opticalH*v.rh;return `<article class="result-card" style="--lens:${colors[i%colors.length]}"><header><strong>${c.f} mm · ${fmt(v.z,1)}×</strong><span>H ${fmt(c.hdeg)}° · V ${fmt(c.vdeg)}° · D ${fmt(c.ddeg)}°</span></header><div class="metrics"><div class="metric"><span>FOV Breite</span><b>${fmt(c.w)} m</b></div><div class="metric"><span>FOV Höhe</span><b>${fmt(c.h)} m</b></div><div class="metric"><span>Anzeige m / px</span><b>${fmt(c.w/v.rw,3)}</b></div><div class="metric"><span>Nativ m / px</span><b>${fmt(c.opticalW/v.rw,3)}</b></div><div class="metric"><span>IFOV</span><b>${fmt(c.ifov,2)} mrad</b></div><div class="metric animal-pixels"><span>${selectedAnimal.name} im Bild</span><b>${fmtPx(animalPxW)} × ${fmtPx(animalPxH)} px</b><small>Nativ erfasst: ${fmtPx(nativePxW)} × ${fmtPx(nativePxH)} Sensorpixel</small></div></div></article>`}).join('');
  const pct=(v.d-10)/490*100;$('#distance').style.background=`linear-gradient(90deg,var(--heat) ${pct}%,#343a45 ${pct}%)`;
}

$('#preset').addEventListener('change',e=>{if(e.target.value==='custom')return;const [w,h,p]=e.target.value.split(',');$('#resW').value=w;$('#resH').value=h;$('#pitch').value=p;render()});
['resW','resH','pitch'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#preset').value='custom';render()}));
$('#distance').addEventListener('input',render);
$('#digitalZoom').addEventListener('input',render);
$('#addLens').addEventListener('click',()=>{lenses.push(lenses[lenses.length-1]+10);renderLensList();render()});
document.querySelectorAll('[data-lens]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.lens;if(!lenses.includes(n)){lenses.push(n);renderLensList();render()}}));
renderLensList();renderAnimals();render();
