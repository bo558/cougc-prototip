'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { ago, fmtDate, relDays } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar, BrandLogo, VideoThumb } from '@/components/ui/media';
import { EmptyState, PageHead, Tabs } from '@/components/ui/primitives';
import { ConfirmModal, openAdminVideo, ReviewAppModal } from '@/components/admin/modals';
import { CreatorProfileModal } from '@/components/shared/creator';
import { PreferenceTable } from '@/components/admin/preferences';
import { FormApplicationRow } from '@/components/admin/applications';

export default function ApprovalsPage() {
  useCrumbs([{ t: 'Onay bekleyenler' }]);
  const db = useDb();
  const qu = R.adminQueue(db);
  const appCount = qu.applications.length + qu.formApplications.length;
  const tab = useSearchParams().get('tab') || (qu.videos.length ? 'video' : qu.briefs.length ? 'brief' : qu.preferences.length ? 'tercih' : qu.confirm.length ? 'kesin' : 'basvuru');
  const tabs = [
    { key: 'video', label: 'Video ön kontrol', n: qu.videos.length, href: '/admin/onaylar?tab=video' },
    { key: 'brief', label: 'Brief & seçim', n: qu.briefs.length, href: '/admin/onaylar?tab=brief' },
    { key: 'tercih', label: 'Marka tercihleri', n: qu.preferences.length, href: '/admin/onaylar?tab=tercih' },
    { key: 'kesin', label: 'Kesinleştirme', n: qu.confirm.length, href: '/admin/onaylar?tab=kesin' },
    { key: 'basvuru', label: 'İçerik Üreticisi başvuruları', n: appCount, href: '/admin/onaylar?tab=basvuru' }
  ];

  let body: React.ReactNode;
  if (tab === 'video') {
    const rows = qu.videos.flatMap((p) => p.videos.filter((v) => v.status === 'admin_kontrol').map((v) => ({ p, v })));
    body = rows.length ? rows.map(({ p, v }) => {
      const c = R.creatorOf(db, p.creatorId)!;
      return (
        <div key={p.id + v.no} className="video-row">
          <button className="unstyled-btn" onClick={() => openAdminVideo(p.id, v.no)}><VideoThumb tone={c.tone} format={v.format} small /></button>
          <div><div className="strong">{p.title} · Video {v.no}</div>
            <div className="small muted mt-8">{R.brandOf(db, p.brandId).name} · {c.name} · v{v.versions.length} · {ago(v.versions[v.versions.length - 1].date)}</div>
            <div className="small muted">Teslim: {fmtDate(p.deadline)} ({relDays(p.deadline)})</div></div>
          <div className="vr-actions"><Link className="btn btn-ghost btn-sm" href={'/admin/projeler/' + p.id}>Projeye git</Link>
            <button className="btn btn-dark btn-sm" onClick={() => openAdminVideo(p.id, v.no)}><Icon name="play" size={12} /> Önizle ve kontrol et</button></div>
        </div>
      );
    }) : <EmptyState icon="check-circle" title="Kontrol bekleyen video yok" text="İçerik Üreticileri video yüklediğinde burada listelenir." />;
  } else if (tab === 'brief') {
    body = qu.briefs.length ? qu.briefs.map((p) => {
      const rej = p.offers.filter((o) => o.status === 'rejected');
      return (
        <Link key={p.id} className="list-row" href={'/admin/projeler/' + p.id}><BrandLogo b={R.brandOf(db, p.brandId)} />
          <div className="lr-main"><div className="lr-t">{p.no} · {p.title}</div><div className="lr-s">{R.brandOf(db, p.brandId).name} · {p.videoCount} video · istenen teslim {fmtDate(p.requestedDeadline)}</div>
            {rej.length > 0 && <div className="xs red mt-8"><Icon name="x-circle" size={12} /> {rej.map((o) => R.creatorOf(db, o.creatorId)!.name).join(', ')} reddetti</div>}</div>
          <div className="avatar-stack hide-sm">{p.preferred.map((id) => <Avatar key={id} c={R.creatorOf(db, id)} size="sm" />)}</div>
          <span className="btn btn-dark btn-sm">İncele</span></Link>
      );
    }) : <EmptyState icon="check-circle" title="İncelenecek brief yok" text="Markalar brief gönderdiğinde burada listelenir." />;
  } else if (tab === 'tercih') {
    body = qu.preferences.length ? <PreferenceTable db={db} list={qu.preferences} /> : <EmptyState icon="check-circle" title="Yeni marka tercihi yok" text="Markalar “Tercih Et” düğmesine bastığında burada listelenir." />;
  } else if (tab === 'kesin') {
    body = qu.confirm.length ? qu.confirm.map((p) => (
      <div key={p.id} className="list-row"><Avatar c={R.creatorOf(db, p.creatorId)} />
        <div className="lr-main"><div className="lr-t">{p.no} · {p.title}</div><div className="lr-s">{R.creatorOf(db, p.creatorId)!.name} kabul etti · {R.brandOf(db, p.brandId).name} · istenen teslim {fmtDate(p.requestedDeadline)}</div></div>
        <Link className="btn btn-ghost btn-sm hide-sm" href={'/admin/projeler/' + p.id}>Detay</Link>
        <button className="btn btn-dark btn-sm" onClick={() => openModal(<ConfirmModal pid={p.id} />)}>Kesinleştir</button></div>
    )) : <EmptyState icon="check-circle" title="Kesinleştirilecek proje yok" text="İçerik üreticisi bir teklifi kabul ettiğinde burada görünür." />;
  } else {
    body = appCount ? <>{qu.formApplications.map((a) => <FormApplicationRow key={a.id} a={a} />)}{qu.applications.map((c) => (
      <div key={c.id} className="list-row"><Avatar c={c} />
        <div className="lr-main"><div className="lr-t">{c.name} · {c.city} · {c.age}</div><div className="lr-s">{c.cats.join(', ')} · {c.ig} · {c.followers} takipçi · başvuru {fmtDate(c.joined)}</div></div>
        <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="admin" />)}>Profili gör</button>
        <button className="btn btn-dark btn-sm" onClick={() => openModal(<ReviewAppModal cid={c.id} />)}>Değerlendir</button></div>
    ))}</> : <EmptyState icon="users" title="Bekleyen başvuru yok" text="Yeni içerik üreticisi başvuruları burada listelenir." />;
  }

  return (
    <div className="page">
      <PageHead title="Onay bekleyenler" sub="Sırası COUGC ekibinde olan tüm işler tek kuyrukta." />
      <div className="card"><div style={{ padding: '0 12px' }}><Tabs items={tabs} active={tab} /></div>{body}</div>
    </div>
  );
}
