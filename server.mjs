import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png':'image/png', '.webmanifest':'application/manifest+json' };
const allowed = new Set(['index.html', 'styles.css', 'app.js', 'core.js', 'content.js', 'reaction.js', 'module-two-content.js', 'module-two-reaction.js', 'module-three-content.js', 'module-three-models.js', 'module-four-content.js', 'module-four-lab.js', 'module-five-content.js', 'module-five-lab.js','module-six-content.js','module-six-lab.js', 'install.js', 'sw.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable.png']);
const server = http.createServer(async (req, res) => {
  const filename = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!allowed.has(filename)) { res.writeHead(404); res.end('Not found'); return; }
  try { const content = await readFile(path.join(root, filename)); res.writeHead(200, { 'Content-Type': types[path.extname(filename)], 'Cache-Control': 'no-store' }); res.end(content); }
  catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT) || 4173, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
