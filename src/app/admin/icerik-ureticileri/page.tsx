'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Creator } from '@/lib/types';
import { FlagSwitch } from '@/components/admin/FlagSwitch';


import { fmtDate, lower, rating, tl } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/media';
import { Badge, Callout, EmptyState, PageHead, Tabs } from '@/components/ui/primitives';
import { ReviewAppModal } from '@/components/admin/modals';
import { CreatorProfileModal, availTone } from '@/components/shared/creator';
import { FormApplicationRow } from '@/components/admin/applications';

export default function CreatorsPage() {
  useCrumbs([{ t: 'İçerik Üreticileri' }]);
  const db = useDb(); const router = useRouter(); const qh = useQueryHref(); const sp = useSearchParams();
  const tab = sp.get('tab') || 'tumu'; const cat = sp.get('kategori') || '';
  const [term, setTerm] = useState('');
  const sets: Record<string, Creator[]> = {
    tumu: db.creators.filter((c) => c.status === 'active'), vitrin: db.creators.filter((c) => c.showcase),
    gizli: db.creators.filter((c) => c.status === 'active' && !c.visible), basvuru: db.creators.filter((c) => c.status === 'pending')
  };
  const formApps = db.applications.filter((a) => a.status === 'pending');
  const tabs = [
    { key: 'tumu', label: 'Aktif içerik üreticileri', n: sets.tumu.length, href: '/admin/icerik-ureticileri' }, { key: 'vitrin', label: 'Marka vitrini', n: sets.vitrin.length, href: '/admin/icerik-ureticileri?tab=vitrin' },
    { key: 'gizli', label: 'Gizli', n: sets.gizli.length, href: '/admin/icerik-ureticileri?tab=gizli' }, { key: 'basvuru', label: 'Başvurular', n: sets.basvuru.length + formApps.length, href: '/admin/icerik-ureticileri?tab=basvuru' }
  ];
  const t = lower(term.trim());
  const list = (sets[tab] || sets.tumu).filter((c) => (!cat || c.cats.includes(cat)) && (!t || lower(c.name + ' ' + c.city + ' ' + c.cats.join(' ')).includes(t)));

  return (
    <div className="page">
      <PageHead title="İçerik Üreticileri" sub={`${sets.tumu.length} aktif içerik üreticisi · vitrinde ${sets.vitrin.length} / ${db.settings.showcaseSize} önerilen`} />
      {tab === 'vitrin' && <Callout tone="orange" className="mb-16"><b>Marka vitrini:</b> Markalar yalnızca vitrindeki içerik üreticilerini inceleyip tercih edebilir. Brief’e göre COUGC ekibi vitrin dışındaki içerik üreticilerini de önerebilir.</Callout>}
      <div className="card">
        <div style={{ padding: '0 12px' }}><Tabs items={tabs} active={tab} /></div>
        {tab !== 'basvuru' && (
          <div className="toolbar"><div className="input-wrap"><Icon name="search" size={16} /><input className="input input-sm" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="İsim, şehir veya kategori ara" /></div>
            <select className="input input-sm" style={{ width: 'auto' }} value={cat} onChange={(e) => router.push(qh({ kategori: e.target.value || null }), { scroll: false })}>
              <option value="">Tüm kategoriler</option>{db.categories.map((x) => <option key={x}>{x}</option>)}</select></div>
        )}
        {tab === 'basvuru' ? (list.length + formApps.length ? <>{formApps.map((a) => <FormApplicationRow key={a.id} a={a} />)}{list.map((c) => (
          <div key={c.id} className="list-row"><Avatar c={c} />
            <div className="lr-main"><div className="lr-t">{c.name} · {c.city}</div><div className="lr-s">{c.cats.join(', ')} · {c.ig} · {c.followers} takipçi · {fmtDate(c.joined)}</div></div>
            <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="admin" />)}>Portfolyo</button>
            <button className="btn btn-dark btn-sm" onClick={() => openModal(<ReviewAppModal cid={c.id} />)}>Değerlendir</button></div>
        ))}</> : <EmptyState icon="users" title="Bekleyen başvuru yok" />) : list.length ? (
          <div className="table-wrap"><table className="table responsive">
            <thead><tr><th>İçerik Üreticisi</th><th>Kategori</th><th>Ücret</th><th>Performans</th><th>Müsaitlik</th><th className="t-center">Görünür</th><th className="t-center">Vitrin</th></tr></thead>
            <tbody>{list.map((c) => (
              <tr key={c.id} data-href onClick={() => router.push('/admin/icerik-ureticileri/' + c.id)}>
                <td className="td-main"><div className="row"><Avatar c={c} /><div><div className="cell-main">{c.name}</div><div className="cell-sub">{c.city} · {c.age} · {c.gender === 'K' ? 'Kadın' : 'Erkek'}</div></div></div></td>
                <td data-l="Kategori">{c.cats.map((x) => <span key={x} className="tag" style={{ margin: 2 }}>{x}</span>)}</td>
                <td data-l="Ücret" className="mono">{tl(c.fee)}</td>
                <td data-l="Performans"><div className="small"><Icon name="star-fill" size={11} /> {rating(c.rating)} · {c.done} iş</div><div className="xs muted">%{c.onTime} zamanında</div></td>
                <td data-l="Müsaitlik"><Badge tone={availTone(c.avail)}>{c.avail}</Badge></td>
                <td data-l="Görünür" className="t-center"><FlagSwitch c={c} flag="visible" title="Markalara görünür" /></td>
                <td data-l="Vitrin" className="t-center"><FlagSwitch c={c} flag="showcase" title="Marka vitrininde göster" /></td>
              </tr>
            ))}</tbody></table></div>
        ) : <EmptyState icon="users" title="Bu filtrede içerik üreticisi yok" />}
      </div>
    </div>
  );
}
