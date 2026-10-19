import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const installationSource=(await readFile(new URL('../install.js',import.meta.url),'utf8')).replace(/^export /gm,'');
function installationHarness(queued=null){
  const elements=new Map();const events=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,{hidden:false,open:false,disabled:false,textContent:'',innerHTML:'',classList:{add(){},remove(){}},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},showModal(){this.open=true;},close(){this.open=false;},click(){if(!this.disabled)return this.listeners.click?.();}});return elements.get(id);};
  const window={declicInstallPrompt:queued,isSecureContext:true,matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener:(name,fn)=>events.set(name,fn)};
  const context={document:{getElementById:get},window,navigator:{serviceWorker:{addEventListener(){},register:()=>new Promise(()=>{})}},location:{protocol:'https:'}};
  vm.runInNewContext(installationSource+'\nmountInstall();',context);
  return {get,window,emit:(name,event={})=>events.get(name)?.(event)};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function nativePrompt(outcome='accepted'){return {calls:0,preventDefault(){},prompt(){this.calls++;return Promise.resolve();},userChoice:Promise.resolve({outcome})};}
test('no native offer shows actionable manual instructions without claiming installation',()=>{
  const app=installationHarness();app.get('install-app').click();assert.equal(app.get('install-dialog').open,true);assert.equal(app.get('install-manual').open,true);assert.equal(app.get('confirm-install').hidden,true);assert.match(app.get('install-state').textContent,/Installation à confirmer depuis le menu de Chrome/);assert.doesNotMatch(app.get('install-app').innerHTML,/Application installée/);
});
test('the header button immediately triggers an early queued native offer, only once',async()=>{
  const offer=nativePrompt();const app=installationHarness(offer);app.get('install-app').click();assert.equal(offer.calls,1);assert.equal(app.window.declicInstallPrompt,null);await settle();app.get('install-app').click();assert.equal(offer.calls,1);assert.match(app.get('install-state').textContent,/Demande acceptée/);assert.doesNotMatch(app.get('install-app').innerHTML,/Application installée/);
});
test('a late browser offer enables native confirmation and only appinstalled confirms success',async()=>{
  const app=installationHarness();app.get('install-app').click();const offer=nativePrompt();app.emit('beforeinstallprompt',offer);assert.equal(app.get('confirm-install').hidden,false);await app.get('confirm-install').click();assert.equal(offer.calls,1);assert.match(app.get('install-state').textContent,/Demande acceptée/);app.emit('appinstalled');assert.match(app.get('install-state').textContent,/Installation confirmée/);assert.match(app.get('install-app').innerHTML,/Application installée/);assert.equal(app.get('install-manual').open,true);
});
test('cancellation and prompt errors never announce installation and keep desktop help available',async()=>{
  for(const fail of [false,true]){const offer=nativePrompt('dismissed');if(fail)offer.prompt=()=>{throw Error('unavailable');};const app=installationHarness(offer);app.get('install-app').click();await settle();assert.equal(app.get('install-manual').open,true);assert.equal(app.get('confirm-install').hidden,true);assert.doesNotMatch(app.get('install-app').innerHTML,/Application installée/);assert.match(app.get('install-message').textContent,fail?/n’a pas pu s’ouvrir/:/annulé/);}
});
test('the HTML captures a native offer before the application module has loaded',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');const boot=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]).find(source=>source.includes('window.declicInstallPrompt=null'));
  assert.ok(boot);const listeners={};const window={addEventListener:(type,fn)=>listeners[type]=fn};vm.runInNewContext(boot,{window});const offer=nativePrompt();listeners.beforeinstallprompt(offer);assert.equal(window.declicInstallPrompt,offer);
});
