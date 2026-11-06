'use client';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import * as R from '@/lib/domain/rules';
import { tl } from '@/lib/format';
import { clearFieldError, validateForm } from '@/lib/forms';
import { api } from '@/lib/api/mock-api';
import { BRAND_ID, DEMO_USERS, useDb } from '@/lib/store/demo-store';
import { closeModal, openModal } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon, Star } from '@/components/ui/Icon';
import { Callout, EmptyState, PageHead } from '@/components/ui/primitives';
import { Modal, Spinner } from '@/components/ui/interactive';

/** 3D Secure simülasyonu → ödeme doğrulanıyor → sonuç sayfası */
function ThreeDSModal({ packageId, coupon, fail, onDone }: { packageId: string; coupon: string | null; fail: boolean; onDone: (orderId: string) => void }) {
  const [stage, setStage] = useState<'otp' | 'verify'>('otp');
  return (
    <Modal title="3D Secure doğrulama" sub="Bankanızın doğrulama ekranı (simülasyon)"
      footer={stage === 'otp' && <><button className="btn btn-ghost" onClick={closeModal}>İptal</button>
        <button className="btn btn-primary" onClick={async () => { setStage('verify'); const o = await api.purchase({ packageId, coupon, simulateFail: fail }); closeModal(); onDone(o.id); }}>Onayla</button></>}>
      {stage === 'otp' ? (
        <div className="three-ds"><span className="bank"><Icon name="shield" size={15} /> Demo Bank</span>
          <p className="small muted mt-16">Telefonunuza gönderilen tek kullanımlık kodu girin.</p>
          <div className="otp">{[1, 2, 3, 4, 5, 6].map((n) => <input key={n} value={n} readOnly aria-label="Kod hanesi" />)}</div>
          <p className="xs muted-2">Demo: kod otomatik dolduruldu.</p></div>
      ) : (
        <div className="t-center stack" style={{ alignItems: 'center', padding: '12px 0' }}><Spinner size={28} color="var(--orange)" /><b className="strong">Ödeme doğrulanıyor…</b>
          <p className="small muted">Sağlayıcıdan sunucu bildirimi bekleniyor. Lütfen sayfayı kapatmayın.</p></div>
      )}
    </Modal>
  );
}

export default function CheckoutPage() {
  const { pkg } = useParams<{ pkg: string }>();
  const db = useDb(); const router = useRouter(); const qh = useQueryHref();
  const kupon = useSearchParams().get('kupon') || '';
  const [couponIn, setCouponIn] = useState(kupon);
  const [scenario, setScenario] = useState<'ok' | 'fail'>('ok');
  useCrumbs([{ t: 'Paketlerim', h: '/marka/paketler' }, { t: 'Ödeme' }]);
  const pk = R.pkgOf(db, pkg); const b = R.brandOf(db, BRAND_ID);
  if (!pk) return <div className="page"><EmptyState icon="package" title="Paket bulunamadı" /></div>;
  const coupon = kupon ? db.coupons.find((c) => c.code === kupon && c.active) : undefined;
  const discount = coupon ? (coupon.type === 'percent' ? Math.round((pk.price * coupon.value) / 100) : coupon.value) : 0;
  const net = pk.price - discount; const vat = Math.round(net * db.settings.vatRate);

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <PageHead title="Güvenli ödeme" sub={`${pk.name} paketi · ${pk.videos} video`} />
      <form className="layout-2 wide-side" noValidate onInput={clearFieldError} onChange={clearFieldError} onSubmit={(e) => {
        e.preventDefault(); if (!validateForm(e.currentTarget)) return;
        openModal(<ThreeDSModal packageId={pk.id} coupon={coupon?.code || null} fail={scenario === 'fail'} onDone={(id) => router.push('/marka/odeme-sonuc/' + id)} />);
      }}>
        <div className="stack-lg">
          <div className="card"><div className="card-head"><h3>1. Fatura bilgileri</h3><Link className="btn-link small" href="/marka/profil">Profilde düzenle</Link></div>
            <div className="card-body stack">
              <div className="grid-2"><div className="field"><label>Fatura ünvanı</label><input className="input" name="title" defaultValue={b.billing.title} data-required /><span className="err">Zorunlu alan.</span></div>
                <div className="field"><label>Vergi dairesi / no</label><input className="input" defaultValue={b.billing.taxOffice + ' · ' + b.billing.taxNo} /></div></div>
              <div className="field"><label>Fatura adresi</label><input className="input" defaultValue={b.billing.address} /></div>
              <p className="xs muted-2">Faturanız (e-Arşiv/e-Fatura) ödeme sonrasında e-posta adresinize iletilir.</p>
            </div></div>
          <div className="card"><div className="card-head"><h3>2. Kart bilgileri</h3><span className="badge t-gray no-dot"><Icon name="lock" size={11} /> 3D Secure</span></div>
            <div className="card-body">
              <Callout tone="amber" className="mb-16"><b>Prototip.</b> Bu alan ödeme sağlayıcısının (iyzico/PayTR vb.) güvenli ödeme formunu temsil eder. Kart bilgileri hiçbir yere gönderilmez; test değerleri hazır doldurulmuştur.</Callout>
              <div className="row" style={{ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="paycard" style={{ flex: 'none', width: 280 }}><Star />
                  <div className="row between"><Icon name="card" size={22} /><small>Test kartı</small></div>
                  <div className="num">4242 4242 4242 4242</div>
                  <div className="row between"><div><small>Kart sahibi</small><span>{DEMO_USERS.brand.name.toLocaleUpperCase('tr-TR')}</span></div><div><small>SKT</small>12/28</div></div></div>
                <div className="stack grow" style={{ minWidth: 240 }}>
                  <div className="field"><label>Kart üzerindeki isim</label><input className="input" name="cname" defaultValue={DEMO_USERS.brand.name} data-required autoComplete="off" /><span className="err">Zorunlu alan.</span></div>
                  <div className="field"><label>Kart numarası</label><input className="input mono" defaultValue="4242 4242 4242 4242" readOnly autoComplete="off" /><span className="hint">Demo test kartı — değiştirilemez.</span></div>
                  <div className="grid-2"><div className="field"><label>Son kullanma</label><input className="input" defaultValue="12 / 28" readOnly /></div><div className="field"><label>CVC</label><input className="input" defaultValue="•••" readOnly /></div></div>
                </div>
              </div>
              <div className="divider" /><div className="label mb-8">Demo senaryosu</div>
              <div className="choices">
                <label className="choice"><input type="radio" checked={scenario === 'ok'} onChange={() => setScenario('ok')} /><span><Icon name="check-circle" size={15} />Başarılı ödeme</span></label>
                <label className="choice"><input type="radio" checked={scenario === 'fail'} onChange={() => setScenario('fail')} /><span><Icon name="x-circle" size={15} />Başarısız ödeme</span></label>
              </div>
            </div></div>
        </div>
        <div className="stack sticky-side"><div className="card"><div className="card-head"><h3>Sipariş özeti</h3></div><div className="card-body">
          <div className="row" style={{ alignItems: 'flex-start' }}><span style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--orange-50)', color: 'var(--orange-700)', flex: 'none' }}><Icon name="package" size={20} /></span>
            <div><b className="strong">{pk.name} paketi</b><div className="small muted">{pk.videos} video · video başı {pk.revisions} revize · {pk.delivery}</div></div></div>
          <div className="divider" />
          <div className="row-sm"><input className="input input-sm" value={couponIn} onChange={(e) => setCouponIn(e.target.value)} placeholder="Kupon kodu" style={{ textTransform: 'uppercase' }} />
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => router.replace(qh({ kupon: couponIn.trim().toLocaleUpperCase('tr-TR') || null }), { scroll: false })}>Uygula</button></div>
          {kupon && !coupon && <div className="xs red mt-8">Kupon geçersiz veya süresi dolmuş.</div>}
          {coupon && <div className="xs green mt-8"><Icon name="check" size={12} /> {coupon.code} uygulandı</div>}
          <p className="xs muted-2 mt-8">Demo kupon: HOSGELDIN10</p>
          <div className="summary-list mt-16">
            <div><span>Paket bedeli</span><b>{tl(pk.price)}</b></div>
            {discount > 0 && <div><span>İndirim</span><b className="green">−{tl(discount)}</b></div>}
            <div><span>KDV (%{db.settings.vatRate * 100})</span><b>{tl(vat)}</b></div>
            <div className="total"><span>Toplam</span><b>{tl(net + vat)}</b></div>
          </div>
          <div className="field mt-16"><label className="check"><input type="checkbox" name="terms" data-required /><span className="small"><Link className="btn-link" href="/yasal">Ön Bilgilendirme Formu</Link> ve <Link className="btn-link" href="/yasal">Mesafeli Satış Sözleşmesi</Link>’ni okudum, onaylıyorum.</span></label><span className="err">Devam etmek için onay gerekli.</span></div>
          <button className="btn btn-primary btn-lg btn-block mt-16" type="submit"><Icon name="lock" size={16} />{tl(net + vat)} öde</button>
          <p className="xs muted-2 t-center mt-12">Ödeme, sağlayıcının sunucu bildirimiyle doğrulandıktan sonra hesabınıza {pk.videos} video hakkı tanımlanır.</p>
        </div></div></div>
      </form>
    </div>
  );
}
