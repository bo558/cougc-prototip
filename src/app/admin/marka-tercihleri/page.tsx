'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDb } from '@/lib/store/demo-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Callout, EmptyState, PageHead, Tabs } from '@/components/ui/primitives';
import { PreferenceTable } from '@/components/admin/preferences';

export default function BrandPreferencesPage() {
  useCrumbs([{ t: 'Marka tercihleri' }]);
  const db = useDb(); const router = useRouter(); const qh = useQueryHref(); const sp = useSearchParams();
  const tab = sp.get('tab') || 'tumu'; const marka = sp.get('marka') || '';
  const scoped = db.preferences.filter((x) => !marka || x.brandId === marka);
  const open = scoped.filter((x) => !['secildi', 'uygun_degil'].includes(x.status));
  const sets = { tumu: scoped, yeni: scoped.filter((x) => x.status === 'yeni'), acik: open, kapali: scoped.filter((x) => ['secildi', 'uygun_degil'].includes(x.status)) };
  const hrefOf = (t: string) => qh({ tab: t === 'tumu' ? null : t });
  const tabs = [
    { key: 'tumu', label: 'Tümü', n: sets.tumu.length, href: hrefOf('tumu') },
    { key: 'yeni', label: 'Yeni', n: sets.yeni.length, href: hrefOf('yeni') },
    { key: 'acik', label: 'Süreci devam eden', n: sets.acik.length, href: hrefOf('acik') },
    { key: 'kapali', label: 'Sonuçlanan', n: sets.kapali.length, href: hrefOf('kapali') }
  ];
  const list = sets[tab as keyof typeof sets] || sets.tumu;
  const brands = db.brands.filter((b) => db.preferences.some((x) => x.brandId === b.id));

  return (
    <div className="page">
      <PageHead title="Marka tercihleri" sub="Hangi markanın hangi içerik üreticisini tercih ettiğini buradan izleyin." />
      <Callout tone="orange" className="mb-16"><b>Tercih, atama veya kesin onay değildir.</b> Uygun içerik üreticilerini COUGC ekibi değerlendirir ve markaya önerir. Nihai seçim, markayla yapılan görüşme sonucunda proje ekranından kaydedilir.</Callout>
      <div className="card">
        <div style={{ padding: '0 12px' }}><Tabs items={tabs} active={tab} /></div>
        <div className="toolbar">
          <select className="input input-sm" style={{ width: 'auto' }} aria-label="Marka filtresi" value={marka} onChange={(e) => router.push(qh({ marka: e.target.value || null }), { scroll: false })}>
            <option value="">Tüm markalar</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        {list.length ? <PreferenceTable db={db} list={list} /> : <EmptyState icon="star" title="Bu görünümde tercih yok" text="Markalar “Tercih Et” düğmesine bastığında burada listelenir." />}
      </div>
    </div>
  );
}
