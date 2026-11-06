/* Temel sunum bileşenleri: rozet, boş durum, istatistik, sayfa başlığı, sekmeler, süreç, zaman çizelgesi, grafik */
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ProjectEvent, StatusDef } from '@/lib/types';
import { fmtDateTime } from '@/lib/format';
import { Icon, type IconName } from './Icon';

export function Badge({ tone = 'gray', dot = true, children, className }: { tone?: string; dot?: boolean; children: ReactNode; className?: string }) {
  return <span className={'badge t-' + tone + (dot ? '' : ' no-dot') + (className ? ' ' + className : '')}>{children}</span>;
}

/** Durum sözlüğünden rozet: mode="brand" marka paneline özel etiketi kullanır */
export function StatusBadge<K extends string>({ map, value, mode }: { map: Record<K, StatusDef>; value: K; mode?: 'brand' }) {
  const s = map[value] || { label: value, tone: 'gray' };
  return <Badge tone={s.tone}>{(mode && s.brand) || s.label}</Badge>;
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="ei"><Icon name={icon} size={24} /></div>
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function Stat({ k, v, d, icon, href }: { k: string; v: ReactNode; d?: ReactNode; icon?: IconName; href?: string }) {
  const body = (<><div className="k">{icon && <Icon name={icon} size={15} />}{k}</div><div className="v">{v}</div>{d && <div className="d">{d}</div>}</>);
  return href ? <Link className="stat" href={href}>{body}</Link> : <div className="stat">{body}</div>;
}

export function PageHead({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}</div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export interface TabItem { key: string; label: ReactNode; href: string; n?: number | null }
export function Tabs({ items, active }: { items: TabItem[]; active: string }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <Link key={t.key} className={'tab ' + (t.key === active ? 'on' : '')} href={t.href} role="tab" aria-selected={t.key === active} scroll={false}>
          {t.label}{t.n != null && <span className="n">{t.n}</span>}
        </Link>
      ))}
    </div>
  );
}
export function Chips({ items, active }: { items: TabItem[]; active: string }) {
  return (
    <div className="chips">
      {items.map((t) => (
        <Link key={t.key} className={'chip ' + (t.key === active ? 'on' : '')} href={t.href} scroll={false}>
          {t.label}{t.n != null && <span className="n">{t.n}</span>}
        </Link>
      ))}
    </div>
  );
}

export function Callout({ tone, icon = 'info', children, className }: { tone?: 'orange' | 'green' | 'amber' | 'red'; icon?: IconName; children: ReactNode; className?: string }) {
  return <div className={'callout' + (tone ? ' c-' + tone : '') + (className ? ' ' + className : '')}><Icon name={icon} size={18} /><div className="grow">{children}</div></div>;
}

export function Track({ steps, current }: { steps: { t: string; s?: string }[]; current: number }) {
  return (
    <ol className="track">
      {steps.map((s, i) => (
        <li key={i} className={i < current ? 'done' : i === current ? 'cur' : ''}>
          <span className="nd">{i < current && <Icon name="check" size={12} />}</span>
          <div><div className="tt">{s.t}</div>{s.s && <div className="ts">{s.s}</div>}</div>
        </li>
      ))}
    </ol>
  );
}

const EV: Record<string, [IconName, string]> = {
  brief: ['file', ''], offer: ['send', 't-blue'], accept: ['check', 't-green'], reject: ['x', 't-red'], confirm: ['calendar', 't-orange'],
  ship: ['truck', 't-blue'], upload: ['upload', 't-orange'], check: ['shield', 't-blue'], revise: ['revise', 't-orange'],
  approve: ['check-circle', 't-green'], done: ['check-circle', 't-green'], cancel: ['ban', 't-red']
};
export function Timeline({ events, limit }: { events: ProjectEvent[]; limit?: number }) {
  const list = events.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit || 99);
  return (
    <ul className="timeline">
      {list.map((ev, i) => {
        const m = EV[ev.type] || ['info', ''];
        return (
          <li key={i}><span className={'ti ' + m[1]}><Icon name={m[0]} size={15} /></span>
            <div><div className="tx">{ev.text}</div><div className="tm">{fmtDateTime(ev.date)}</div></div></li>
        );
      })}
    </ul>
  );
}

/** Basit SVG sütun grafiği */
export function BarChart({ data, h = 220, fmt = (v: number) => String(v), label }: { data: { l: string; v: number; hi?: boolean; muted?: boolean }[]; h?: number; fmt?: (v: number) => string; label?: string }) {
  const W = 600, H = h, pad = { l: 44, r: 8, t: 14, b: 28 };
  const max = Math.max(...data.map((d) => d.v), 1);
  const nice = Math.ceil(max / 4 / 10000) * 10000 * 4 || 4;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, bw = iw / data.length;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label || 'Grafik'}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = pad.t + ih - (ih * i) / 4;
        return <g key={i}><line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#eef0ec" /><text x={pad.l - 8} y={y + 4} textAnchor="end">{fmt((nice * i) / 4)}</text></g>;
      })}
      {data.map((d, i) => {
        const bh = (d.v / nice) * ih; const x = pad.l + i * bw + bw * 0.22; const w = bw * 0.56;
        return (
          <g key={d.l + i}>
            <rect x={x} y={pad.t + ih - bh} width={w} height={Math.max(bh, 1)} rx="6" fill={d.hi ? 'var(--orange)' : d.muted ? '#d9dcd5' : 'var(--ink)'}><title>{d.l + ': ' + fmt(d.v)}</title></rect>
            <text x={x + w / 2} y={H - 8} textAnchor="middle">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Skeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Yükleniyor">
      <div className="sk" style={{ height: 28, width: 260, marginBottom: 10 }} />
      <div className="sk" style={{ height: 14, width: 380, maxWidth: '80%', marginBottom: 28 }} />
      <div className="stats">{[0, 1, 2, 3].map((i) => <div key={i} className="stat"><div className="sk" style={{ height: 12, width: '50%' }} /><div className="sk" style={{ height: 26, width: '40%' }} /></div>)}</div>
      <div className="card mt-24"><div className="card-body stack">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="sk" style={{ height: 14, width: '60%' }} />)}</div></div>
    </div>
  );
}

export function Seg({ items }: { items: { label: string; on: boolean; href?: string; onClick?: () => void }[] }) {
  return (
    <div className="seg">
      {items.map((it) => it.href
        ? <Link key={it.label} href={it.href} className={it.on ? 'on' : ''} scroll={false} style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{it.label}</Link>
        : <button key={it.label} type="button" className={it.on ? 'on' : ''} onClick={it.onClick}>{it.label}</button>)}
    </div>
  );
}
