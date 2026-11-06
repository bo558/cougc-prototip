'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES, PROJECT_STATUS, VIDEO_STATUS } from '@/lib/domain/status';
import { fileSize, fmtDateLong, fmtDateTime, relDays, tl } from '@/lib/format';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Badge, EmptyState, PageHead, StatusBadge, Tabs } from '@/components/ui/primitives';

export default function MyJobs() {
  useCrumbs([{ t: 'İşlerim' }]);
  const db = useDb();
  const tab = useSearchParams().get('tab') || 'aktif';
  const all = R.projectsOfCreator(db, CREATOR_ID);
  const sets = { aktif: all.filter((p) => ACTIVE_STATUSES.includes(p.status)), tamam: all.filter((p) => p.status === 'tamamlandi') };
  const deliveries = all.flatMap((p) => p.videos.flatMap((v) => v.versions.map((ver) => ({ p, v, ver })))).sort((a, b) => b.ver.date.localeCompare(a.ver.date));
  const tabs = [{ key: 'aktif', label: 'Aktif', n: sets.aktif.length, href: '/icerik-uretici/isler' }, { key: 'teslim', label: 'Teslimatlar', n: deliveries.length, href: '/icerik-uretici/isler?tab=teslim' }, { key: 'tamam', label: 'Tamamlanan', n: sets.tamam.length, href: '/icerik-uretici/isler?tab=tamam' }];

  let body: React.ReactNode;
  if (tab === 'teslim') {
    body = <div className="card">{deliveries.length ? deliveries.map(({ p, v, ver }) => (
      <Link key={p.id + v.no + ver.v} className="list-row" href={'/icerik-uretici/isler/' + p.id}><span className="lr-i"><Icon name="film" size={18} /></span>
        <div className="lr-main"><div className="lr-t">{p.title} · Video {v.no} · v{ver.v}</div><div className="lr-s">{fmtDateTime(ver.date)} · {fileSize(ver.size)} · {ver.dur}</div></div>
        {ver.v === v.versions.length ? <StatusBadge map={VIDEO_STATUS} value={v.status} /> : <Badge dot={false}>Önceki sürüm</Badge>}</Link>
    )) : <EmptyState icon="film" title="Henüz teslimat yok" />}</div>;
  } else {
    const list = tab === 'tamam' ? sets.tamam : sets.aktif;
    body = list.length ? <div className="stack">{list.map((p) => {
      const b = R.brandOf(db, p.brandId); const done = p.videos.filter((v) => v.status === 'onaylandi').length;
      return (
        <Link key={p.id} className="offer-card card-link" href={'/icerik-uretici/isler/' + p.id}>
          <div className="oc-top"><BrandLogo b={b} /><div className="grow" style={{ minWidth: 0 }}><b className="strong">{p.title}</b><div className="small muted">{b.name} · {p.no}</div></div>
            {p.videos.some((v) => v.status === 'revize') ? <Badge tone="orange">Revize var</Badge> : R.isLate(p) && <Badge tone="red">Gecikti</Badge>}</div>
          <div className="row between small"><StatusBadge map={PROJECT_STATUS} value={p.status} /><span className="muted">{done}/{p.videoCount} video onaylandı</span></div>
          <div className="progress"><i style={{ width: (done / p.videoCount) * 100 + '%' }} /></div>
          <div className="row between small muted"><span><Icon name="calendar" size={13} /> {p.deadline ? fmtDateLong(p.deadline) + ' · ' + relDays(p.deadline) : 'Teslim tarihi kesinleşecek'}</span><span>{tl(p.fee * p.videoCount)}</span></div>
        </Link>
      );
    })}</div> : <div className="card"><EmptyState icon="briefcase" title={tab === 'aktif' ? 'Aktif işiniz yok' : 'Tamamlanan iş yok'} text={tab === 'aktif' ? 'Yeni teklifleri kabul ettiğinizde işleriniz burada listelenir.' : undefined}
      action={tab === 'aktif' && <Link className="btn btn-ghost" href="/icerik-uretici/teklifler">Tekliflere git</Link>} /></div>;
  }
  return <div className="page creator-col"><PageHead title="İşlerim" /><div className="mb-16"><Tabs items={tabs} active={tab} /></div>{body}</div>;
}
