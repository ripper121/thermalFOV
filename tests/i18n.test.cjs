const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../docs/i18n.js'),'utf8');
function create(languages,saved=null,blocked=false){
  const storage=new Map(saved?[['thermalFovLanguage',saved]]:[]);
  const context=vm.createContext({navigator:{languages},localStorage:{
    getItem(key){if(blocked)throw new Error('Storage blocked');return storage.get(key)??null},
    setItem(key,value){if(blocked)throw new Error('Storage blocked');storage.set(key,value)}
  }});
  vm.runInContext(source,context);return {api:context.thermalI18n,storage,context};
}
test('automatic language follows the primary browser language with English fallback',()=>{
  for(const [languages,expected] of [[['de-DE'],'de'],[['de-AT','en'],'de'],[['en-US','de'],'en'],[['fr-FR'],'en'],[[],'en']]){
    assert.equal(create(languages).api.language,expected);
  }
});
test('manual preference overrides the browser and returning to automatic restores detection',()=>{
  const {api,storage}=create(['de-CH'],'en');assert.equal(api.language,'en');
  api.setPreference('de');assert.equal(api.language,'de');assert.equal(storage.get('thermalFovLanguage'),'de');
  api.setPreference('auto');assert.equal(api.preference,'auto');assert.equal(api.language,'de');
  assert.equal(create(['en-US'],'invalid').api.language,'en');
});
test('blocked storage does not prevent detection or manual switching',()=>{
  const {api}=create(['de-DE'],null,true);assert.equal(api.language,'de');
  api.setPreference('en');assert.equal(api.language,'en');
});
test('translation parameters and numeric locale follow language changes',()=>{
  const {api}=create(['en-US']);
  assert.equal(api.t('Nativ erfasst: {w} × {h} Sensorpixel',{w:'6.3',h:'3.5'}),'Native capture: 6.3 × 3.5 sensor pixels');
  assert.equal((1.5).toLocaleString(api.locale),'1.5');
  api.setPreference('de');assert.equal(api.t('Rotfuchs'),'Rotfuchs');
  assert.equal((1.5).toLocaleString(api.locale),'1,5');
});
