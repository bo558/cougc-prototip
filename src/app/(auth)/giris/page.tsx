'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Role } from '@/lib/types';
import { clearFieldError, validateForm } from '@/lib/forms';
import { api } from '@/lib/api/mock-api';
import { DEMO_USERS } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { useTitle } from '@/hooks/nav';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Callout } from '@/components/ui/primitives';
import { useBusy } from '@/components/ui/interactive';
import { AuthLayout } from '@/components/layout/PublicChrome';

const PANEL_NAME: Record<Role, string> = { admin: 'Admin', brand: 'Marka', creator: 'İçerik Üreticisi' };

export default function LoginPage() {
  useTitle('Giriş');
  const router = useRouter();
  const sp = useSearchParams();
  const panel = sp.get('panel') as Role | null;
  const next = sp.get('next');
  const [busy, wrap] = useBusy();

  const enter = async (role: Role) => {
    await api.login(role);
    router.push(next && next.startsWith(DEMO_USERS[role].home) ? next : DEMO_USERS[role].home);
  };
  const acc = (role: Role, icon: IconName, t: string, s: string) => (
    <button className="demo-acc" onClick={() => enter(role)} style={panel === role ? { borderColor: 'var(--orange)', background: 'var(--orange-50)' } : undefined}>
      <span className="da-i"><Icon name={icon} size={19} /></span><span><b>{t}</b><small>{s}</small></span><Icon name="chevron-right" size={18} className="chev" />
    </button>
  );

  return (
    <AuthLayout h2="Tüm UGC operasyonunuz tek panelde." p="İçerik üreticisi tercihi, brief, onay ve teslim — COUGC ekibinin kontrolünde, şeffaf bir süreçle.">
      <h1>Tekrar hoş geldiniz</h1><p className="sub">Hesabınıza giriş yapın.</p>
      {panel && PANEL_NAME[panel] && <Callout tone="orange" icon="lock" className="mt-16">Bu sayfa <b>{PANEL_NAME[panel]} paneli</b> içindir. Aşağıdaki demo hesapla devam edebilirsiniz.</Callout>}
      <div className="mt-24"><div className="label mb-8">Demo hesapla hızlı giriş</div>
        <div className="demo-accounts">
          {acc('admin', 'settings', 'Admin paneli', 'COUGC operasyon ekibi')}
          {acc('brand', 'building', 'Marka paneli', 'Elif Aydın · Nova Kozmetik')}
          {acc('creator', 'phone', 'İçerik Üreticisi paneli', 'Zeynep K. · mobil öncelikli')}
        </div>
      </div>
      <div className="or">veya e-posta ile</div>
      <form className="stack" noValidate onInput={clearFieldError} onSubmit={async (e) => {
        e.preventDefault();
        if (!validateForm(e.currentTarget)) return;
        const em = String(new FormData(e.currentTarget).get('email')).toLowerCase();
        const role: Role = em.includes('uretici') ? 'creator' : em.includes('cougc') ? 'admin' : 'brand';
        await wrap(async () => { await api.login(role); });
        toast('Demo: e-posta ile giriş simüle edildi', 'info', DEMO_USERS[role].sub + ' paneline yönlendirildiniz.');
        router.push(DEMO_USERS[role].home);
      }}>
        <div className="field"><label htmlFor="le">E-posta</label><input id="le" className="input" type="email" name="email" placeholder="ornek@firma.com" data-required autoComplete="email" /><span className="err">Geçerli bir e-posta girin.</span></div>
        <div className="field"><div className="row between"><label htmlFor="lp">Şifre</label><Link className="btn-link small" href="/sifre-sifirla">Şifremi unuttum</Link></div>
          <input id="lp" className="input" type="password" name="password" placeholder="••••••••" data-required autoComplete="current-password" /><span className="err">Şifrenizi girin.</span></div>
        <button className={'btn btn-dark btn-lg btn-block' + (busy ? ' is-loading' : '')} type="submit" disabled={busy}>{busy ? <><span className="spinner" />Giriş yapılıyor…</> : 'Giriş yap'}</button>
      </form>
      <p className="small muted mt-24 t-center">Hesabınız yok mu? <Link className="btn-link" href="/kayit">Marka hesabı açın</Link> · <Link className="btn-link" href="/basvuru">İçerik üreticisi başvurusu</Link></p>
    </AuthLayout>
  );
}
