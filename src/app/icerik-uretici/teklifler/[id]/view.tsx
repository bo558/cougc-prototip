'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { OFFER_STATUS } from '@/lib/domain/status';
import { fmtDate, tl } from '@/lib/format';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Callout, EmptyState, StatusBadge } from '@/components/ui/primitives';
import { AcceptModal, RejectModal } from '@/components/creator/parts';

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const db = useDb(); const router = useRouter();
  useCrumbs([{ t: 'Teklifler', h: '/icerik-uretici/teklifler' }, { t: 'Teklif detayı' }]);
  const p = R.projectOf(db, id);
  const of = p?.offers.filter((o) => o.creatorId === CREATOR_ID).pop();
  if (!p || !of) return <div className="page creator-col"><EmptyState icon="lock" title="Bu teklife erişiminiz yok" text="Yalnızca size gönderilen teklifleri görüntüleyebilirsiniz." action={<Link className="btn btn-dark" href="/icerik-uretici/teklifler">Tekliflere dön</Link>} /></div>;
  const b = R.brandOf(db, p.brandId); const brief = R.briefOf(db, p); const pending = of.status === 'pending';
  return (
    <div className="page creator-col">
      <div className="card card-pad stack">
        <div className="row"><BrandLogo b={b} size="lg" /><div className="grow"><div className="small muted">{b.name} · {b.sector}</div><h1 style={{ fontSize: 21 }}>{p.title}</h1></div></div>
        {!pending && <div><StatusBadge map={OFFER_STATUS} value={of.status} />{of.reason && <p className="small muted mt-8">Gerekçeniz: “{of.reason}”</p>}</div>}
        <div className="offer-card" style={{ padding: 0, border: 0 }}><div className="oc-grid">
          <div><small>Toplam ücret</small><b className="oc-fee" style={{ fontSize: 18 }}>{tl(of.fee * p.videoCount)}</b></div><div><small>Video</small><b>{p.videoCount} adet</b></div><div><small>İstenen teslim</small><b>{fmtDate(p.requestedDeadline)}</b></div>
        </div></div>
        <div className="small muted">{tl(of.fee)} / video · Hak edişiniz videolar marka tarafından onaylandığında oluşur.</div>
        {of.note && <Callout icon="message" className="small"><b>COUGC notu:</b> {of.note}</Callout>}
      </div>
      <div className="card mt-16"><div className="card-head"><h3>Brief özeti</h3></div><div className="card-body">
        <dl className="kv">
          <dt>Ürün</dt><dd>{p.product}</dd><dt>Açıklama</dt><dd>{brief.description}</dd><dt>Hedef kitle</dt><dd>{brief.audience}</dd>
          <dt>Platform</dt><dd>{brief.platforms.join(', ')}</dd><dt>Format / süre</dt><dd>{brief.format} · {brief.duration}</dd><dt>Üslup</dt><dd>{brief.tone}</dd>
          <dt>Vurgular</dt><dd>{brief.highlights}</dd><dt>Yasaklı ifadeler</dt><dd>{brief.forbidden}</dd><dt>Kargo</dt><dd>{p.shipping.required ? 'Ürün COUGC üzerinden size iletilecek' : 'Ürün gönderimi yok'}</dd>
        </dl>
        {pending && <Callout icon="lock" className="mt-16 small">Referanslar, ek dosyalar ve kargo detayları teklifi kabul ettikten sonra açılır.</Callout>}
      </div></div>
      {pending && (
        <div className="stack-sm mt-24">
          <button className="btn btn-primary btn-lg btn-block" onClick={() => openModal(<AcceptModal db={db} p={p} onDone={() => router.push('/icerik-uretici/isler/' + p.id)} />)}><Icon name="check" size={17} />Teklifi kabul et</button>
          <button className="btn btn-ghost btn-lg btn-block" onClick={() => openModal(<RejectModal pid={p.id} onDone={() => router.push('/icerik-uretici/teklifler')} />)}>Reddet</button>
          <p className="xs muted-2 t-center mt-8">Kabul ettiğinizde COUGC teslim tarihini kesinleştirir ve size bildirim gönderir.</p>
        </div>
      )}
    </div>
  );
}
