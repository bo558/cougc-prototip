'use client';
import Link from 'next/link';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES, PROJECT_STATUS } from '@/lib/domain/status';
import { fmtDate, relDays, tl } from '@/lib/format';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar, BrandLogo } from '@/components/ui/media';
import { Badge, EmptyState } from '@/components/ui/primitives';
import { AsyncButton } from '@/components/ui/interactive';
import { availTone } from '@/components/shared/creator';
import { earnings, OfferCard, receivedAction, todos } from '@/components/creator/parts';

export default function CreatorHome() {
  useCrumbs([{ t: 'Ana sayfa' }]);
  const db = useDb();
  const c = R.creatorOf(db, CREATOR_ID)!;
  const offers = R.offersForCreator(db, CREATOR_ID); const td = todos(db); const er = earnings(db);
  const active = R.projectsOfCreator(db, CREATOR_ID).filter((p) => ACTIVE_STATUSES.includes(p.status)).sort((a, b) => (a.deadline || '9').localeCompare(b.deadline || '9'));
  return (
    <div className="page creator-col">
      <div className="row mb-24"><Avatar c={c} size="lg" />
        <div className="grow"><h1 style={{ fontSize: 22 }}>Merhaba, {c.name.split(' ')[0]}</h1><p className="small muted">{offers.length > 0 && `${offers.length} yeni teklif · `}{td.length} yapılacak iş</p></div>
        <Badge tone={availTone(c.avail)}>{c.avail}</Badge></div>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
        {[['Bekleyen', er.due], ['Süren işler', er.expected], ['Ödenen', er.paid]].map(([k, v]) => (
          <Link key={k} className="stat" href="/icerik-uretici/kazanclar" style={{ padding: 14 }}><div className="k">{k}</div><div className="v" style={{ fontSize: 20 }}>{tl(v as number)}</div></Link>
        ))}
      </div>
      {offers.length > 0 && <>
        <div className="section-title mt-32"><h2>Yeni teklifler</h2><Link className="btn-link small" href="/icerik-uretici/teklifler">Tümü</Link></div>
        <div className="stack">{offers.map((p) => <OfferCard key={p.id} db={db} p={p} />)}</div>
      </>}
      <div className="section-title mt-32"><h2>Yapılacaklar</h2></div>
      <div className="card">{td.length ? td.map((x) => (
        <div key={x.p.id + x.title} className="list-row"><span className={'lr-i ' + x.t}><Icon name={x.icon} size={18} /></span>
          <Link className="lr-main" href={'/icerik-uretici/isler/' + x.p.id}><div className="lr-t">{x.title}</div><div className="lr-s">{R.brandOf(db, x.p.brandId).name} · {x.p.title}{x.p.deadline && ' · ' + relDays(x.p.deadline)}</div></Link>
          {x.href ? <Link className="btn btn-primary btn-sm" href={x.href}>{x.cta}</Link> : <AsyncButton className="btn btn-dark btn-sm" busyLabel="…" onRun={receivedAction(x.p.id)}>{x.cta}</AsyncButton>}
        </div>
      )) : <EmptyState icon="check-circle" title="Her şey güncel" text="Yeni bir iş geldiğinde burada göreceksiniz." />}</div>
      <div className="section-title mt-32"><h2>Yaklaşan teslimler</h2><Link className="btn-link small" href="/icerik-uretici/isler">İşlerim</Link></div>
      <div className="card">{active.length ? active.map((p) => { const lt = R.isLate(p); return (
        <Link key={p.id} className="list-row" href={'/icerik-uretici/isler/' + p.id}><BrandLogo b={R.brandOf(db, p.brandId)} size="sm" />
          <div className="lr-main"><div className="lr-t">{p.title}</div><div className="lr-s">{PROJECT_STATUS[p.status].label}</div></div>
          <div className="t-right"><div className={'small strong ' + (lt ? 'red' : '')}>{p.deadline ? fmtDate(p.deadline) : '—'}</div><div className={'xs ' + (lt ? 'red' : 'muted-2')}>{p.deadline ? relDays(p.deadline) : 'kesinleşecek'}</div></div></Link>
      ); }) : <EmptyState icon="briefcase" title="Aktif işiniz yok" />}</div>
    </div>
  );
}
