import type { Metadata } from 'next';
import { Callout } from '@/components/ui/primitives';

export const metadata: Metadata = { title: 'Yasal metinler' };

const DOCS = ['KVKK Aydınlatma Metni', 'Açık Rıza Metni (pazarlama)', 'Mesafeli Satış Sözleşmesi', 'Ön Bilgilendirme Formu', 'İptal ve İade Koşulları', 'İçerik Üreticisi Sözleşmesi ve Kullanım Hakları'];

export default function LegalPage() {
  return (
    <section className="sec"><div className="container" style={{ maxWidth: 760 }}>
      <span className="eyebrow">Yasal</span><h2 className="mt-16" style={{ fontSize: 36 }}>Yasal metinler</h2>
      <Callout tone="amber" icon="alert" className="mt-24"><b>Bu sayfa prototip için yer tutucudur.</b> KVKK Aydınlatma Metni, Açık Rıza Metni, Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu, İptal/İade Koşulları ve İçerik Üreticisi Sözleşmesi henüz hazırlanmamıştır. Aşağıdaki başlıkların hukuki geçerliliği yoktur; metinler gerçek yayından önce hukuk danışmanlığıyla hazırlanmalıdır.</Callout>
      <div className="stack mt-24">{DOCS.map((t) => <div key={t} className="card card-pad row between"><b className="strong">{t}</b><span className="badge t-gray">Hazırlanacak</span></div>)}</div>
    </div></section>
  );
}
