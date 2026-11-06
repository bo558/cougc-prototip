/* ==========================================================================
   Statik export (GitHub Pages) için dinamik rotaların önceden üretilecek parametreleri.
   Sunucu olmadığından her detay sayfası derlemede HTML olarak üretilmelidir.
   Demo sırasında yeni proje/sipariş oluşturulabildiği için sıralı kimlik aralıkları da üretilir:
   - Projeler: p-2000 … p-2099 (seed p-2009…p-2044; demo yeni projeleri p-2045'ten başlatır)
   - Siparişler: o-1030 … o-1129 (seed o-1035…o-1042)
   Gerçek backend'e geçildiğinde bu dosyaya gerek kalmaz.
   ========================================================================== */
import { SEED } from './mock/seed';

const range = (prefix: string, from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => prefix + (from + i));

export const PROJECT_IDS = range('p-', 2000, 2099);
export const ORDER_IDS = range('o-', 1030, 1129);
/** Bir projedeki en fazla video sayısı (en büyük paket) */
export const MAX_VIDEOS_PER_PROJECT = 5;

export const projectParams = () => PROJECT_IDS.map((id) => ({ id }));
export const orderParams = () => ORDER_IDS.map((id) => ({ id }));
export const brandParams = () => SEED.brands.map((b) => ({ id: b.id }));
/** Seed + demo sırasında başvuru onayıyla oluşabilecek içerik üreticileri (c-yeni-1 … c-yeni-30) */
export const creatorParams = () => [...SEED.creators.map((c) => c.id), ...range('c-yeni-', 1, 30)].map((id) => ({ id }));
export const packageParams = () => SEED.packages.map((p) => ({ pkg: p.id }));
export const uploadParams = () => PROJECT_IDS.flatMap((id) => Array.from({ length: MAX_VIDEOS_PER_PROJECT }, (_, i) => ({ id, no: String(i + 1) })));
