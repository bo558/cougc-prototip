'use client';
/* Herkese açık paket özeti: FİYAT GÖSTERMEZ. Fiyat bilgisi talep üzerine özel bağlantıyla paylaşılır (/fiyat-bilgisi). */
import { useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useTitle } from '@/hooks/nav';
import { Callout } from '@/components/ui/primitives';
import { PackageComparison, PriceRequestModal, PricingCards } from '@/components/shared/project';

export default function PackagesPage() {
  useTitle('Paketler');
  const db = useDb();
  return (
    <>
      <section className="sec sec-paper" style={{ paddingBottom: 64 }}><div className="container">
        <div className="sec-head center"><span className="eyebrow">Paketler</span><h2>İhtiyacınıza uygun kapsam.</h2><p>Video adedi, revize hakkı ve teslim süresine göre paketleri karşılaştırın. Güncel fiyat bilgisini markanıza özel olarak paylaşıyoruz.</p></div>
        <PricingCards packages={db.packages} showPrice={false} cta={() => ({ label: 'Fiyat bilgisi isteyin', onClick: () => openModal(<PriceRequestModal />) })} />
      </div></section>
      <section className="sec" style={{ paddingTop: 64 }}><div className="container" style={{ maxWidth: 920 }}>
        <h2 style={{ fontSize: 26, marginBottom: 20 }}>Paket karşılaştırma</h2>
        <PackageComparison packages={db.packages} />
        <Callout className="mt-24">Revize hakları ve teslim süreleri prototip için örnek değerlerdir.</Callout>
      </div></section>
    </>
  );
}
