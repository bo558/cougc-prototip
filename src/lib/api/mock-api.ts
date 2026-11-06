'use client';
/* ==========================================================================
   Mock API — arayüzün çağırdığı TEK veri katmanı.
   Her fonksiyon gerçek uygulamada bir sunucu uç noktasına / server action'a karşılık gelir.
   Şimdilik yalnızca tarayıcıdaki demo durumunu değiştirir: ağ isteği, ödeme, e-posta veya
   dosya yüklemesi YAPILMAZ. Gecikmeler yükleniyor durumlarını göstermek içindir.
   ========================================================================== */
import type { Brief, CreatorApplication, Draft, Db, PreferenceStatus, Project, Role } from '../types';
import { addDays, fmtDate, iso, now, sleep, tl, TODAY, uid } from '../format';
import * as R from '../domain/rules';
import { audit, BRAND_ID, commit, CREATOR_ID, notify, resetDemo, useDemo } from '../store/demo-store';
import { UserError } from './errors';

async function run<T>(ms: number, fn: (db: Db) => T): Promise<T> {
  await sleep(ms);
  return commit(fn);
}
const proj = (db: Db, id: string) => { const p = R.projectOf(db, id); if (!p) throw new UserError('Proje bulunamadı.'); return p; };
const vid = (p: Project, no: number) => p.videos.find((v) => v.no === Number(no))!;
const ev = (p: Project, type: Project['events'][number]['type'], text: string) => p.events.push({ date: now(), type, text });
const nextNo = (list: { no: string }[]) => 1 + Math.max(...list.map((x) => Number(x.no.split('-')[1])));
/** Projeye bağlı marka tercihlerinin durumunu topluca günceller */
const syncProjectPrefs = (db: Db, pid: string, fn: (creatorId: string, current: PreferenceStatus) => PreferenceStatus) => {
  db.preferences.filter((x) => x.projectId === pid).forEach((x) => { x.status = fn(x.creatorId, x.status); });
};

export const api = {
  // ---------- Oturum (demo) ----------
  login: (role: Role) => run(350, (db) => { db.session.role = role; }),
  logout: () => commit((db) => { db.session.role = null; }),
  reset: () => resetDemo(),

  // ---------- Ödeme (demo) ----------
  // Gerçekte: sipariş "ödeme bekliyor" açılır → sağlayıcı ödeme formu → sunucuya imzalı bildirim →
  // bildirim doğrulanınca sipariş "ödendi" + hak tanımı TEK transaction'da yapılır.
  purchase: (o: { packageId: string; coupon?: string | null; simulateFail?: boolean }) => run(900, (db) => {
    const pk = R.pkgOf(db, o.packageId)!;
    const n = nextNo(db.orders);
    const c = o.coupon ? db.coupons.find((x) => x.code === o.coupon && x.active) : undefined;
    const discount = c ? (c.type === 'percent' ? Math.round((pk.price * c.value) / 100) : c.value) : 0;
    const order = {
      id: 'o-' + n, no: 'CG-' + n, brandId: BRAND_ID, packageId: pk.id, videos: pk.videos, net: pk.price, discount,
      coupon: c?.code, status: o.simulateFail ? 'failed' as const : 'paid' as const, date: now(), card: '•••• 4242',
      invoice: o.simulateFail ? undefined : 'CGA' + TODAY.getFullYear() + String(n).padStart(6, '0'),
      failReason: o.simulateFail ? 'Banka işlemi onaylamadı (demo senaryo).' : undefined
    };
    db.orders.push(order);
    const brand = R.brandOf(db, BRAND_ID);
    if (o.simulateFail) {
      notify(db, 'admin', ' ödemesi başarısız oldu (' + order.no + ')', '/admin/odemeler', brand.name);
    } else {
      if (c) c.uses += 1;
      notify(db, 'brand:' + BRAND_ID, order.no + ' ödemeniz onaylandı · ' + pk.videos + ' video hakkı tanımlandı', '/marka/paketler');
      notify(db, 'admin', ' ' + pk.name + ' paketi satın aldı (' + tl(R.orderTotal(db, order)) + ')', '/admin/odemeler', brand.name);
      audit(db, 'Ödeme doğrulandı, ' + pk.videos + ' video hakkı tanımlandı', order.no);
    }
    return order;
  }),

  refundOrder: (orderId: string, reason: string) => run(600, (db) => {
    const o = R.orderOf(db, orderId)!;
    if (R.credits(db, o.brandId).available < o.videos) throw new UserError('Bu siparişin hakları kullanılmış; yalnızca kullanılmamış haklar iade edilebilir.');
    o.status = 'refunded';
    o.refund = { date: iso(TODAY), amount: R.orderTotal(db, o), reason: reason || 'Admin tarafından iade edildi.' };
    notify(db, 'brand:' + o.brandId, o.no + ' siparişiniz iade edildi', '/marka/odemeler');
    audit(db, 'Sipariş iade edildi', o.no);
  }),

  // ---------- Brief / proje ----------
  saveDraft: (draft: Draft) => run(300, (db) => { db.drafts[BRAND_ID] = draft; }),
  updateDraft: (patch: Partial<Draft>) => commit((db) => { db.drafts[BRAND_ID] = { ...emptyDraft(), ...db.drafts[BRAND_ID], ...patch }; }),

  // "Tercih Et": atama değildir. Tercih COUGC Admin paneline düşer; değerlendirme ve öneri COUGC ekibindedir.
  togglePick: (creatorId: string, max: number) => commit((db) => {
    const d = (db.drafts[BRAND_ID] = { ...emptyDraft(), ...db.drafts[BRAND_ID] });
    const c = R.creatorOf(db, creatorId)!; const brand = R.brandOf(db, BRAND_ID);
    const i = d.creators.indexOf(creatorId);
    if (i >= 0) {
      d.creators.splice(i, 1);
      db.preferences = db.preferences.filter((x) => !(x.brandId === BRAND_ID && x.creatorId === creatorId && !x.projectId));
      audit(db, 'İçerik üreticisi tercihi geri alındı', brand.name + ' → ' + c.name);
      return 'removed' as const;
    }
    if (d.creators.length >= max) return 'limit' as const;
    d.creators.push(creatorId);
    db.preferences.unshift({ id: uid('pr'), brandId: BRAND_ID, creatorId, date: now(), status: 'yeni' });
    notify(db, 'admin', ' ' + c.name + ' adlı içerik üreticisini tercih etti', '/admin/marka-tercihleri', brand.name);
    audit(db, 'İçerik üreticisi tercih edildi (atama değildir)', brand.name + ' → ' + c.name);
    return 'added' as const;
  }),

  submitBrief: (d: Draft) => run(800, (db) => {
    const count = Number(d.videoCount || 1);
    if (R.credits(db, BRAND_ID).available < count) throw new UserError('Yeterli video hakkınız yok. Lütfen paket satın alın.');
    const n = nextNo(db.projects); const id = 'p-' + n;
    const order = R.orderForNewProject(db, BRAND_ID, count);
    const format = (d.format || '9:16') as Project['videos'][number]['format'];
    const p: Project = {
      id, no: 'PRJ-' + n, brandId: BRAND_ID, orderId: order.id, title: d.title || d.productName || 'Yeni proje', product: d.productName || '',
      videoCount: count, status: 'admin_incelemesi', creatorId: null, preferred: d.creators || [], fee: 0,
      createdAt: now(), requestedDeadline: d.deadline || addDays(TODAY, 14), deadline: null,
      shipping: { required: d.shipping !== 'hayir', status: d.shipping === 'hayir' ? 'gerekmiyor' : 'bekleniyor' },
      payout: { status: 'olusmadi' }, offers: [], events: [],
      videos: Array.from({ length: count }, (_, i) => ({ no: i + 1, status: 'bekleniyor' as const, format, versions: [], revisions: [] }))
    };
    db.projects.push(p);
    const brief: Partial<Brief> = {
      website: d.website, social: d.social, productLink: d.productLink, description: d.description, features: d.features,
      audience: d.audience, goal: d.goal, platforms: d.platforms || [], format: d.format, duration: d.duration, tone: d.tone,
      highlights: d.highlights, forbidden: d.forbidden, script: d.script, references: d.references,
      attachments: d.attachments || [], address: d.address, notes: d.notes
    };
    Object.keys(brief).forEach((k) => { if (brief[k as keyof Brief] === undefined || brief[k as keyof Brief] === '') delete brief[k as keyof Brief]; });
    db.briefs[id] = brief;
    ev(p, 'brief', 'Brief gönderildi, ' + count + ' video hakkı rezerve edildi.');
    db.preferences.filter((x) => x.brandId === BRAND_ID && !x.projectId && (d.creators || []).includes(x.creatorId)).forEach((x) => { x.projectId = id; });
    delete db.drafts[BRAND_ID];
    notify(db, 'admin', ' yeni brief gönderdi: ' + p.title, '/admin/projeler/' + id, R.brandOf(db, BRAND_ID).name);
    audit(db, 'Brief gönderildi, ' + count + ' hak rezerve edildi', p.no);
    return p;
  }),

  // ---------- İçerik üreticisi seçimi: öneri → görüşme → sonuç ----------
  setPreferenceStatus: (id: string, status: PreferenceStatus) => run(250, (db) => {
    const x = db.preferences.find((y) => y.id === id); if (!x) throw new UserError('Tercih bulunamadı.');
    x.status = status;
    const c = R.creatorOf(db, x.creatorId)!;
    if (status === 'onerildi') notify(db, 'brand:' + x.brandId, 'COUGC ekibi ' + c.name + ' adlı içerik üreticisini size öneriyor', x.projectId ? '/marka/projeler/' + x.projectId : '/marka/icerik-ureticileri');
    audit(db, 'Marka tercihi durumu güncellendi', R.brandOf(db, x.brandId).name + ' → ' + c.name);
  }),

  adminRecommend: (pid: string, ids: string[]) => run(500, (db) => {
    const p = proj(db, pid);
    p.selection = { ...p.selection, recommended: ids, recommendedAt: now(), finalCreatorId: null };
    syncProjectPrefs(db, pid, (cid, s) => (s === 'uygun_degil' ? s : ids.includes(cid) ? 'onerildi' : 'inceleniyor'));
    ev(p, 'check', 'COUGC ekibi ' + ids.length + ' içerik üreticisini markaya önerdi. Nihai seçim görüşmede belirlenecek.');
    notify(db, 'brand:' + p.brandId, p.title + ' için COUGC içerik üreticisi önerilerini paylaştı', '/marka/projeler/' + pid);
    audit(db, 'İçerik üreticisi önerildi', p.no + ' → ' + ids.map((i) => R.creatorOf(db, i)!.name).join(', '));
  }),

  adminScheduleMeeting: (pid: string, date: string, note?: string) => run(450, (db) => {
    const p = proj(db, pid);
    p.selection = { recommended: [], ...p.selection, meetingAt: date, meetingNote: note || undefined };
    syncProjectPrefs(db, pid, (cid, s) => (p.selection!.recommended.includes(cid) ? 'gorusme' : s));
    ev(p, 'confirm', 'Marka ile içerik üreticisi görüşmesi planlandı: ' + fmtDate(date) + '.');
    notify(db, 'brand:' + p.brandId, p.title + ' · içerik üreticisi görüşmesi ' + fmtDate(date) + ' için planlandı', '/marka/projeler/' + pid);
    audit(db, 'Görüşme planlandı (' + fmtDate(date) + ')', p.no);
  }),

  adminSetFinalCreator: (pid: string, creatorId: string) => run(450, (db) => {
    const p = proj(db, pid); const c = R.creatorOf(db, creatorId)!;
    p.selection = { recommended: [], ...p.selection, finalCreatorId: creatorId };
    syncProjectPrefs(db, pid, (cid) => (cid === creatorId ? 'secildi' : 'uygun_degil'));
    ev(p, 'check', 'Görüşme sonucunda ' + c.name + ' seçildi. Teklif süreci başlayacak.');
    notify(db, 'brand:' + p.brandId, p.title + ' · görüşme sonucu kaydedildi: ' + c.name, '/marka/projeler/' + pid);
    audit(db, 'Görüşme sonucu kaydedildi', p.no + ' → ' + c.name);
  }),

  adminSendOffer: (pid: string, creatorId: string, fee: number, note?: string) => run(600, (db) => {
    const p = proj(db, pid); const c = R.creatorOf(db, creatorId)!;
    p.offers.forEach((o) => { if (o.status === 'pending') o.status = 'withdrawn'; });
    p.offers.push({ creatorId, status: 'pending', fee: Number(fee), date: now(), expires: addDays(TODAY, 3), note: note || undefined });
    p.fee = Number(fee); p.status = 'teklif_gonderildi'; p.creatorId = null;
    ev(p, 'offer', c.name + ' adlı içerik üreticisine teklif gönderildi.');
    notify(db, 'creator:' + creatorId, ' için yeni teklif: ' + p.title, '/icerik-uretici/teklifler/' + pid, R.brandOf(db, p.brandId).name);
    audit(db, 'Teklif gönderildi (' + tl(fee) + '/video)', p.no + ' → ' + c.name);
  }),

  adminWithdrawOffer: (pid: string) => run(400, (db) => {
    const p = proj(db, pid);
    p.offers.forEach((o) => { if (o.status === 'pending') o.status = 'withdrawn'; });
    p.status = 'admin_incelemesi';
    ev(p, 'reject', 'Teklif geri çekildi.');
    audit(db, 'Teklif geri çekildi', p.no);
  }),

  creatorRespond: (pid: string, accept: boolean, reason?: string) => run(650, (db) => {
    const p = proj(db, pid); const c = R.creatorOf(db, CREATOR_ID)!;
    const offer = p.offers.find((o) => o.creatorId === CREATOR_ID && o.status === 'pending');
    if (!offer) throw new UserError('Bu teklif artık geçerli değil.');
    offer.answeredAt = now();
    if (accept) {
      offer.status = 'accepted'; p.creatorId = CREATOR_ID; p.status = 'kesinlestirme';
      ev(p, 'accept', c.name + ' teklifi kabul etti. Kesinleştirme bekleniyor.');
      notify(db, 'admin', ' ' + p.no + ' teklifini kabul etti — kesinleştirme bekliyor', '/admin/projeler/' + pid, c.name);
      audit(db, 'Teklif kabul edildi', p.no);
    } else {
      offer.status = 'rejected'; offer.reason = reason; p.status = 'admin_incelemesi';
      if (p.selection) p.selection.finalCreatorId = null;
      syncProjectPrefs(db, pid, (cid, s) => (cid === CREATOR_ID ? 'uygun_degil' : s));
      ev(p, 'reject', c.name + ' teklifi reddetti — alternatif içerik üreticisi bekleniyor. Video hakkı korunuyor.');
      notify(db, 'admin', ' ' + p.no + ' teklifini reddetti', '/admin/projeler/' + pid, c.name);
      audit(db, 'Teklif reddedildi', p.no);
    }
  }),

  adminConfirm: (pid: string, deadline: string) => run(600, (db) => {
    const p = proj(db, pid);
    p.deadline = deadline;
    p.status = p.shipping.required ? 'kargo' : 'uretimde';
    ev(p, 'confirm', 'Proje kesinleşti. Teslim tarihi: ' + fmtDate(deadline) + '. Video hakkı kullanıldı.');
    notify(db, 'brand:' + p.brandId, p.title + ' için içerik üreticisi kesinleşti: ' + R.creatorOf(db, p.creatorId)!.name, '/marka/projeler/' + pid);
    notify(db, 'creator:' + p.creatorId, p.no + ' kesinleşti · teslim tarihi ' + fmtDate(deadline), '/icerik-uretici/isler/' + pid);
    audit(db, 'Proje kesinleştirildi, teslim ' + fmtDate(deadline), p.no);
  }),

  brandShipped: (pid: string, carrier: string, tracking: string) => run(500, (db) => {
    const p = proj(db, pid);
    Object.assign(p.shipping, { status: 'kargoda', carrier, tracking });
    ev(p, 'ship', 'Marka ürünü kargoya verdi (' + tracking + ').');
    notify(db, 'creator:' + p.creatorId, p.no + ' ürünü kargoya verildi', '/icerik-uretici/isler/' + pid);
    notify(db, 'admin', p.no + ' ürünü kargoya verildi', '/admin/projeler/' + pid);
  }),

  creatorReceived: (pid: string) => run(450, (db) => {
    const p = proj(db, pid);
    p.shipping.status = 'teslim_alindi'; p.status = 'uretimde';
    ev(p, 'ship', 'İçerik üreticisi ürünü teslim aldı, çekim başladı.');
    notify(db, 'brand:' + p.brandId, p.title + ' · ürün içerik üreticisine ulaştı, çekim başladı', '/marka/projeler/' + pid);
  }),

  creatorUpload: (pid: string, no: number, file: { name: string; size: number; dur?: string }, note?: string) => run(300, (db) => {
    const p = proj(db, pid); const v = vid(p, no); const ver = v.versions.length + 1;
    v.versions.push({ v: ver, date: now(), size: file.size, dur: file.dur || '0:30', note: note || undefined, name: file.name });
    v.status = 'admin_kontrol'; v.adminNote = null;
    if (['uretimde', 'kargo'].includes(p.status)) p.status = 'teslim';
    const c = R.creatorOf(db, p.creatorId)!;
    ev(p, 'upload', c.name + ' ' + no + '. videonun v' + ver + ' sürümünü yükledi.');
    notify(db, 'admin', ' ' + p.no + ' için video yükledi — ön kontrol bekliyor', '/admin/projeler/' + pid, c.name);
  }),

  adminReviewVideo: (pid: string, no: number, pass: boolean, note?: string) => run(500, (db) => {
    const p = proj(db, pid); const v = vid(p, no);
    if (pass) {
      v.status = 'marka_inceleme';
      ev(p, 'check', no + '. video COUGC ön kontrolünden geçti, marka incelemesine gönderildi.');
      notify(db, 'brand:' + p.brandId, p.title + ' · ' + no + '. video incelemenize hazır', '/marka/projeler/' + pid);
      audit(db, 'Video ön kontrolden geçti', p.no + ' · Video ' + no);
    } else {
      v.status = 'bekleniyor'; v.adminNote = note;
      ev(p, 'reject', no + '. video COUGC tarafından içerik üreticisine geri gönderildi: “' + note + '”');
      notify(db, 'creator:' + p.creatorId, p.no + ' · ' + no + '. video için COUGC düzeltme istedi', '/icerik-uretici/isler/' + pid);
      audit(db, 'Video içerik üreticisine geri gönderildi', p.no + ' · Video ' + no);
    }
  }),

  brandApprove: (pid: string, no: number) => run(600, (db) => {
    const p = proj(db, pid); const v = vid(p, no);
    v.status = 'onaylandi'; v.approvedAt = now();
    ev(p, 'approve', no + '. video marka tarafından onaylandı.');
    notify(db, 'creator:' + p.creatorId, p.no + ' · ' + no + '. video onaylandı', '/icerik-uretici/isler/' + pid);
    if (p.videos.every((x) => x.status === 'onaylandi')) {
      p.status = 'tamamlandi'; p.completedAt = now(); p.payout = { status: 'odenecek' };
      const c = R.creatorOf(db, p.creatorId)!;
      ev(p, 'done', 'Tüm videolar onaylandı. Final dosyalar teslim edildi, proje tamamlandı.');
      notify(db, 'admin', p.no + ' tamamlandı · ' + c.name + ' hak edişi ödenecek', '/admin/hakedisler');
      notify(db, 'creator:' + p.creatorId, p.no + ' tamamlandı · hak edişiniz oluştu: ' + tl(p.fee * p.videoCount), '/icerik-uretici/kazanclar');
    }
    audit(db, 'Video onaylandı', p.no + ' · Video ' + no);
    return p;
  }),

  brandRevise: (pid: string, no: number, reason: string) => run(600, (db) => {
    const p = proj(db, pid); const v = vid(p, no); const limit = R.revisionLimit(db, p);
    if (v.revisions.length >= limit) throw new UserError('Bu video için revize hakkınız doldu. Ek revize için COUGC ile iletişime geçin.');
    v.revisions.push({ date: now(), reason, by: 'brand' }); v.status = 'revize';
    ev(p, 'revise', 'Marka ' + no + '. video için revize talep etti (' + v.revisions.length + '/' + limit + ').');
    notify(db, 'creator:' + p.creatorId, p.no + ' · ' + no + '. video için revize talebi', '/icerik-uretici/isler/' + pid);
    notify(db, 'admin', p.no + ' · marka revize istedi', '/admin/projeler/' + pid);
    audit(db, 'Revize talep edildi', p.no + ' · Video ' + no);
  }),

  adminGrantRevision: (pid: string) => run(400, (db) => {
    const p = proj(db, pid); p.extraRevisions = (p.extraRevisions || 0) + 1;
    ev(p, 'check', 'COUGC kapsam dışı +1 revize hakkı tanımladı.');
    audit(db, 'Ek revize hakkı tanımlandı', p.no);
  }),

  adminCancelProject: (pid: string, reason: string) => run(600, (db) => {
    const p = proj(db, pid);
    p.status = 'iptal';
    p.offers.forEach((o) => { if (o.status === 'pending') o.status = 'withdrawn'; });
    ev(p, 'cancel', 'Proje iptal edildi: ' + reason + ' Video hakkı markaya iade edildi.');
    notify(db, 'brand:' + p.brandId, p.title + ' projesi iptal edildi, video hakkınız iade edildi', '/marka/projeler/' + pid);
    audit(db, 'Proje iptal edildi, hak iade edildi', p.no);
  }),

  adminExtendDeadline: (pid: string, deadline: string) => run(400, (db) => {
    const p = proj(db, pid); const old = p.deadline; p.deadline = deadline;
    ev(p, 'confirm', 'Teslim tarihi güncellendi: ' + fmtDate(old) + ' → ' + fmtDate(deadline) + '.');
    notify(db, 'brand:' + p.brandId, p.title + ' · yeni teslim tarihi ' + fmtDate(deadline), '/marka/projeler/' + pid);
    audit(db, 'Teslim tarihi değiştirildi', p.no);
  }),

  // ---------- Finans ----------
  markPayoutPaid: (pid: string) => run(500, (db) => {
    const p = proj(db, pid);
    p.payout = { status: 'odendi', date: iso(TODAY) };
    notify(db, 'creator:' + p.creatorId, p.no + ' hak edişiniz ödendi: ' + tl(p.fee * p.videoCount), '/icerik-uretici/kazanclar');
    audit(db, 'Hak ediş ödendi olarak işaretlendi', p.no + ' · ' + R.creatorOf(db, p.creatorId)!.name);
  }),

  // ---------- Kullanıcı yönetimi ----------
  setCreatorFlag: (cid: string, flag: 'visible' | 'showcase', value: boolean) => run(250, (db) => {
    const c = R.creatorOf(db, cid)!;
    if (flag === 'showcase' && value && db.creators.filter((x) => x.showcase).length >= db.settings.showcaseSize + 2)
      throw new UserError('Vitrin en fazla ' + (db.settings.showcaseSize + 2) + ' içerik üreticisi içerebilir.');
    c[flag] = value;
    if (flag === 'visible' && !value) c.showcase = false;
    if (flag === 'showcase' && value) c.visible = true;
    audit(db, (flag === 'visible' ? 'Görünürlük ' : 'Vitrin ') + (value ? 'açıldı' : 'kapatıldı'), c.name);
  }),
  setCreatorFee: (cid: string, fee: number) => run(400, (db) => {
    const c = R.creatorOf(db, cid)!; const old = c.fee; c.fee = fee;
    audit(db, 'İçerik Üreticisi ücreti ' + tl(old) + ' → ' + tl(fee), c.name);
  }),
  // Herkese açık başvuru formu: ağ isteği YOK, dosyalar cihazdan çıkmaz; yalnızca özet bu tarayıcıda tutulur.
  submitApplication: (a: Omit<CreatorApplication, 'id' | 'date' | 'status'>) => run(900, (db) => {
    const rec: CreatorApplication = { ...a, id: uid('ba'), date: now(), status: 'pending' };
    db.applications.unshift(rec);
    notify(db, 'admin', ' içerik üreticisi başvurusu gönderdi', '/admin/icerik-ureticileri?tab=basvuru', a.name);
    return rec;
  }),
  reviewFormApplication: (id: string, approve: boolean, o?: { fee: number; gender: 'K' | 'E'; visible: boolean }) => run(500, (db) => {
    const a = db.applications.find((x) => x.id === id); if (!a) throw new UserError('Başvuru bulunamadı.');
    a.status = approve ? 'approved' : 'rejected';
    if (approve && o) {
      const n = db.creators.filter((c) => c.id.startsWith('c-yeni-')).length + 1;
      const cid = 'c-yeni-' + n;
      db.creators.push({
        id: cid, name: a.name, gender: o.gender, city: a.city, age: String(a.age), cats: a.contentTypes, tone: n,
        bio: a.notes || a.contentExperience, rating: 0, done: 0, onTime: 0, fee: Number(o.fee) || 1800, visible: o.visible, showcase: false,
        status: 'active', avail: 'Müsait', joined: iso(TODAY), ig: a.instagram, tt: a.tiktok || '—', followers: '—', email: a.email, phone: a.phone, iban: '', samples: []
      });
      a.creatorId = cid;
    }
    audit(db, 'İçerik üreticisi başvurusu ' + (approve ? 'onaylandı' : 'uygun bulunmadı'), a.name);
  }),
  reviewApplication: (cid: string, approve: boolean, fee: number, visible: boolean) => run(500, (db) => {
    const c = R.creatorOf(db, cid)!;
    c.status = approve ? 'active' : 'rejected';
    if (approve) { c.fee = Number(fee) || 1800; c.visible = visible; }
    audit(db, 'İçerik Üreticisi başvurusu ' + (approve ? 'onaylandı' : 'reddedildi'), c.name);
  }),
  setBrandStatus: (bid: string, status: 'active' | 'passive') => run(400, (db) => {
    const b = R.brandOf(db, bid); b.status = status;
    audit(db, 'Marka ' + (status === 'active' ? 'aktifleştirildi' : 'pasife alındı'), b.name);
  }),
  updatePackage: (id: string, fields: Partial<Db['packages'][number]>) => run(500, (db) => {
    const pk = R.pkgOf(db, id)!; Object.assign(pk, fields);
    audit(db, 'Paket güncellendi: ' + pk.name + ' ' + tl(pk.price), 'Paket: ' + pk.name);
  }),
  toggleCoupon: (code: string) => run(250, (db) => {
    const c = db.coupons.find((x) => x.code === code)!; c.active = !c.active;
    audit(db, 'Kupon ' + (c.active ? 'aktif' : 'pasif'), c.code);
  }),
  addCoupon: (c: Omit<Db['coupons'][number], 'uses' | 'active'>) => run(400, (db) => {
    if (db.coupons.some((x) => x.code === c.code)) throw new UserError('Bu kupon kodu zaten var.');
    db.coupons.unshift({ ...c, uses: 0, active: true });
    audit(db, 'Kupon oluşturuldu', c.code);
  }),
  updateCreatorProfile: (fields: Partial<Db['creators'][number]>) => run(500, (db) => { Object.assign(R.creatorOf(db, CREATOR_ID)!, fields); }),
  updateBrandProfile: (f: Record<string, string>) => run(500, (db) => {
    const b = R.brandOf(db, BRAND_ID);
    b.website = f.website; b.instagram = f.instagram;
    Object.assign(b.contact, { name: f.contactName, phone: f.phone });
    Object.assign(b.billing, { title: f.billingTitle, taxOffice: f.taxOffice, taxNo: f.taxNo, address: f.address });
  }),

  // ---------- Fiyat bilgisi ----------
  // Fiyatlar herkese açık sayfalarda ve standart marka akışında gösterilmez; özel bağlantıyla paylaşılır.
  requestPriceInfo: (brandName: string) => run(450, (db) => {
    notify(db, 'admin', ' fiyat bilgisi istedi — özel bağlantıyı Ayarlar → Paketler ekranından kopyalayın', '/admin/ayarlar', brandName);
    audit(db, 'Fiyat bilgisi talebi alındı', brandName);
  }),
  setPanelPrices: (value: boolean) => run(250, (db) => {
    db.settings.showPanelPrices = value;
    audit(db, 'Marka panelinde paket fiyatları ' + (value ? 'açıldı' : 'kapatıldı'), 'Ayarlar');
  }),

  // ---------- Bildirimler ----------
  markRead: (id: string) => commit((db) => { const n = db.notifications.find((x) => x.id === id); if (n) n.read = true; }),
  markAllRead: (key: string) => commit((db) => { db.notifications.forEach((n) => { if (n.to === key) n.read = true; }); })
};

export function emptyDraft(): Draft {
  return { creators: [], step: 0, videoCount: 1, format: '9:16', platforms: ['Instagram Reels'], shipping: 'evet' };
}
export const getDb = () => useDemo.getState().db;
