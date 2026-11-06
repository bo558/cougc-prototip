/* ==========================================================================
   Demo tarihleri: veri seti 2 Kasım 2026'ya göre yazılmıştır. Ziyaret gününe kaydırılır;
   böylece teslim, teklif ve gecikme durumları hangi gün açılırsa açılsın güncel görünür.
   Yalnızca demo verisini etkiler; gerçek backend'e geçildiğinde bu dosyaya gerek kalmaz.
   ========================================================================== */
import type { Db } from '../types';
import { MONTHS } from '../format';

const DAY_MS = 86400000;
const utc = (ymd: string) => { const [y, m, d] = ymd.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const moveDay = (ymd: string, days: number) => new Date(utc(ymd) + days * DAY_MS).toISOString().slice(0, 10);
const moveMonth = (ym: string, months: number) => { const [y, m] = ym.split('-').map(Number); const d = new Date(Date.UTC(y, m - 1 + months, 1)); return d.toISOString().slice(0, 7); };

const FULL_DATE = /^(\d{4}-\d{2}-\d{2})(T.*)?$/;
const YEAR_MONTH = /^\d{4}-\d{2}$/;
/** Olay ve bildirim metinlerindeki kısa tarihler: "15 Kas" */
const SHORT_DATE = new RegExp(`(\\d{1,2}) (${MONTHS.join('|')})(?![a-zçğıöşü])`, 'g');

function moveText(text: string, days: number) {
  return text.replace(SHORT_DATE, (_, d: string, mon: string) => {
    const ymd = `2026-${String(MONTHS.indexOf(mon) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`;
    const [, m, day] = moveDay(ymd, days).split('-').map(Number);
    return `${day} ${MONTHS[m - 1]}`;
  });
}

function walk(node: unknown, days: number, months: number): void {
  if (Array.isArray(node)) { node.forEach((x, i) => { if (typeof x === 'string') { const m = FULL_DATE.exec(x); if (m) node[i] = moveDay(m[1], days) + (m[2] || ''); } else walk(x, days, months); }); return; }
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== 'string') { walk(v, days, months); continue; }
    const full = FULL_DATE.exec(v);
    if (full) obj[k] = moveDay(full[1], days) + (full[2] || '');
    else if (k === 'm' && YEAR_MONTH.test(v)) obj[k] = moveMonth(v, months);
    else if (k === 'text') obj[k] = moveText(v, days);
  }
}

/** Db içindeki bütün demo tarihlerini verilen güne taşır (kopya üzerinde çağrılmalıdır) */
export function shiftDemoDates(db: Db, toDay: string): Db {
  const from = db.demoDay;
  if (from === toDay) return db;
  const days = Math.round((utc(toDay) - utc(from)) / DAY_MS);
  const [fy, fm] = from.split('-').map(Number); const [ty, tm] = toDay.split('-').map(Number);
  walk(db, days, (ty - fy) * 12 + (tm - fm));
  db.demoDay = toDay;
  return db;
}
