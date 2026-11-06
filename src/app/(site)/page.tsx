'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import * as R from '@/lib/domain/rules';
import { useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useTitle } from '@/hooks/nav';
import { Icon, Star, type IconName } from '@/components/ui/Icon';
import { Avatar, Portrait, VideoThumb } from '@/components/ui/media';
import { Badge } from '@/components/ui/primitives';
import { PriceRequestModal, PricingCards } from '@/components/shared/project';

function Step({ icon, no, t, p }: { icon: IconName; no: string; t: string; p: string }) {
  return <div><div className="si"><Icon name={icon} size={20} /></div><span className="no">{no}</span><h3>{t}</h3><p>{p}</p></div>;
}
function Trust({ icon, t, p }: { icon: IconName; t: string; p: string }) {
  return <div><div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center' }}><Icon name={icon} size={20} /></div><h3>{t}</h3><p>{p}</p></div>;
}
function Faq({ q, children }: { q: string; children: ReactNode }) {
  return <details><summary>{q}<Icon name="plus" size={18} /></summary><p>{children}</p></details>;
}

export default function HomePage() {
  useTitle('UGC video platformu');
  const db = useDb();
  const show = db.creators.filter((c) => c.showcase && c.visible).slice(0, 6);
  const cz = R.creatorOf(db, 'c-zeynep')!, cs = R.creatorOf(db, 'c-selin')!, cd = R.creatorOf(db, 'c-deniz')!;
  return (
    <>
      <section className="hero"><div className="container in">
        <div>
          <span className="eyebrow">Markalar için UGC platformu</span>
          <h1>Gerçek insanlar.<br />Satış getiren <em>videolar.</em></h1>
          <p className="lead">İçerik üreticilerini inceleyin, tercihlerinizi iletin, briefinizi gönderin. Uygun içerik üreticisini birlikte belirleyelim; çekimden revizeye kadar her adımı COUGC ekibi yönetsin.</p>
          <div className="cta"><Link className="btn btn-primary btn-lg" href="/kayit">Marka hesabı aç <Icon name="arrow-right" size={16} /></Link><Link className="btn btn-ghost btn-lg" href="/paketler">Paketleri incele</Link></div>
          <div className="proof"><div><b>10+</b>seçilmiş içerik üreticisi vitrini</div><div><b>7–21 gün</b>paket bazlı teslim</div><div><b>Kontrollü</b>revize ve onay süreci</div></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hv hv1"><VideoThumb tone={cd.tone} meta="Yemek & İçecek" /></div>
          <div className="hv hv2"><VideoThumb tone={cz.tone} meta="Cilt bakımı" meta2="0:29" /></div>
          <div className="hv hv3"><VideoThumb tone={cs.tone} meta="Moda" /></div>
          <div className="float f1"><Avatar c={cz} /><div><b>Zeynep K.</b><span className="muted">teklifi kabul etti</span></div></div>
          <div className="float f2"><Badge tone="green">Onaylandı</Badge><div><b>Hydra Serum · Video 1</b><span className="muted">Final dosya hazır</span></div></div>
        </div>
      </div></section>

      <section className="sec" id="nasil"><div className="container">
        <div className="sec-head"><span className="eyebrow">Nasıl çalışır</span><h2>Dört adımda yayına hazır UGC.</h2><p>İçerik üreticilerini incelemek, brief yazmak, kargoyu takip etmek ve revizeleri yönetmek tek ekranda.</p></div>
        <div className="steps4">
          <Step icon="package" no="01" t="Paketinizi belirleyin" p="1, 3 veya 5 videoluk paketlerden ihtiyacınıza uygun olanı belirleyin. Fiyat bilgisi size özel olarak iletilir." />
          <Step icon="users" no="02" t="İçerik üreticilerini inceleyin" p="Fotoğraf, profil ve portföyleri inceleyin; beğendiklerinizi “Tercih Et” ile COUGC ekibine iletin." />
          <Step icon="file" no="03" t="Brief ve görüşme" p="Briefinizi gönderin. COUGC ekibi uygun içerik üreticilerini önerir; nihai seçim birlikte yapacağımız görüşmede belirlenir." />
          <Step icon="check-circle" no="04" t="Onaylayın, indirin" p="Videoyu önizleyin; onaylayın veya gerekçeli revize isteyin. Final dosyalar tek tıkla indirilir." />
        </div>
      </div></section>

      <section className="sec sec-paper" id="icerik-ureticileri"><div className="container">
        <div className="row between row-wrap" style={{ alignItems: 'flex-end', marginBottom: 36 }}>
          <div className="sec-head" style={{ margin: 0 }}><span className="eyebrow">İçerik Üreticileri</span><h2>Markanıza uygun yüzler.</h2><p>Her içerik üreticisi COUGC tarafından incelenir; kategori, şehir ve müsaitlik bilgileriyle listelenir.</p></div>
          <Link className="btn btn-ghost" href="/basvuru">Başvuru yap <Icon name="arrow-right" size={15} /></Link>
        </div>
        <div className="creator-strip">
          {show.map((c) => (
            <div key={c.id}>
              <Portrait c={c}><div className="br"><span className="badge glass no-dot">{c.cats[0]}</span></div></Portrait>
              <div className="mt-12"><b className="strong">{c.name}</b><div className="small muted">{c.city}</div></div>
            </div>
          ))}
        </div>
        <p className="xs muted-2 mt-16">Prototipte içerik üreticisi fotoğrafları yerine temsilî illüstrasyon kullanılmıştır.</p>
      </div></section>

      <section className="sec"><div className="container">
        <div className="sec-head center"><span className="eyebrow">Paketler</span><h2>İhtiyacınıza uygun kapsam.</h2><p>Video adedi, revize hakkı ve teslim koşulları net. Güncel fiyat bilgisini markanıza özel olarak paylaşıyoruz.</p></div>
        <PricingCards packages={db.packages} showPrice={false} cta={() => ({ label: 'Fiyat bilgisi isteyin', onClick: () => openModal(<PriceRequestModal />) })} />
      </div></section>

      <section className="sec sec-paper"><div className="container">
        <div className="sec-head"><span className="eyebrow">Neden COUGC</span><h2>Kontrol sizde, operasyon bizde.</h2></div>
        <div className="trust">
          <Trust icon="shield" t="Kalite kontrollü teslim" p="Her video size ulaşmadan önce COUGC ekibi tarafından brief’e uygunluk açısından kontrol edilir." />
          <Trust icon="revise" t="Takip edilen revize hakları" p="Paketinizdeki revize hakları otomatik izlenir; her talep gerekçesiyle kayıt altına alınır." />
          <Trust icon="lock" t="Güvenli ödeme ve dosyalar" p="Ödeme sağlayıcı tarafından doğrulanır; dosyalarınıza yalnızca yetkili kişiler erişir." />
        </div>
      </div></section>

      <section className="sec"><div className="container">
        <div className="sec-head center"><span className="eyebrow">Sık sorulanlar</span><h2>Merak edilenler</h2></div>
        <div className="faq">
          <Faq q="Tercih ettiğim içerik üreticisi projeye kesin olarak atanır mı?">Hayır. “Tercih Et” bir atama veya kesin onay değildir; tercihiniz COUGC ekibine iletilir. Uygun içerik üreticilerini COUGC ekibi değerlendirip size önerir, nihai seçim birlikte yapacağımız görüşmede belirlenir. Video hakkınız bu süreçte korunur.</Faq>
          <Faq q="Videoları ne zaman teslim alırım?">Teslim tarihi; ürünün içerik üreticisine ulaşması ve içerik üreticisinin uygunluğuna göre COUGC tarafından kesinleştirilir ve proje ekranınızda görünür.</Faq>
          <Faq q="Paket fiyatlarını nereden öğrenebilirim?">Fiyat bilgisini talep eden markalara özel bağlantıyla iletiyoruz. Paket kartlarındaki “Fiyat bilgisi isteyin” düğmesini kullanabilirsiniz.</Faq>
          <Faq q="Revize hakkım dolarsa ne olur?">Paket kapsamındaki revize hakları bittiğinde ek revize talepleri COUGC ekibi tarafından ayrıca değerlendirilir.</Faq>
          <Faq q="Ürünü içerik üreticisine nasıl göndereceğim?">Proje kesinleştiğinde kargo bilgileri ekranınızda görünür. Kargo takip numarasını girerek süreci takip edebilirsiniz.</Faq>
          <Faq q="Videoları reklamda kullanabilir miyim?">Paket kapsamında organik ve reklam kullanım hakkı tanımlanır. Kullanım süreleri paket kartlarında belirtilmiştir (prototip: örnek koşullar).</Faq>
        </div>
      </div></section>

      <section className="sec" style={{ paddingTop: 0 }}><div className="container"><div className="cta-band"><Star />
        <div><h2>İlk UGC videonuzu bu hafta başlatın.</h2><p>Hesap açmak ücretsiz. Paketinizi seçtiğiniz anda içerik üreticisi vitrini açılır.</p></div>
        <div className="row row-wrap"><Link className="btn btn-primary btn-lg" href="/kayit">Marka hesabı aç</Link><Link className="btn btn-lg" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} href="/giris">Demo panelleri gez</Link></div>
      </div></div></section>
    </>
  );
}
