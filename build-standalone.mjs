import { readFile, writeFile } from 'node:fs/promises';
const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8');
const scripts = await Promise.all(['core.js','content.js','app.js'].map(name => readFile(new URL(name,import.meta.url), 'utf8')));
const js = scripts.map(source => source.replace(/^import .+;\r?\n/gm, '').replace(/^export /gm,'')).join('\n');
const bundled = html.replace('<link rel="stylesheet" href="./styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<link rel="icon" href="./icon.svg" type="image/svg+xml">', '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'16\' fill=\'%23163b3b\'/%3E%3Ctext x=\'13\' y=\'47\' fill=\'%23ebd79c\' font-family=\'Georgia\' font-size=\'49\'%3Ed.%3C/text%3E%3C/svg%3E">')
  .replace('<script type="module" src="./app.js"></script>', () => `<script type="module">\n${js}\n</script>`);
await writeFile(new URL('./Declic-acide-base.html', import.meta.url), '<!-- Version autonome générée par build-standalone.mjs. Modifier les fichiers source, puis régénérer. -->\n'+bundled);
console.log('Version autonome prête : Declic-acide-base.html');
