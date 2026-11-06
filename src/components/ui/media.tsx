/* Avatar, portre, marka logosu ve video önizleme (gerçek görseller yerine nötr illüstrasyon) */
import type { ReactNode } from 'react';
import type { Brand, Creator } from '@/lib/types';
import { Icon } from './Icon';

const TONES = [
  ['#f4dccb', '#e7b897', '#c58a66'], ['#dfe9dd', '#bcd3c1', '#7fa48c'], ['#efe3d2', '#dbc3a1', '#a98861'],
  ['#e4e3ef', '#c5c2de', '#8c88b5'], ['#dae7ef', '#b3cddd', '#7799b0'], ['#f4dedd', '#e1b6b3', '#b9807c'],
  ['#e8e6de', '#cfcabb', '#958f7d'], ['#f3e7cb', '#e2cb92', '#b49550']
];
const BRAND_TONES = [
  ['#fde9dc', '#b8461a'], ['#efe4d8', '#6b4524'], ['#e6efe7', '#2f6a4b'], ['#e4eaf8', '#2b4d9b'],
  ['#fbeacd', '#8a5a00'], ['#ece6f8', '#5a3ea3'], ['#e3f1ee', '#1d6b5f']
];
const tone = (n: number) => TONES[((n % TONES.length) + TONES.length) % TONES.length];

export function Avatar({ c, size }: { c?: Creator | null; size?: 'sm' | 'lg' | 'xl' }) {
  if (!c) return <span className={'avatar ' + (size || '')}>?</span>;
  const t = tone(c.tone);
  return (
    <span className={'avatar ' + (size || '')} style={{ background: t[0], color: t[2] }} title={c.name}>
      <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="16" r="7" fill={t[1]} /><path d="M6 40c1.5-8.5 7-12.5 14-12.5S32.5 31.5 34 40z" fill={t[1]} /></svg>
    </span>
  );
}

export function Portrait({ c, children }: { c: Creator; children?: ReactNode }) {
  const t = tone(c.tone);
  const gid = 'g' + c.id;
  return (
    <div className="portrait">
      <svg className="fig" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t[0]} /><stop offset="1" stopColor={t[1]} /></linearGradient></defs>
        <rect width="200" height="250" fill={`url(#${gid})`} />
        <circle cx="168" cy="40" r="46" fill="#fff" opacity=".18" />
        <path d="M30 250c4-50 32-78 70-78s66 28 70 78z" fill={t[2]} opacity=".85" />
        <rect x="88" y="132" width="24" height="30" rx="10" fill={t[2]} opacity=".75" />
        <ellipse cx="100" cy="98" rx="34" ry="40" fill={t[2]} opacity=".8" />
        {c.gender === 'K'
          ? <path d="M64 74c0-26 16-40 36-40s36 14 36 40v34c-6-10-10-20-12-32-8 6-30 8-48 4-2 10-6 20-12 28z" fill={t[2]} opacity=".55" />
          : <path d="M68 70c0-20 14-32 32-32s32 12 32 30c-10-6-22-8-32-8s-22 2-32 10z" fill={t[2]} opacity=".6" />}
      </svg>
      {children}
    </div>
  );
}

export function BrandLogo({ b, size }: { b: Brand; size?: 'sm' | 'lg' }) {
  const t = BRAND_TONES[b.tone % BRAND_TONES.length];
  return <span className={'brand-logo ' + (size || '')} style={{ background: t[0], color: t[1] }} title={b.name}>{b.mark}</span>;
}

interface VThumbProps { tone?: number; format?: string; label?: string; meta?: string; meta2?: string; watermark?: boolean; small?: boolean; playing?: boolean; children?: ReactNode }
export function VideoThumb({ tone: tn = 0, format, label, meta, meta2, watermark, small, playing, children }: VThumbProps) {
  const t = tone(tn);
  const ratio = format === '1:1' ? 'r-11' : format === '4:5' ? 'r-45' : '';
  return (
    <div className={'vthumb ' + ratio}>
      <svg className="bg" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="90" height="160" fill={t[2]} />
        <rect width="90" height="160" fill={t[1]} opacity=".55" />
        <circle cx="66" cy="34" r="26" fill="#fff" opacity=".16" />
        <rect x="30" y="74" width="30" height="46" rx="8" fill="#fff" opacity=".28" />
        <rect x="36" y="66" width="18" height="10" rx="3" fill="#fff" opacity=".35" />
        <rect x="0" y="120" width="90" height="40" fill="#000" opacity=".18" />
      </svg>
      {watermark && <div className="wm">ÖNİZLEME · COUGC</div>}
      {label && <span className="lbl badge glass no-dot">{label}</span>}
      <span className="play"><Icon name={playing ? 'pause' : 'play'} size={small ? 14 : 18} /></span>
      {meta && <div className="meta"><span className="glass-dark">{meta}</span>{meta2 && <span className="glass-dark">{meta2}</span>}</div>}
      {children}
    </div>
  );
}

export function EmptyThumb() {
  return <div className="vthumb" style={{ background: 'var(--paper-2)', color: 'var(--muted-2)' }}><Icon name="film" size={22} /></div>;
}
