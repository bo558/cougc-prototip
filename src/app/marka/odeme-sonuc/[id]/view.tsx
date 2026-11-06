'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { tl } from '@/lib/format';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/primitives';

export default function PaymentResult() {
  const { id } = useParams<{ id: string }>();
  const db = useDb();
  useCrumbs([{ t: 'Paketlerim', h: '/marka/paketler' }, { t: 'Ödeme sonucu' }]);
  const o = R.orderOf(db, id);
  if (!o || o.brandId !== BRAND_ID) return <div className="page"><EmptyState icon="receipt" title="Sipariş bulunamadı" /></div>;
  const pk = R.pkgOf(db, o.packageId)!;
  if (o.status === 'failed') return (
    <div className="page"><div className="result card card-pad" style={{ maxWidth: 560 }}>
      <div className="ri fail"><Icon name="x" size={34} /></div><h1>Ödeme tamamlanamadı</h1><p>{o.failReason} Kartınızdan herhangi bir tutar çekilmedi.</p>
      <div className="summary-list" style={{ width: '100%', marginTop: 12 }}><div><span>Sipariş no</span><b>{o.no}</b></div><div><span>Paket</span><b>{pk.name}</b></div><div><span>Tutar</span><b>{tl(R.orderTotal(db, o))}</b></div></div>
      <div className="row mt-16"><Link className="btn btn-primary" href={'/marka/satin-al/' + pk.id}>Tekrar dene</Link><Link className="btn btn-ghost" href="/marka/odemeler">Ödeme geçmişi</Link></div>
    </div></div>
  );
  return (
    <div className="page"><div className="result card card-pad" style={{ maxWidth: 560 }}>
      <div className="ri ok"><Icon name="check" size={34} /></div><h1>Ödemeniz alındı</h1>
      <p>Hesabınıza <b className="strong">{o.videos} video hakkı</b> tanımlandı. Artık içerik üreticilerini inceleyip tercih edebilir ve brief gönderebilirsiniz.</p>
      <div className="summary-list" style={{ width: '100%', marginTop: 12 }}>
        <div><span>Sipariş no</span><b>{o.no}</b></div><div><span>Paket</span><b>{pk.name} · {o.videos} video</b></div><div><span>Ödenen tutar</span><b>{tl(R.orderTotal(db, o))}</b></div>
        <div><span>Fatura</span><b>{o.invoice}</b></div><div><span>Kalan video hakkı</span><b>{R.credits(db, BRAND_ID).available}</b></div>
      </div>
      <div className="row row-wrap mt-16" style={{ justifyContent: 'center' }}><Link className="btn btn-primary" href="/marka/icerik-ureticileri"><Icon name="users" size={15} />İçerik Üreticilerini incele</Link><Link className="btn btn-ghost" href="/marka/odemeler">Ödeme geçmişi</Link></div>
    </div></div>
  );
}
