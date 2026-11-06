'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Project, ProjectStatus } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES, PROJECT_STATUS } from '@/lib/domain/status';
import { fmtDate, lower, relDays } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar, BrandLogo } from '@/components/ui/media';
import { Badge, Chips, EmptyState, PageHead, Seg, StatusBadge } from '@/components/ui/primitives';

const GROUPS: Record<string, { label: string; fn: (p: Project) => boolean }> = {
  tumu: { label: 'Tümü', fn: () => true },
  bende: { label: 'Aksiyon bende', fn: (p) => R.nextActor(p) === 'admin' },
  aktif: { label: 'Aktif', fn: (p) => ACTIVE_STATUSES.includes(p.status) },
  geciken: { label: 'Geciken', fn: R.isLate },
  tamamlandi: { label: 'Tamamlanan', fn: (p) => p.status === 'tamamlandi' },
  iptal: { label: 'İptal', fn: (p) => p.status === 'iptal' }
};
const ACTOR = { admin: <Badge tone="orange" dot={false}>COUGC</Badge>, brand: <Badge dot={false}>Marka</Badge>, creator: <Badge dot={false}>İçerik Üreticisi</Badge> };

// ?q= değişince (üst çubuk araması) arama kutusu yeniden başlatılır
export default function AdminProjectsPage() {
  const q = useSearchParams().get('q') || '';
  return <ProjectsList key={q} initialQuery={q} />;
}

function ProjectsList({ initialQuery }: { initialQuery: string }) {
  useCrumbs([{ t: 'Projeler' }]);
  const db = useDb();
  const router = useRouter();
  const sp = useSearchParams();
  const qh = useQueryHref();
  const [term, setTerm] = useState(initialQuery);
  const all = db.projects.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const f = sp.get('durum') || 'tumu';
  const view = sp.get('view') || 'tablo';
  const fn = GROUPS[f]?.fn || ((p: Project) => p.status === f);
  const t = lower(term.trim());
  const list = all.filter(fn).filter((p) => !t || lower([p.no, p.title, p.product, R.brandOf(db, p.brandId).name, R.creatorOf(db, p.creatorId)?.name || ''].join(' ')).includes(t));
  const chips = Object.entries(GROUPS).map(([k, g]) => ({ key: k, label: g.label, n: all.filter(g.fn).length, href: qh({ durum: k === 'tumu' ? null : k }) }));
  if (!GROUPS[f] && PROJECT_STATUS[f as ProjectStatus]) chips.push({ key: f, label: PROJECT_STATUS[f as ProjectStatus].label, n: list.length, href: qh({}) });

  return (
    <div className="page">
      <PageHead title="Projeler" sub={`${all.length} proje · ${all.filter((p) => ACTIVE_STATUSES.includes(p.status)).length} aktif`}
        actions={<Seg items={[{ label: 'Tablo', on: view === 'tablo', href: qh({ view: null }) }, { label: 'Kanban', on: view === 'kanban', href: qh({ view: 'kanban' }) }]} />} />
      {view === 'kanban' ? (
        <div className="kanban">
          {(['admin_incelemesi', 'teklif_gonderildi', 'kesinlestirme', 'kargo', 'uretimde', 'teslim', 'tamamlandi'] as ProjectStatus[]).map((s) => {
            const items = all.filter((p) => p.status === s);
            return (
              <div key={s} className="kcol"><div className="kcol-h"><span>{PROJECT_STATUS[s].label}</span><Badge dot={false}>{items.length}</Badge></div>
                {items.map((p) => (
                  <Link key={p.id} className="kcard" href={'/admin/projeler/' + p.id}>
                    <div className="row between"><span className="xs muted">{p.no}</span>{R.isLate(p) && <Badge tone="red">Gecikti</Badge>}</div><b>{p.title}</b>
                    <div className="row between"><div className="row-sm"><BrandLogo b={R.brandOf(db, p.brandId)} size="sm" /><span className="xs muted">{R.brandOf(db, p.brandId).name}</span></div>{p.creatorId && <Avatar c={R.creatorOf(db, p.creatorId)} size="sm" />}</div>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="toolbar"><div className="input-wrap"><Icon name="search" size={16} /><input className="input input-sm" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Proje, marka, içerik üreticisi veya ürün ara" /></div><Chips items={chips} active={f} /></div>
          {list.length ? (
            <div className="table-wrap"><table className="table responsive">
              <thead><tr><th>Proje</th><th>Marka</th><th>İçerik Üreticisi</th><th>Video</th><th>Durum</th><th>Teslim</th><th>Sıradaki</th></tr></thead>
              <tbody>{list.map((p) => {
                const b = R.brandOf(db, p.brandId); const c = R.creatorOf(db, p.creatorId); const po = R.pendingOffer(p); const lt = R.isLate(p); const actor = R.nextActor(p);
                return (
                  <tr key={p.id} data-href onClick={() => router.push('/admin/projeler/' + p.id)}>
                    <td className="td-main"><Link href={'/admin/projeler/' + p.id} className="cell-main">{p.title}</Link><div className="cell-sub">{p.no} · {p.product}</div></td>
                    <td data-l="Marka"><div className="row-sm"><BrandLogo b={b} size="sm" /><span>{b.name}</span></div></td>
                    <td data-l="İçerik Üreticisi">{c ? <div className="row-sm"><Avatar c={c} size="sm" />{c.name}</div> : po ? <span className="muted">{R.creatorOf(db, po.creatorId)!.name} (teklif)</span> : <span className="muted-2">Atanmadı</span>}</td>
                    <td data-l="Video" className="mono">{p.videos.filter((v) => v.status === 'onaylandi').length}/{p.videoCount}</td>
                    <td data-l="Durum"><StatusBadge map={PROJECT_STATUS} value={p.status} /></td>
                    <td data-l="Teslim" className="nowrap">{p.deadline ? <><span className={lt ? 'red strong' : ''}>{fmtDate(p.deadline)}</span>{lt && <div className="xs red">{relDays(p.deadline)}</div>}</> : <span className="muted-2">{fmtDate(p.requestedDeadline)} (istenen)</span>}</td>
                    <td data-l="Sıradaki">{actor ? ACTOR[actor] : <span className="muted-2">—</span>}</td>
                  </tr>
                );
              })}</tbody>
            </table></div>
          ) : <EmptyState icon={term ? 'search' : 'folder'} title={term ? 'Sonuç bulunamadı' : 'Bu filtrede proje yok'} text={term ? 'Arama terimini değiştirin.' : 'Farklı bir filtre seçin.'} />}
        </div>
      )}
    </div>
  );
}
