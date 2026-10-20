import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
let html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8');
const scriptNames=['core.js','content.js','reaction.js','module-two-content.js','module-two-reaction.js','module-three-content.js','module-three-models.js','module-four-content.js','module-four-lab.js','module-five-content.js','module-five-lab.js','install.js','app.js'];
const scripts = await Promise.all(scriptNames.map(name => readFile(new URL(name,import.meta.url), 'utf8')));
const entryVersion=createHash('sha256').update(css+scripts.join('\n')).digest('hex').slice(0,12);
html=html.replace(/href="\.\/styles\.css(?:\?v=[^"]*)?"/,`href="./styles.css?v=${entryVersion}"`).replace(/src="\.\/app\.js(?:\?v=[^"]*)?"/,`src="./app.js?v=${entryVersion}"`);
await writeFile(new URL('./index.html',import.meta.url),html);
const js = scripts.map(source => source.replace(/^import .+;\r?\n/gm, '').replace(/^export /gm,'')).join('\n');
const bundled = html.replace(/  <link rel="manifest"[^>]+>\r?\n/,'').replace(/  <link rel="apple-touch-icon"[^>]+>\r?\n/,'').replace(/<link rel="stylesheet" href="\.\/styles\.css[^\"]*">/, () => `<style>\n${css}\n</style>`)
  .replace('<link rel="icon" href="./icon.svg" type="image/svg+xml">', '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'16\' fill=\'%23163b3b\'/%3E%3Ctext x=\'13\' y=\'47\' fill=\'%23ebd79c\' font-family=\'Georgia\' font-size=\'49\'%3Ed.%3C/text%3E%3C/svg%3E">')
  .replace(/<script type="module" src="\.\/app\.js[^\"]*"><\/script>/, () => `<script type="module">\n${js}\n</script>`);
await writeFile(new URL('./Declic-acide-base.html', import.meta.url), '<!-- Version autonome générée par build-standalone.mjs. Modifier les fichiers source, puis régénérer. -->\n'+bundled);
console.log('Version autonome prête : Declic-acide-base.html');
// Le nom du cache change avec le contenu ; une version incomplète ne remplace pas la précédente.
const assets=['./','./index.html','./styles.css',...scriptNames.map(name=>'./'+name),'./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./icon-maskable.png'];
const digest=createHash('sha256');
for(const name of assets.filter(name=>name!=='./'))digest.update(await readFile(new URL(name,import.meta.url)));
const version=digest.digest('hex').slice(0,16);
await writeFile(new URL('./sw.js',import.meta.url),`// Généré par build-standalone.mjs ; régénérer après chaque modification.\nconst PREFIX='declic-'+encodeURIComponent(self.registration.scope)+'-';\nconst CACHE=PREFIX+${JSON.stringify(version)};\nconst ASSETS=${JSON.stringify(assets)};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(asset=>new Request(new URL(asset,self.registration.scope),{cache:'reload'}))))));\nself.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));\nself.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});\nself.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return cache.match(new URL('./index.html',self.registration.scope));throw error;}})());});\n`);
console.log('Cache hors connexion prêt : '+version);
