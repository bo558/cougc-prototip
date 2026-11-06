// Statik çıktıyı (out/) GitHub Pages'e benzer şekilde yerelde sunar — yalnızca önizleme içindir.
// Kullanım: node scripts/serve-out.mjs [--base /repo-adi] [--port 4173]
// GitHub Pages davranışı: /yol/ → /yol/index.html, bulunamayan adres → 404.html (404 durumuyla).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const base = (arg('--base', process.env.NEXT_PUBLIC_BASE_PATH || '') || '').replace(/\/$/, '');
const port = Number(arg('--port', 4173));
const root = resolve('out');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

async function fileFor(p) {
  const full = normalize(join(root, p));
  if (!full.startsWith(root)) return null; // dizin dışına çıkma engeli
  try {
    const s = await stat(full);
    if (s.isFile()) return full;
    if (s.isDirectory()) { const idx = join(full, 'index.html'); await stat(idx); return idx; }
  } catch { /* yok */ }
  try { const html = full + '.html'; await stat(html); return html; } catch { return null; }
}

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (base && p === '/') { res.writeHead(302, { Location: base + '/' }); return res.end(); }
  if (base && !p.startsWith(base + '/') && p !== base) { res.writeHead(404); return res.end('404'); }
  p = p.slice(base.length) || '/';
  const f = await fileFor(p);
  if (f) {
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
    return res.end(await readFile(f));
  }
  const nf = await fileFor('/404.html');
  res.writeHead(404, { 'Content-Type': TYPES['.html'] });
  res.end(nf ? await readFile(nf) : '404');
}).listen(port, '127.0.0.1', () => console.log(`Statik önizleme: http://localhost:${port}${base}/  (çıktı: out/)`));
