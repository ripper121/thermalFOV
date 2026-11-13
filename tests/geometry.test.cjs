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
