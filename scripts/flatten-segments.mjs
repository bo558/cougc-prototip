// Statik derleme sonrası çalışır (npm "postbuild").
// Next.js ön yükleme dosyalarını iç içe klasörlere yazıyor (__next.admin/projeler/__PAGE__.txt),
// tarayıcı ise tek dosya adıyla istiyor (__next.admin.projeler.__PAGE__.txt). Sunucusuz barındırmada
// bu fark 404 üretir; dosyalar istenen ada taşınır.
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const root = 'out';
if (!existsSync(root)) { console.error('out/ bulunamadı'); process.exit(1); }

const filesIn = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name)) : [join(dir, e.name)]));
const segmentDirs = [];
const collect = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === '_next') continue;
    if (e.name.startsWith('__next.')) segmentDirs.push(join(dir, e.name));
    else collect(join(dir, e.name));
  }
};
collect(root);

let moved = 0;
for (const dir of segmentDirs) {
  for (const file of filesIn(dir)) {
    const flat = dir.split(sep).pop() + '.' + relative(dir, file).split(sep).join('.');
    mkdirSync(dirname(dir), { recursive: true });
    renameSync(file, join(dirname(dir), flat));
    moved++;
  }
  rmSync(dir, { recursive: true, force: true });
}
console.log(`Ön yükleme dosyaları düzenlendi: ${moved} dosya, ${segmentDirs.length} klasör`);
