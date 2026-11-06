'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { PREFERENCE_STATUS } from '@/lib/domain/status';
import { fmtDate } from '@/lib/format';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/media';
import { Callout, EmptyState, PageHead, Seg, StatusBadge } from '@/components/ui/primitives';
import { LockedCard } from '@/components/brand/parts';
import { CreatorCard, CreatorProfileModal, MAX_PICKS, togglePick } from '@/components/shared/creator';

export default function DiscoverCreators() {
  useCrumbs([{ t: 'İçerik Üreticileri' }]);
  const db = useDb(); const router = useRouter(); const qh = useQueryHref(); const sp = useSearchParams();
  const picks = db.drafts[BRAND_ID]?.creators || [];
  if (!R.credits(db, BRAND_ID).available && !picks.length) return <div className="page"><PageHead title="İçerik Üreticileri" /><LockedCard /></div>;
  const kat = sp.get('kat') || '', cins = sp.get('cins') || '', sehir = sp.get('sehir') || '', musait = sp.get('musait');
  const base = db.creators.filter((c) => c.showcase && c.visible && c.status === 'active');
  const cats = Array.from(new Set(base.flatMap((c) => c.cats)));
  const cities = Array.from(new Set(base.map((c) => c.city)));
  const list = base.filter((c) => (!kat || c.cats.includes(kat)) && (!cins || c.gender === cins) && (!sehir || c.city === sehir) && (!musait || c.avail === 'Müsait'));
  const picked = picks.map((id) => R.creatorOf(db, id)!);
  const prefs = R.preferencesOfBrand(db, BRAND_ID);
  const filtered = kat || cins || sehir || musait;
  const go = (patch: Record<string, string | null>) => router.replace(qh(patch), { scroll: false });

  return (
    <div className="page">
      <PageHead title="İçerik Üreticileri" sub="Fotoğrafları, profilleri ve portföyleri inceleyin. Beğendiklerinizi “Tercih Et” ile COUGC ekibine iletin." />
      <Callout tone="orange" icon="info" className="mb-16"><b>Tercih, atama veya kesin onay anlamına gelmez.</b> Uygun içerik üreticilerini COUGC ekibi değerlendirip size önerir; nihai seçim COUGC ekibiyle yapacağınız görüşmede belirlenir. En fazla {MAX_PICKS} tercih iletebilirsiniz.</Callout>
      {prefs.length > 0 && (
        <div className="card mb-24"><div className="card-head"><div><h3>Tercihleriniz</h3><div className="sub">COUGC ekibine ilettiğiniz tercihlerin durumu</div></div></div>
          {prefs.map((x) => { const c = R.creatorOf(db, x.creatorId)!; const p = x.projectId ? R.projectOf(db, x.projectId) : undefined; return (
            <div key={x.id} className="list-row"><Avatar c={c} size="sm" />
              <div className="lr-main"><div className="lr-t">{c.name}</div><div className="lr-s">{fmtDate(x.date)}{p ? ' · ' + p.title : ' · henüz bir projeye bağlı değil'}</div></div>
              <StatusBadge map={PREFERENCE_STATUS} value={x.status} mode="brand" /></div>
          ); })}
        </div>
      )}
      <div className="card card-pad mb-24" style={{ padding: '14px 18px' }}><div className="row row-wrap" style={{ gap: 10 }}>
        <Seg items={[{ label: 'Tümü', on: !cins, href: qh({ cins: null }) }, { label: 'Kadın', on: cins === 'K', href: qh({ cins: 'K' }) }, { label: 'Erkek', on: cins === 'E', href: qh({ cins: 'E' }) }]} />
        <select className="input input-sm" style={{ width: 'auto' }} aria-label="Kategori" value={kat} onChange={(e) => go({ kat: e.target.value || null })}><option value="">Tüm kategoriler</option>{cats.map((x) => <option key={x}>{x}</option>)}</select>
        <select className="input input-sm" style={{ width: 'auto' }} aria-label="Şehir" value={sehir} onChange={(e) => go({ sehir: e.target.value || null })}><option value="">Tüm şehirler</option>{cities.map((x) => <option key={x}>{x}</option>)}</select>
        <label className="check small" style={{ marginLeft: 4 }}><input type="checkbox" checked={!!musait} onChange={(e) => go({ musait: e.target.checked ? '1' : null })} />Yalnızca müsait</label>
        {filtered ? <Link className="btn-link small" href="/marka/icerik-ureticileri" style={{ marginLeft: 'auto' }}>Filtreleri temizle</Link> : <span className="small muted" style={{ marginLeft: 'auto' }}>{list.length} içerik üreticisi</span>}
      </div></div>
      {list.length ? (
        <div className="creator-grid">{list.map((c) => {
          const idx = picks.indexOf(c.id);
          return <CreatorCard key={c.id} c={c} selectedIndex={idx + 1} onOpen={() => openModal(<CreatorProfileModal id={c.id} role="brand" />)} actions={<>
            <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="brand" />)}>Profil</button>
            <button className={'btn ' + (idx >= 0 ? 'btn-dark' : 'btn-primary') + ' btn-sm'} aria-pressed={idx >= 0} onClick={() => togglePick(c.id)}>{idx >= 0 ? <><Icon name="check" size={14} />Tercih edildi</> : 'Tercih Et'}</button>
          </>} />;
        })}</div>
      ) : <div className="card"><EmptyState icon="search" title="Bu filtrelere uyan içerik üreticisi yok" text="Filtreleri değiştirin; dilerseniz değerlendirmeyi tamamen COUGC ekibine bırakabilirsiniz." action={<Link className="btn btn-ghost" href="/marka/icerik-ureticileri">Filtreleri temizle</Link>} /></div>}
      {picked.length > 0 && (
        <div className="select-bar">
          <div className="avatar-stack">{picked.map((x) => <Avatar key={x.id} c={x} />)}</div>
          <div className="sb-t"><b>{picked.length} / {MAX_PICKS} tercih COUGC ekibine iletildi</b><small>{picked.map((x) => x.name).join(' · ')} · kesin atama değildir</small></div>
          <Link className="btn btn-primary" href="/marka/yeni-proje?adim=1">Brief’e devam et <Icon name="arrow-right" size={15} /></Link>
        </div>
      )}
    </div>
  );
}
