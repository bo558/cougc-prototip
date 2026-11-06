'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES } from '@/lib/domain/status';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Badge, EmptyState, PageHead, Tabs } from '@/components/ui/primitives';
import { ProjectCard } from '@/components/brand/parts';

export default function MyProjects() {
  useCrumbs([{ t: 'Projelerim' }]);
  const db = useDb();
  const tab = useSearchParams().get('tab') || 'aktif';
  const all = R.projectsOfBrand(db, BRAND_ID).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const sets: Record<string, typeof all> = { aktif: all.filter((p) => ACTIVE_STATUSES.includes(p.status)), tamam: all.filter((p) => p.status === 'tamamlandi'), tumu: all };
  const list = sets[tab] || sets.aktif;
  const draft = db.drafts[BRAND_ID];
  return (
    <div className="page">
      <PageHead title="Projelerim" sub={all.length + ' proje'} actions={<Link className="btn btn-primary" href="/marka/yeni-proje"><Icon name="plus" size={15} />Yeni proje</Link>} />
      <div className="mb-16"><Tabs active={tab} items={[{ key: 'aktif', label: 'Devam eden', n: sets.aktif.length, href: '/marka/projeler' }, { key: 'tamam', label: 'Tamamlanan', n: sets.tamam.length, href: '/marka/projeler?tab=tamam' }, { key: 'tumu', label: 'Tümü', n: all.length, href: '/marka/projeler?tab=tumu' }]} /></div>
      {draft && (draft.productName || draft.creators.length > 0) && tab !== 'tamam' && (
        <Link className="card card-link mb-16" style={{ display: 'block', borderStyle: 'dashed' }} href={'/marka/yeni-proje?adim=' + (draft.step || 0)}>
          <div className="card-body row"><span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--paper)' }}><Icon name="file" size={18} /></span>
            <div className="grow"><b className="strong">{draft.productName || 'Adsız brief'}</b><div className="small muted">Taslak · adım {(draft.step || 0) + 1}/5</div></div><Badge>Taslak</Badge></div></Link>
      )}
      {list.length ? <div className="stack">{list.map((p) => <ProjectCard key={p.id} db={db} p={p} />)}</div>
        : <div className="card"><EmptyState icon="folder" title={tab === 'tamam' ? 'Tamamlanan proje yok' : 'Devam eden proje yok'} action={<Link className="btn btn-primary" href="/marka/yeni-proje">Yeni proje</Link>} /></div>}
    </div>
  );
}
