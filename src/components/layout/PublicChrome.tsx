'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon, Star } from '@/components/ui/Icon';
import { DemoBar } from './DemoBar';

// Statik import: derlemede dosya yoluna basePath ve içerik özeti (hash) otomatik eklenir
import logoDark from '@/assets/logo/cougc-logo-dark.png';
import logoLight from '@/assets/logo/cougc-logo-light.png';

export function Logo({ light, height = 24 }: { light?: boolean; height?: number }) {
  // Logo oranı 786×182
  return <Image src={light ? logoLight : logoDark} alt="CoUGC" width={Math.round((height * 786) / 182)} height={height} priority style={{ height, width: 'auto' }} />;
}

export function PublicChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  const a = (href: string, label: string, on: boolean) => <Link href={href} className={on ? 'on' : ''}>{label}</Link>;
  return (
    <>
      <DemoBar panel="public" />
      <header className="pub-header"><div className="container in">
        <Link className="logo" href="/" aria-label="COUGC ana sayfa"><Logo height={26} /></Link>
        <nav aria-label="Ana menü">
          {a('/#nasil', 'Nasıl çalışır', false)}{a('/paketler', 'Paketler', path === '/paketler')}
          {a('/#icerik-ureticileri', 'İçerik Üreticileri', false)}{a('/basvuru', 'Başvuru yap', path === '/basvuru')}
        </nav>
        <div className="right"><Link className="btn btn-ghost" href="/giris">Giriş yap</Link><Link className="btn btn-primary" href="/kayit">Marka hesabı aç</Link></div>
      </div></header>
      <main className="pub-main page-fade">{children}</main>
      <footer className="pub-footer"><div className="container">
        <div className="in">
          <div>
            <div style={{ marginBottom: 14 }}><Logo height={22} /></div>
            <p style={{ maxWidth: 300 }}>Markalar için seçilmiş içerik üreticileriyle, kontrollü ve ölçeklenebilir UGC video üretimi.</p>
            <p className="mt-12 small">Bir <b className="strong">Cogros</b> platformudur.</p>
          </div>
          <div><h4>Platform</h4><ul><li><Link href="/#nasil">Nasıl çalışır</Link></li><li><Link href="/paketler">Paketler</Link></li><li><Link href="/giris">Marka girişi</Link></li></ul></div>
          <div><h4>İçerik Üreticileri</h4><ul><li><Link href="/basvuru">Marka yüzü & içerik üreticisi başvurusu</Link></li><li><Link href="/giris?panel=creator">İçerik Üreticisi girişi</Link></li></ul></div>
          <div><h4>Yasal</h4><ul><li><Link href="/yasal">KVKK Aydınlatma Metni</Link></li><li><Link href="/yasal">Mesafeli Satış Sözleşmesi</Link></li><li><Link href="/yasal">İptal ve İade Koşulları</Link></li></ul></div>
        </div>
        <div className="bottom"><span>© 2026 Cogros · COUGC</span><span>Prototip · Tüm marka, kişi, sipariş ve proje bilgileri kurgusaldır · Metinler örnektir</span></div>
      </div></footer>
    </>
  );
}

/** Giriş / kayıt / şifre ekranları: solda form, sağda koyu marka paneli */
export function AuthLayout({ children, h2, p }: { children: ReactNode; h2: string; p: string }) {
  return (
    <>
      <DemoBar panel="public" />
      <div className="auth">
        <div className="auth-form">
          <Link href="/" aria-label="Ana sayfa"><Logo height={24} /></Link>
          <div className="af-in">{children}</div>
          <p className="xs muted-2">© 2026 Cogros · COUGC · Prototip</p>
        </div>
        <aside className="auth-aside">
          <Star />
          <div className="row-sm" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}><Icon name="sparkle" size={14} /> Bir Cogros platformu</div>
          <div><h2>{h2}</h2><p>{p}</p></div>
          <div className="row" style={{ gap: 28, color: 'rgba(255,255,255,.7)', fontSize: 13 }}>
            <span className="row-sm"><Icon name="shield" size={16} /> Kalite kontrollü teslim</span>
            <span className="row-sm"><Icon name="lock" size={16} /> Güvenli ödeme</span>
          </div>
        </aside>
      </div>
    </>
  );
}
