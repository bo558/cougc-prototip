'use client';
/* Özel fiyat sayfası: ana menüde ve standart akışta YOKTUR; fiyat isteyen markaya bağlantıyla gönderilir.
   Dikkat: Adresi bilen herkes açabilir. Bu bir erişim güvenliği değildir (robots: noindex kök layout'ta). */
import Link from 'next/link';
import { useDb, useRole } from '@/lib/store/demo-store';
import { useTitle } from '@/hooks/nav';
import { Callout } from '@/components/ui/primitives';
import { PackageComparison, PricingCards } from '@/components/shared/project';

export default function PricingLandingPage() {
  useTitle('Size özel fiyat bilgisi');
  const db = useDb();
  const role = useRole();
  // Demo marka oturumu varsa doğrudan ödeme simülasyonuna, yoksa hesap açmaya gider
  const ctaHref = (id: string) => (role === 'brand' ? '/marka/satin-al/' + id : '/kayit?paket=' + id);
  return (
    <>
      <section className="sec sec-paper" style={{ paddingBottom: 64 }}><div className="container">
        <div className="sec-head center"><span className="eyebrow">Size özel</span><h2>Paketler ve fiyat bilgisi</h2><p>Talebiniz üzerine paylaşılan güncel paket fiyatları. Satın aldığınız video adedi hesabınıza hak olarak tanımlanır; dilediğiniz projede kullanırsınız.</p></div>
        <PricingCards packages={db.packages} cta={(pk) => ({ href: ctaHref(pk.id), label: role === 'brand' ? 'Satın al' : 'Bu paketle başla' })} />
      </div></section>
      <section className="sec" style={{ paddingTop: 64 }}><div className="container" style={{ maxWidth: 920 }}>
        <h2 style={{ fontSize: 26, marginBottom: 20 }}>Paket karşılaştırma</h2>
        <PackageComparison packages={db.packages} showPrice />
        <Callout className="mt-24">Bu sayfa size özel paylaşılmıştır ve menülerde yer almaz. Fiyatlar, revize hakları ve teslim süreleri prototip için örnek değerlerdir; KDV dahil tutar ödeme adımında hesaplanır.</Callout>
        <p className="small muted mt-16 t-center">Sorularınız için <Link className="btn-link" href="/#nasil">süreci inceleyin</Link> veya COUGC ekibine <b className="strong">destek@cougc.demo</b> adresinden ulaşın.</p>
      </div></section>
    </>
  );
}
