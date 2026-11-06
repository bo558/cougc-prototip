'use client';
/* Panel kabuğu: kenar menü, üst çubuk, bildirimler, kullanıcı menüsü, içerik üreticisi alt sekme çubuğu, rol koruması */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Db, Role } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { ago } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { BRAND_ID, CREATOR_ID, DEMO_USERS, meKey, useDb, useHydrated } from '@/lib/store/demo-store';
import { toast, useUI } from '@/lib/store/ui-store';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Avatar, BrandLogo } from '@/components/ui/media';
import { Dropdown } from '@/components/ui/interactive';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { DemoBar } from './DemoBar';
import { Logo } from './PublicChrome';

interface NavItem { key?: string; href?: string; icon?: IconName; label: string; n?: number | null }

function navFor(panel: Role, db: Db): NavItem[] {
  if (panel === 'admin') {
    const q = R.adminQueue(db);
    const payouts = db.projects.filter((p) => p.payout.status === 'odenecek').length;
    return [
      { label: 'Operasyon' },
      { key: 'dashboard', href: '/admin', icon: 'grid', label: 'Genel bakış' },
      { key: 'onaylar', href: '/admin/onaylar', icon: 'inbox', label: 'Onay bekleyenler', n: R.adminQueueCount(db) },
      { key: 'projeler', href: '/admin/projeler', icon: 'folder', label: 'Projeler' },
      { key: 'marka-tercihleri', href: '/admin/marka-tercihleri', icon: 'star', label: 'Marka tercihleri', n: q.preferences.length || null },
      { label: 'Kullanıcılar' },
      { key: 'markalar', href: '/admin/markalar', icon: 'building', label: 'Markalar' },
      { key: 'icerik-ureticileri', href: '/admin/icerik-ureticileri', icon: 'users', label: 'İçerik Üreticileri', n: (q.applications.length + q.formApplications.length) || null },
      { label: 'Finans' },
      { key: 'odemeler', href: '/admin/odemeler', icon: 'card', label: 'Siparişler & ödemeler' },
      { key: 'hakedisler', href: '/admin/hakedisler', icon: 'wallet', label: 'İçerik Üreticisi hak edişleri', n: payouts || null },
      { key: 'raporlar', href: '/admin/raporlar', icon: 'chart', label: 'Raporlar' },
      { label: 'Sistem' },
      { key: 'ayarlar', href: '/admin/ayarlar', icon: 'settings', label: 'Ayarlar' }
    ];
  }
  if (panel === 'brand') {
    const waiting = R.projectsOfBrand(db, BRAND_ID).filter(R.needsBrand).length;
    return [
      { key: 'dashboard', href: '/marka', icon: 'home', label: 'Ana sayfa' },
      { key: 'projeler', href: '/marka/projeler', icon: 'folder', label: 'Projelerim', n: waiting || null },
      { key: 'yeni-proje', href: '/marka/yeni-proje', icon: 'plus', label: 'Yeni proje' },
      { key: 'icerik-ureticileri', href: '/marka/icerik-ureticileri', icon: 'users', label: 'İçerik Üreticileri' },
      { key: 'teslimatlar', href: '/marka/teslimatlar', icon: 'download', label: 'Teslimatlar' },
      { label: 'Hesap' },
      { key: 'paketler', href: '/marka/paketler', icon: 'package', label: 'Paketlerim' },
      { key: 'odemeler', href: '/marka/odemeler', icon: 'receipt', label: 'Ödemeler' },
      { key: 'profil', href: '/marka/profil', icon: 'building', label: 'Firma profili' }
    ];
  }
  const offers = R.offersForCreator(db, CREATOR_ID).length;
  const todo = R.projectsOfCreator(db, CREATOR_ID).filter((p) => p.videos.some((v) => v.status === 'revize' || (v.status === 'bekleniyor' && v.adminNote))).length;
  return [
    { key: 'dashboard', href: '/icerik-uretici', icon: 'home', label: 'Ana sayfa' },
    { key: 'teklifler', href: '/icerik-uretici/teklifler', icon: 'inbox', label: 'Teklifler', n: offers || null },
    { key: 'isler', href: '/icerik-uretici/isler', icon: 'briefcase', label: 'İşlerim', n: todo || null },
    { key: 'kazanclar', href: '/icerik-uretici/kazanclar', icon: 'wallet', label: 'Kazançlar' },
    { key: 'profil', href: '/icerik-uretici/profil', icon: 'user', label: 'Profil' }
  ];
}

const BASE: Record<Role, string> = { admin: '/admin', brand: '/marka', creator: '/icerik-uretici' };
function activeKey(panel: Role, path: string) {
  const rest = path.slice(BASE[panel].length).split('/').filter(Boolean)[0];
  if (!rest) return 'dashboard';
  if (panel === 'brand' && ['satin-al', 'odeme-sonuc'].includes(rest)) return 'paketler';
  if (panel === 'creator' && ['yukle', 'teslimatlar'].includes(rest)) return 'isler';
  return rest;
}

export function MeterCells({ c }: { c: R.Credits }) {
  return <>{Array.from({ length: c.total }, (_, i) => <i key={i} className={i < c.used + c.reserved ? 'used' : 'on'} />)}</>;
}

function SidebarFoot({ panel, db }: { panel: Role; db: Db }) {
  if (panel === 'brand') {
    const c = R.credits(db, BRAND_ID);
    return (
      <div className="sb-card">
        <div className="row between"><span className="muted">Kalan video hakkı</span><b className="strong" style={{ fontSize: 18 }}>{c.available}</b></div>
        <div className="meter mt-8"><MeterCells c={c} /></div>
        <Link className="btn btn-ghost btn-sm btn-block mt-12" href="/marka/paketler">Paketler</Link>
      </div>
    );
  }
  if (panel === 'admin') return <div className="sb-card small"><Icon name="shield" size={14} /> Tüm kritik işlemler <Link href="/admin/ayarlar?tab=log" style={{ textDecoration: 'underline' }}>işlem geçmişine</Link> kaydedilir.</div>;
  return <div className="sb-card small"><b className="strong">Destek</b><p className="muted mt-8">Sorularınız için COUGC ekibine <span className="strong">destek@cougc.demo</span> adresinden ulaşabilirsiniz.</p></div>;
}

function Notifications({ db, role }: { db: Db; role: Role }) {
  const router = useRouter();
  const key = meKey(role)!;
  const list = db.notifications.filter((n) => n.to === key).slice(0, 12);
  const unread = list.some((n) => !n.read);
  return (
    <Dropdown className="icon-btn" label="Bildirimler" trigger={<><Icon name="bell" size={19} />{unread && <span className="pip" />}</>}>
      {(close) => (
        <div className="notif-panel" style={{ margin: -6 }}>
          <div className="np-head"><b className="strong">Bildirimler</b>{unread && <button className="btn btn-link small" onClick={() => api.markAllRead(key)}>Tümünü okundu say</button>}</div>
          <div className="np-list">
            {list.length ? list.map((n) => {
              const [a, b] = n.text.split('{strong}');
              return (
                <Link key={n.id} className={'notif ' + (n.read ? '' : 'unread')} href={n.link} onClick={(e) => { e.preventDefault(); api.markRead(n.id); close(); router.push(n.link); }}>
                  <span className="ud" />
                  <div><div className="nt">{n.strong ? <>{a}<b>{n.strong}</b>{b}</> : n.text}</div><div className="nm">{ago(n.date)}</div></div>
                </Link>
              );
            }) : <EmptyState icon="bell" title="Bildirim yok" text="Yeni gelişmeler burada görünecek." />}
          </div>
          <div className="np-head" style={{ borderTop: '1px solid var(--line-2)', borderBottom: 0 }}><span className="xs muted-2">Demo: e-posta bildirimleri de aynı olaylardan gönderilir.</span></div>
        </div>
      )}
    </Dropdown>
  );
}

function UserMenu({ role, db }: { role: Role; db: Db }) {
  const router = useRouter();
  const u = DEMO_USERS[role];
  const av = role === 'creator' ? <Avatar c={R.creatorOf(db, CREATOR_ID)} size="sm" />
    : role === 'brand' ? <BrandLogo b={R.brandOf(db, BRAND_ID)} size="sm" />
    : <span className="avatar sm" style={{ background: 'var(--ink)', color: '#fff' }}><Icon name="sparkle" size={13} /></span>;
  const links: Record<Role, { href: string; icon: IconName; label: string }[]> = {
    admin: [{ href: '/admin/ayarlar', icon: 'settings', label: 'Ayarlar' }],
    brand: [{ href: '/marka/profil', icon: 'building', label: 'Firma profili' }, { href: '/marka/odemeler', icon: 'receipt', label: 'Ödemeler' }],
    creator: [{ href: '/icerik-uretici/profil', icon: 'user', label: 'Profilim' }, { href: '/icerik-uretici/kazanclar', icon: 'wallet', label: 'Kazançlar' }]
  };
  return (
    <Dropdown className="user-btn" label="Kullanıcı menüsü" trigger={<>{av}<span className="ut"><span className="un">{u.name}</span><br /><span className="ur">{u.sub}</span></span></>}>
      {(close) => (
        <>
          <div className="menu-head"><b className="strong">{u.name}</b><div className="xs muted">{u.email}</div></div>
          {links[role].map((l) => <Link key={l.href} href={l.href} onClick={close}><Icon name={l.icon} size={16} />{l.label}</Link>)}
          <div className="menu-sep" />
          <Link href="/" onClick={close}><Icon name="globe" size={16} />Genel siteye dön</Link>
          <button onClick={() => { close(); api.logout(); router.push('/giris'); toast('Oturum kapatıldı', 'info'); }}><Icon name="logout" size={16} />Çıkış yap</button>
        </>
      )}
    </Dropdown>
  );
}

/** Sayfa değişiminde kısa iskelet (yükleniyor durumu) */
function useRouteSkeleton(path: string) {
  const [sk, setSk] = useState(false);
  const prev = useRef(path);
  useLayoutEffect(() => {
    if (prev.current === path) return;
    prev.current = path;
    setSk(true);
    const t = setTimeout(() => setSk(false), 220);
    return () => clearTimeout(t);
  }, [path]);
  return sk;
}

export function PanelShell({ panel, children }: { panel: Role; children: ReactNode }) {
  const db = useDb();
  const hydrated = useHydrated();
  const role = db.session.role;
  const path = usePathname();
  const router = useRouter();
  const crumbs = useUI((s) => s.crumbs);
  // Çekmece hangi sayfada açıldıysa yalnızca orada açık kalır (sayfa değişince kendiliğinden kapanır)
  const [navOpenAt, setNavOpenAt] = useState<string | null>(null);
  const navOpen = navOpenAt === path;
  const setNavOpen = (v: boolean | ((o: boolean) => boolean)) => setNavOpenAt((typeof v === 'function' ? v(navOpen) : v) ? path : null);
  const sk = useRouteSkeleton(path);
  const allowed = hydrated && role === panel;

  useEffect(() => {
    if (hydrated && role !== panel) router.replace('/giris?panel=' + panel + '&next=' + encodeURIComponent(path));
  }, [hydrated, role, panel, path, router]);

  const items = navFor(panel, db);
  const active = activeKey(panel, path);
  const panelName = { admin: 'Admin', brand: 'Marka', creator: 'İçerik Üreticisi' }[panel];
  const back = panel === 'creator' && crumbs.length > 1 ? crumbs[crumbs.length - 2].h : undefined;

  return (
    <>
      <DemoBar panel={panel} />
      <div className={'shell ' + panel + (navOpen ? ' nav-open' : '')} onClick={(e) => { if (navOpen && !(e.target as HTMLElement).closest('.sidebar,.burger')) setNavOpen(false); }}>
        <aside className="sidebar" aria-label="Panel menüsü">
          <Link className="brandmark" href={BASE[panel]}><Logo light={panel === 'admin'} height={22} /><span className="pn">{panelName}</span></Link>
          {items.map((it, i) => it.key
            ? <Link key={it.key} className={'nav-item ' + (active === it.key ? 'on' : '')} href={it.href!}><Icon name={it.icon!} size={18} /><span>{it.label}</span>{!!it.n && <span className="n">{it.n}</span>}</Link>
            : <div key={'l' + i} className="nav-label">{it.label}</div>)}
          <div className="sb-foot"><SidebarFoot panel={panel} db={db} /></div>
        </aside>
        <div className="main">
          <header className="topbar">
            <button className="icon-btn burger" onClick={() => setNavOpen((o) => !o)} aria-label="Menüyü aç"><Icon name="menu" size={20} /></button>
            {panel === 'creator' && <Link className="creator-logo" href="/icerik-uretici" style={{ display: 'none' }}><Logo height={18} /></Link>}
            {back && <Link className="icon-btn" href={back} aria-label="Geri"><Icon name="arrow-left" size={18} /></Link>}
            <div className="crumbs">
              {crumbs.map((c, i) => (
                <span key={i} className="row-sm" style={{ minWidth: 0 }}>
                  {i > 0 && <span className="muted-2">/</span>}
                  {c.h ? <Link href={c.h}>{c.t}</Link> : <span className="cur">{c.t}</span>}
                </span>
              ))}
            </div>
            <div className="tb-right">
              {panel === 'admin' && (
                <form className="input-wrap tb-search" role="search" onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q'); router.push('/admin/projeler' + (q ? '?q=' + encodeURIComponent(String(q)) : '')); }}>
                  <Icon name="search" size={16} /><input className="input input-sm" name="q" placeholder="Proje, marka veya içerik üreticisi ara" aria-label="Ara" />
                </form>
              )}
              {panel === 'brand' && <Link className="btn btn-primary btn-sm hide-sm" href="/marka/yeni-proje"><Icon name="plus" size={15} />Yeni proje</Link>}
              {allowed && <Notifications db={db} role={panel} />}
              {allowed && <UserMenu role={panel} db={db} />}
            </div>
          </header>
          <div className="page-fade" key={sk ? 'sk' : path}>
            {!allowed || sk ? <Skeleton /> : <Suspense fallback={<Skeleton />}>{children}</Suspense>}
          </div>
        </div>
        {panel === 'creator' && (
          <nav className="tabbar" aria-label="İçerik Üreticisi menüsü">
            {items.map((it) => (
              <Link key={it.key} href={it.href!} className={active === it.key ? 'on' : ''}>
                <Icon name={it.icon!} size={21} /><span>{it.label}</span>{!!it.n && <span className="n">{it.n}</span>}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
