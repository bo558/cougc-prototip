'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { PAYOUT_STATUS, PROJECT_STATUS } from '@/lib/domain/status';
import { fmtDate, relDays, tl } from '@/lib/format';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { closeModal, openModal } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo, EmptyThumb, VideoThumb } from '@/components/ui/media';
import { Badge, Callout, EmptyState, StatusBadge, Timeline } from '@/components/ui/primitives';
import { AsyncButton } from '@/components/ui/interactive';
import { BriefDetails } from '@/components/shared/project';
import { VideoInfo, VideoModal } from '@/components/shared/video';
import { receivedAction } from '@/components/creator/parts';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const db = useDb();
  const p = R.projectOf(db, id);
  useCrumbs([{ t: 'İşlerim', h: '/icerik-uretici/isler' }, { t: p?.no || 'İş' }]);
  if (!p || p.creatorId !== CREATOR_ID) return <div className="page creator-col"><EmptyState icon="lock" title="Bu işe erişiminiz yok" text="Yalnızca size atanmış projeleri görüntüleyebilirsiniz." action={<Link className="btn btn-dark" href="/icerik-uretici/isler">İşlerime dön</Link>} /></div>;
  const b = R.brandOf(db, p.brandId); const me = R.creatorOf(db, CREATOR_ID)!;
  const canUpload = ['uretimde', 'teslim'].includes(p.status);

  let next: React.ReactNode = null;
  if (p.status === 'kesinlestirme') next = <Callout tone="amber" icon="clock"><b>Kesinleştirme bekleniyor.</b> COUGC teslim tarihini belirlediğinde bildirim alacaksınız.</Callout>;
  else if (p.status === 'kargo') next = p.shipping.status === 'kargoda'
    ? <Callout tone="orange" icon="truck"><div className="row between row-wrap"><span><b>Ürün yolda.</b> {p.shipping.carrier} · {p.shipping.tracking}</span><AsyncButton className="btn btn-primary btn-sm" onRun={receivedAction(p.id)}>Teslim aldım</AsyncButton></div></Callout>
    : <Callout icon="package"><b>Ürünün kargolanması bekleniyor.</b> Kargo bilgisi girildiğinde bildirim alacaksınız.</Callout>;
  else if (p.status === 'tamamlandi') next = <Callout tone="green" icon="check-circle"><b>İş tamamlandı.</b> Hak edişiniz: {tl(p.fee * p.videoCount)} · {PAYOUT_STATUS[p.payout.status].label}</Callout>;

  return (
    <div className="page creator-col">
      <div className="row mb-16"><BrandLogo b={b} size="lg" /><div className="grow" style={{ minWidth: 0 }}><div className="small muted">{b.name} · {p.no}</div><h1 style={{ fontSize: 21 }}>{p.title}</h1></div></div>
      <div className="row-sm row-wrap mb-16"><StatusBadge map={PROJECT_STATUS} value={p.status} />
        {p.deadline && <Badge tone={R.isLate(p) ? 'red' : 'gray'} dot={false}><Icon name="calendar" size={12} /> {fmtDate(p.deadline)} · {relDays(p.deadline)}</Badge>}
        <Badge dot={false}>{tl(p.fee * p.videoCount)}</Badge></div>
      {next && <div className="mb-16">{next}</div>}
      <div className="card"><div className="card-head"><h3>Videolar</h3><span className="xs muted">Video başı {R.revisionLimit(db, p)} revize</span></div>
        {p.videos.map((v) => {
          const needs = canUpload && (v.status === 'bekleniyor' || v.status === 'revize');
          return (
            <div key={v.no} className="video-row" style={{ gridTemplateColumns: '64px 1fr' }}>
              {v.versions.length ? <button className="unstyled-btn" onClick={() => openModal(<VideoModal p={p} v={v} mode="creator" actions={<button className="btn btn-ghost" onClick={closeModal}>Kapat</button>} />)}><VideoThumb tone={me.tone} format={v.format} small /></button> : <EmptyThumb />}
              <div><VideoInfo p={p} v={v} mode="creator" /></div>
              {needs && <div className="vr-actions"><Link className="btn btn-primary" href={`/icerik-uretici/yukle/${p.id}/${v.no}`}><Icon name="upload" size={16} />{v.status === 'revize' || v.adminNote ? 'Yeni sürüm yükle' : 'Video yükle'}</Link></div>}
            </div>
          );
        })}
      </div>
      <div className="card mt-16"><div className="card-head"><h3>Brief</h3></div><div className="card-body"><BriefDetails p={p} b={R.briefOf(db, p)} /></div></div>
      <div className="card mt-16"><div className="card-head"><h3>Geçmiş</h3></div><div className="card-body"><Timeline events={p.events.filter((ev) => !['offer', 'reject'].includes(ev.type))} /></div></div>
    </div>
  );
}
