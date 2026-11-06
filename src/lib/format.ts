/* Tarih, para ve metin biçimlendirme yardımcıları */

/** Demo "bugün": ziyaret günü. Demo veriler bu güne kaydırılır (bkz. mock/dates.ts), böylece tutarlı ve güncel kalır. */
const visitDay = new Date();
export const TODAY = new Date(visitDay.getFullYear(), visitDay.getMonth(), visitDay.getDate(), 10);

export const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const MONTHS_LONG = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export const tl = (n: number) => '₺' + Math.round(Number(n || 0)).toLocaleString('tr-TR');

export const toDate = (d: string | Date) => (d instanceof Date ? d : new Date(String(d).length <= 10 ? d + 'T12:00:00' : d));

export function fmtDate(d?: string | null) {
  if (!d) return '—';
  const x = toDate(d);
  const y = x.getFullYear() === TODAY.getFullYear() ? '' : ' ' + x.getFullYear();
  return x.getDate() + ' ' + MONTHS[x.getMonth()] + y;
}
export function fmtDateLong(d?: string | null) {
  if (!d) return '—';
  const x = toDate(d);
  return x.getDate() + ' ' + MONTHS_LONG[x.getMonth()] + ' ' + x.getFullYear();
}
export function fmtDateTime(d?: string | null) {
  if (!d) return '—';
  const x = toDate(d);
  return fmtDate(d) + ', ' + String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0');
}

export function daysUntil(d?: string | null) {
  if (!d) return null;
  const a = toDate(d); const b = TODAY;
  const ms = +new Date(a.getFullYear(), a.getMonth(), a.getDate()) - +new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round(ms / 86400000);
}
export function relDays(d?: string | null) {
  const n = daysUntil(d);
  if (n == null) return '';
  if (n === 0) return 'bugün';
  if (n === 1) return 'yarın';
  if (n === -1) return 'dün';
  return n > 0 ? n + ' gün kaldı' : Math.abs(n) + ' gün gecikti';
}
export function ago(d: string) {
  const mins = Math.round((+TODAY - +toDate(d)) / 60000);
  if (mins < 1) return 'şimdi';
  if (mins < 60) return mins + ' dk önce';
  const h = Math.round(mins / 60);
  if (h < 24) return h + ' sa önce';
  const days = Math.round(h / 24);
  if (days < 7) return days + ' gün önce';
  return fmtDate(d);
}

export const iso = (d: string | Date) => { const x = toDate(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
export const addDays = (d: string | Date, n: number) => { const x = new Date(toDate(d)); x.setDate(x.getDate() + n); return iso(x); };
/** Demo saati: bugünün tarihi + gerçek saat */
export const now = () => { const r = new Date(); const x = new Date(TODAY); x.setHours(r.getHours(), r.getMinutes(), r.getSeconds()); return x.toISOString(); };

export const initials = (name: string) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toLocaleUpperCase('tr-TR');
export const uid = (p = 'id') => p + '-' + Math.random().toString(36).slice(2, 8);
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const lower = (s: string) => s.toLocaleLowerCase('tr-TR');

export function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2).replace('.', ',') + ' GB';
}
export const rating = (n: number) => n.toFixed(1).replace('.', ',');
