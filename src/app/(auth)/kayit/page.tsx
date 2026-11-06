'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { sleep } from '@/lib/format';
import { clearFieldError, validateForm } from '@/lib/forms';
import { api } from '@/lib/api/mock-api';
import { DEMO_USERS, useDb } from '@/lib/store/demo-store';
import { useTitle } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Callout } from '@/components/ui/primitives';
import { useBusy } from '@/components/ui/interactive';
import { AuthLayout } from '@/components/layout/PublicChrome';

export default function RegisterPage() {
  useTitle('Marka hesabı aç');
  const db = useDb();
  const router = useRouter();
  const sp = useSearchParams();
  const pk = sp.get('paket') ? R.pkgOf(db, sp.get('paket')!) : undefined;
  const [busy, wrap] = useBusy();

  if (sp.get('ok')) {
    return (
      <AuthLayout h2="Hesap açmak ücretsiz." p="Video hakkınız tanımlandığında içerik üreticisi vitrini ve brief formu açılır.">
        <div className="result" style={{ margin: 0, textAlign: 'left', alignItems: 'flex-start' }}>
          <div className="ri ok"><Icon name="mail" size={30} /></div><h1>E-postanızı doğrulayın</h1>
          <p>Hesabınızı etkinleştirmek için gönderdiğimiz bağlantıya tıklayın. (Demo: e-posta gönderilmedi.)</p>
          <Callout className="mt-16">Prototipte yeni hesap oluşturulmaz. Marka deneyimine hazır demo hesabıyla (<b>Nova Kozmetik</b>) devam edebilirsiniz.</Callout>
          <button className="btn btn-primary btn-lg mt-16" onClick={async () => { await api.login('brand'); router.push(DEMO_USERS.brand.home); }}>Demo marka paneline geç <Icon name="arrow-right" size={16} /></button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout h2="Gerçek insanlar, ölçülebilir içerik." p="Seçilmiş içerik üreticisi vitrini, adım adım brief formu ve kontrollü onay süreciyle UGC üretimini hızlandırın.">
      <h1>Marka hesabı açın</h1>
      <p className="sub">Birkaç dakikada başlayın{pk && <> — seçilen paket: <b className="strong">{pk.name}</b></>}.</p>
      <form className="stack mt-24" noValidate onInput={clearFieldError} onChange={clearFieldError} onSubmit={async (e) => {
        e.preventDefault();
        if (!validateForm(e.currentTarget)) return;
        if (await wrap(() => sleep(700))) router.push('/kayit?ok=1');
      }}>
        <div className="grid-2">
          <div className="field"><label>Ad soyad <span className="req">*</span></label><input className="input" name="name" data-required autoComplete="name" /><span className="err">Zorunlu alan.</span></div>
          <div className="field"><label>Marka adı <span className="req">*</span></label><input className="input" name="brand" data-required autoComplete="organization" /><span className="err">Zorunlu alan.</span></div>
        </div>
        <div className="field"><label>İş e-postası <span className="req">*</span></label><input className="input" type="email" name="email" data-required placeholder="ad@firma.com" autoComplete="email" /><span className="err">Geçerli bir e-posta girin.</span></div>
        <div className="grid-2">
          <div className="field"><label>Telefon</label><input className="input" name="phone" placeholder="+90" autoComplete="tel" /></div>
          <div className="field"><label>Sektör</label><select className="input" name="sector">{['Kozmetik', 'Yiyecek & İçecek', 'Moda', 'Ev & Yaşam', 'Teknoloji', 'Diğer'].map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <div className="field"><label>Şifre <span className="req">*</span></label><input className="input" type="password" name="password" data-required autoComplete="new-password" placeholder="En az 8 karakter" /><span className="hint">En az 8 karakter, bir rakam içermeli.</span><span className="err">Şifre belirleyin.</span></div>
        <div className="field"><label className="check"><input type="checkbox" name="kvkk" data-required /><span><Link className="btn-link" href="/yasal">KVKK Aydınlatma Metni</Link>’ni okudum, <Link className="btn-link" href="/yasal">Kullanım Koşulları</Link>’nı kabul ediyorum. <span className="req">*</span></span></label><span className="err">Devam etmek için onay gerekli.</span></div>
        <label className="check"><input type="checkbox" name="mkt" /><span className="muted">Kampanya ve yeniliklerden e-posta ile haberdar olmak istiyorum. (İsteğe bağlı açık rıza)</span></label>
        <button className={'btn btn-primary btn-lg btn-block' + (busy ? ' is-loading' : '')} type="submit" disabled={busy}>{busy ? <><span className="spinner" />Hesap oluşturuluyor…</> : 'Hesabı oluştur'}</button>
      </form>
      <p className="small muted mt-24 t-center">Zaten hesabınız var mı? <Link className="btn-link" href="/giris">Giriş yapın</Link></p>
    </AuthLayout>
  );
}
