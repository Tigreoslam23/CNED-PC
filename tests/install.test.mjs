import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('installation manifest works under a GitHub Pages subdirectory',async()=>{
  const m=JSON.parse(await read('manifest.webmanifest'));assert.equal(m.display,'standalone');const base='https://example.org/CNED-PC/';assert.equal(new URL(m.start_url,base).pathname,'/CNED-PC/');assert.equal(m.scope,'./');
  for(const icon of m.icons){const data=await readFile(new URL('../'+icon.src,import.meta.url));assert.equal(data.subarray(1,4).toString(),'PNG');const expected=Number(icon.sizes.split('x')[0]);assert.equal(data.readUInt32BE(16),expected);assert.equal(data.readUInt32BE(20),expected);}
});
test('offline cache installation is atomic and contains every imported source',async()=>{
  const handlers={};let assets;const cache={addAll:async list=>{assert.ok(list.every(r=>r.cache==='reload'));assets=list.map(r=>'./'+new URL(r.url).pathname.replace('/CNED-PC/',''));}};
  const context={self:{addEventListener:(name,fn)=>handlers[name]=fn,registration:{scope:'https://example.org/CNED-PC/'},location:{origin:'https://example.org'}},caches:{open:async()=>cache},URL,Request};
  vm.runInNewContext(await read('sw.js'),context);await new Promise((resolve,reject)=>handlers.install({waitUntil:p=>p.then(resolve,reject)}));
  for(const name of assets){assert.ok(name.startsWith('./'));if(name!=='./')await readFile(new URL('../'+name,import.meta.url));}
  for(const source of assets.filter(a=>a.endsWith('.js'))){const code=await read(source);for(const match of code.matchAll(/from ['"](.+?)['"]/g))assert.ok(assets.includes(match[1]),`${source} needs ${match[1]}`);}
  cache.addAll=async()=>{throw Error('network unavailable');};await assert.rejects(new Promise((resolve,reject)=>handlers.install({waitUntil:p=>p.then(resolve,reject)})),/network unavailable/);
});
test('service worker serves cached modules offline and limits requests to its app scope',async()=>{
  const handlers={};const cache={match:async request=>String(request).includes('index.html')?'offline shell':String(request).includes('app.js')?'cached code':null};
  vm.runInNewContext(await read('sw.js'),{self:{addEventListener:(n,f)=>handlers[n]=f,registration:{scope:'https://example.org/CNED-PC/'},location:{origin:'https://example.org'}},caches:{open:async()=>cache},URL,fetch:async()=>{throw Error('offline');}});
  const run=async(url,mode='navigate')=>{let result;handlers.fetch({request:{url,method:'GET',mode,toString:()=>url},respondWith:p=>{result=p;}});return result;};
  assert.equal(await run('https://example.org/CNED-PC/app.js','cors'),'cached code');assert.equal(await run('https://example.org/CNED-PC/route'),'offline shell');assert.equal(await run('https://example.org/other/'),undefined);assert.equal(await run('https://elsewhere.org/app.js'),undefined);
});
test('standalone HTML has no network dependencies for its application shell',async()=>{
  const html=await read('Declic-acide-base.html');assert.ok(!/src="\.\/app\.js/.test(html));assert.ok(!/href="\.\/styles\.css/.test(html));assert.ok(!html.includes('rel="manifest"'));assert.ok(!html.includes('rel="apple-touch-icon"'));
  for(const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)){new vm.Script(script[1]);}
});
