'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { sleep } from '@/lib/format';
import { clearFieldError, validateForm } from '@/lib/forms';
import { toast } from '@/lib/store/ui-store';
import { useTitle } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Callout } from '@/components/ui/primitives';
import { useBusy } from '@/components/ui/interactive';
import { AuthLayout } from '@/components/layout/PublicChrome';

const H2 = 'Hesabınız güvende.';
const P = 'Şifre sıfırlama bağlantıları tek kullanımlıktır ve kısa sürede geçersiz olur.';

function SubmitBtn({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return <button className={'btn btn-dark btn-lg btn-block' + (busy ? ' is-loading' : '')} type="submit" disabled={busy}>{busy ? <><span className="spinner" />{busyLabel}</> : label}</button>;
}

export default function ResetPasswordPage() {
  useTitle('Şifre sıfırlama');
  const router = useRouter();
  const sp = useSearchParams();
  const [busy, wrap] = useBusy();

  if (sp.get('adim') === 'yeni') {
    return (
      <AuthLayout h2={H2} p={P}>
        <h1>Yeni şifre belirleyin</h1><p className="sub">Güçlü ve daha önce kullanmadığınız bir şifre seçin.</p>
        <form className="stack mt-24" noValidate onInput={clearFieldError} onSubmit={async (e) => {
          e.preventDefault(); const f = e.currentTarget;
          if (!validateForm(f)) return;
          const p1 = (f.elements.namedItem('p1') as HTMLInputElement).value; const p2 = f.elements.namedItem('p2') as HTMLInputElement;
          if (p1 !== p2.value) { const fld = p2.closest('.field')!; fld.classList.add('has-error'); fld.querySelector('.err')!.textContent = 'Şifreler eşleşmiyor.'; return; }
          if (await wrap(() => sleep(600))) { toast('Şifreniz güncellendi', 'success', 'Yeni şifrenizle giriş yapabilirsiniz.'); router.push('/giris'); }
        }}>
          <div className="field"><label>Yeni şifre</label><input className="input" type="password" name="p1" data-required autoComplete="new-password" /><span className="err">Zorunlu alan.</span></div>
          <div className="field"><label>Yeni şifre (tekrar)</label><input className="input" type="password" name="p2" data-required autoComplete="new-password" /><span className="err">Zorunlu alan.</span></div>
          <SubmitBtn busy={busy} label="Şifreyi güncelle" busyLabel="Kaydediliyor…" />
        </form>
      </AuthLayout>
    );
  }
  if (sp.get('gonderildi')) {
    return (
      <AuthLayout h2={H2} p={P}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--green-50)', color: 'var(--green)', marginBottom: 18 }}><Icon name="mail" size={28} /></div>
        <h1>E-postanızı kontrol edin</h1><p className="sub">Hesabınız varsa, şifre sıfırlama bağlantısı birkaç dakika içinde e-posta adresinize ulaşır.</p>
        <Callout className="mt-24">Demo: e-posta gönderilmedi. Akışın devamını görmek için bağlantıyı simüle edin.</Callout>
        <div className="row mt-16"><Link className="btn btn-dark" href="/sifre-sifirla?adim=yeni">Bağlantıyı aç (demo)</Link><Link className="btn btn-ghost" href="/giris">Girişe dön</Link></div>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout h2={H2} p={P}>
      <Link className="btn-link small row-sm" href="/giris"><Icon name="arrow-left" size={14} /> Girişe dön</Link>
      <h1 className="mt-16">Şifrenizi mi unuttunuz?</h1><p className="sub">Kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
      <form className="stack mt-24" noValidate onInput={clearFieldError} onSubmit={async (e) => {
        e.preventDefault(); if (!validateForm(e.currentTarget)) return;
        if (await wrap(() => sleep(600))) router.push('/sifre-sifirla?gonderildi=1');
      }}>
        <div className="field"><label>E-posta</label><input className="input" type="email" name="email" data-required autoComplete="email" /><span className="err">Geçerli bir e-posta girin.</span></div>
        <SubmitBtn busy={busy} label="Bağlantı gönder" busyLabel="Gönderiliyor…" />
      </form>
    </AuthLayout>
  );
}
