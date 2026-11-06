'use client';
import * as R from '@/lib/domain/rules';
import { fmtDateLong } from '@/lib/format';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHead } from '@/components/ui/primitives';
import { CreditCard } from '@/components/brand/parts';
import { Ledger, PriceRequestModal, PricingCards } from '@/components/shared/project';

export default function MyPackages() {
  useCrumbs([{ t: 'Paketlerim' }]);
  const db = useDb();
  const c = R.credits(db, BRAND_ID);
  const os = R.ordersOfBrand(db, BRAND_ID).filter((o) => o.status === 'paid');
  return (
    <div className="page">
      <PageHead title="Paketlerim" sub="Satın aldığınız video hakları ve kullanım durumu" />
      <div className="credit-hero">
        <CreditCard c={c} compact />
        <div className="card"><div className="card-head"><h3>Aktif paketler</h3></div>
          {os.length ? os.map((o) => {
            const used = R.usedOnOrder(db, o.id); const pk = R.pkgOf(db, o.packageId)!;
            return (
              <div key={o.id} className="list-row"><span className="lr-i"><Icon name="package" size={18} /></span>
                <div className="lr-main"><div className="lr-t">{pk.name} · {o.videos} video</div><div className="lr-s">{o.no} · {fmtDateLong(o.date)} · video başı {pk.revisions} revize</div></div>
                <div style={{ width: 120 }}><div className="xs muted t-right mb-8">{used}/{o.videos} kullanıldı</div><div className="progress"><i style={{ width: (used / o.videos) * 100 + '%' }} /></div></div></div>
            );
          }) : <EmptyState icon="package" title="Henüz paketiniz yok" />}
        </div>
      </div>
      {db.settings.showPanelPrices ? <>
        <div className="section-title mt-32"><h2>Paket satın al</h2><span className="small muted">Fiyatlara KDV dahil değildir</span></div>
        <PricingCards packages={db.packages} cta={(pk) => ({ href: '/marka/satin-al/' + pk.id, label: 'Satın al' })} />
      </> : <>
        <div className="section-title mt-32"><h2>Paketler</h2><span className="small muted">Fiyat bilgisi size özel iletilir</span></div>
        <PricingCards packages={db.packages} showPrice={false} cta={() => ({ label: 'Fiyat bilgisi iste', onClick: () => openModal(<PriceRequestModal brandName={R.brandOf(db, BRAND_ID).name} />) })} />
      </>}
      <div className="card mt-32"><div className="card-head"><h3>Hak hareketleri</h3></div><Ledger db={db} bid={BRAND_ID} /></div>
    </div>
  );
}
