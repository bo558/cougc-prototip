/* ==========================================================================
   İş kuralları ve seçiciler (saf fonksiyonlar, Db alır).
   Gerçek uygulamada bu kurallar sunucu tarafındaki servis katmanına taşınır.
   ========================================================================== */
import type { Brief, Db, Project, Role } from '../types';
import { daysUntil, TODAY } from '../format';
import { ACTIVE_STATUSES, CONSUMED, RESERVED } from './status';

export const brandOf = (db: Db, id: string) => db.brands.find((b) => b.id === id)!;
export const creatorOf = (db: Db, id: string | null | undefined) => (id ? db.creators.find((c) => c.id === id) : undefined);
export const projectOf = (db: Db, id: string) => db.projects.find((p) => p.id === id);
export const orderOf = (db: Db, id: string) => db.orders.find((o) => o.id === id);
export const pkgOf = (db: Db, id: string) => db.packages.find((p) => p.id === id);

export const projectsOfBrand = (db: Db, bid: string) => db.projects.filter((p) => p.brandId === bid);
export const projectsOfCreator = (db: Db, cid: string) => db.projects.filter((p) => p.creatorId === cid);
export const offersForCreator = (db: Db, cid: string) =>
  db.projects.filter((p) => p.status === 'teklif_gonderildi' && p.offers.some((o) => o.creatorId === cid && o.status === 'pending'));
export const ordersOfBrand = (db: Db, bid: string) => db.orders.filter((o) => o.brandId === bid).sort((a, b) => b.date.localeCompare(a.date));

export function credits(db: Db, bid: string) {
  const total = db.orders.filter((o) => o.brandId === bid && o.status === 'paid').reduce((s, o) => s + o.videos, 0);
  let reserved = 0; let used = 0;
  db.projects.filter((p) => p.brandId === bid).forEach((p) => {
    if (RESERVED.includes(p.status)) reserved += p.videoCount;
    if (CONSUMED.includes(p.status)) used += p.videoCount;
  });
  return { total, reserved, used, available: Math.max(0, total - reserved - used) };
}
export type Credits = ReturnType<typeof credits>;

/** Yeni projenin hak kullanacağı sipariş: en eski, yeterli hakkı kalan ödenmiş sipariş */
export function orderForNewProject(db: Db, bid: string, count: number) {
  const orders = db.orders.filter((o) => o.brandId === bid && o.status === 'paid').sort((a, b) => a.date.localeCompare(b.date));
  for (const o of orders) {
    const used = db.projects.filter((p) => p.orderId === o.id && p.status !== 'iptal' && p.status !== 'taslak').reduce((s, p) => s + p.videoCount, 0);
    if (o.videos - used >= count) return o;
  }
  return orders[orders.length - 1];
}

export const usedOnOrder = (db: Db, orderId: string) =>
  db.projects.filter((p) => p.orderId === orderId && !['iptal', 'taslak'].includes(p.status)).reduce((s, p) => s + p.videoCount, 0);

export function pkgOfProject(db: Db, p: Project) { const o = orderOf(db, p.orderId); return o ? pkgOf(db, o.packageId) : undefined; }
export function revisionLimit(db: Db, p: Project) { const pk = pkgOfProject(db, p); return (pk ? pk.revisions : 1) + (p.extraRevisions || 0); }

export const isLate = (p: Project) => !!p.deadline && ACTIVE_STATUSES.includes(p.status) && (daysUntil(p.deadline) ?? 0) < 0;
export const pendingOffer = (p: Project) => p.offers.find((o) => o.status === 'pending');

export function briefOf(db: Db, p: Project): Brief {
  const b = db.briefs[p.id] || {};
  const brand = brandOf(db, p.brandId);
  return {
    website: brand.website, social: brand.instagram, productLink: brand.website + '/urun',
    description: p.product + ' için marka bilinirliği ve satış odaklı UGC video.',
    features: 'Brief formunda belirtilen ürün özellikleri',
    audience: '25–40 yaş, ' + brand.sector.toLocaleLowerCase('tr-TR') + ' ürünleriyle ilgilenen kullanıcılar',
    goal: 'Reklam (dönüşüm)', platforms: ['Instagram Reels', 'TikTok'], format: p.videos[0].format || '9:16', duration: '20–30 sn',
    tone: 'Samimi ve doğal', highlights: 'Ürün ilk 3 saniyede görünmeli.', forbidden: 'Rakip marka adı ve doğrulanmamış iddialar kullanılmamalı.',
    script: 'Serbest — içerik üreticisi önerisine açığız.', references: '—', attachments: [],
    address: 'Ürün, kesinleşme sonrası COUGC üzerinden içerik üreticisine iletilir.', notes: '—',
    ...b
  } as Brief;
}

/** Proje için sıradaki aksiyonun kimde olduğu */
export function nextActor(p: Project): Role | null {
  switch (p.status) {
    case 'admin_incelemesi': case 'kesinlestirme': return 'admin';
    case 'teklif_gonderildi': return 'creator';
    case 'kargo': return p.shipping.status === 'kargoda' ? 'creator' : 'brand';
    case 'uretimde': return 'creator';
    case 'teslim':
      if (p.videos.some((v) => v.status === 'admin_kontrol')) return 'admin';
      if (p.videos.some((v) => v.status === 'marka_inceleme')) return 'brand';
      return 'creator';
    default: return null;
  }
}

export function adminQueue(db: Db) {
  const ps = db.projects;
  return {
    briefs: ps.filter((p) => p.status === 'admin_incelemesi'),
    confirm: ps.filter((p) => p.status === 'kesinlestirme'),
    videos: ps.filter((p) => p.videos.some((v) => v.status === 'admin_kontrol')),
    applications: db.creators.filter((c) => c.status === 'pending'),
    formApplications: db.applications.filter((a) => a.status === 'pending'),
    preferences: db.preferences.filter((x) => x.status === 'yeni')
  };
}
export function adminQueueCount(db: Db) { const q = adminQueue(db); return q.briefs.length + q.confirm.length + q.videos.length + q.applications.length + q.formApplications.length + q.preferences.length; }

/** Markanın projeye bağlı ve bağlı olmayan tüm içerik üreticisi tercihleri (yeniden eskiye) */
export const preferencesOfBrand = (db: Db, bid: string) => db.preferences.filter((x) => x.brandId === bid).sort((a, b) => b.date.localeCompare(a.date));

export const orderTotal = (db: Db, o: { net: number; discount?: number }) => Math.round((o.net - (o.discount || 0)) * (1 + db.settings.vatRate));

/** Marka adım çubuğu: 0 brief · 1 içerik üreticisi · 2 ürün&çekim · 3 inceleme · 4 teslim (5 = hepsi tamam) */
export function brandStep(p: Project) {
  const m: Record<string, number> = { taslak: 0, admin_incelemesi: 1, teklif_gonderildi: 1, kesinlestirme: 1, kargo: 2, uretimde: 2, teslim: 3, tamamlandi: 5, iptal: 0 };
  return m[p.status];
}

export function needsBrand(p: Project) {
  return p.videos.some((v) => v.status === 'marka_inceleme') || (p.status === 'kargo' && p.shipping.status === 'bekleniyor');
}

export function revRate(ps: Project[]) {
  const vs = ps.flatMap((p) => p.videos.filter((v) => v.versions.length));
  if (!vs.length) return '—';
  return (vs.reduce((s, v) => s + v.revisions.length, 0) / vs.length).toFixed(1).replace('.', ',');
}

export function salesByMonth(db: Db) {
  const res = db.history.map((h) => ({ k: h.m, v: Math.round(h.sales * 1.2) }));
  [3, 2, 1, 0].forEach((back) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - back, 1);
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const v = db.orders.filter((o) => o.status === 'paid' && o.date.startsWith(k)).reduce((s, o) => s + orderTotal(db, o), 0);
    res.push({ k, v });
  });
  return res;
}
