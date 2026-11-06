'use client';
import Link from 'next/link';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES } from '@/lib/domain/status';
import { BRAND_ID, DEMO_USERS, useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Badge, Callout, EmptyState, PageHead } from '@/components/ui/primitives';
import { CreditCard, DeliveryItem, openBrandVideo, ProjectCard } from '@/components/brand/parts';
import { ShipModal } from '@/components/shared/project';

export default function BrandHome() {
  useCrumbs([{ t: 'Ana sayfa' }]);
  const db = useDb();
  const b = R.brandOf(db, BRAND_ID); const c = R.credits(db, BRAND_ID);
  const ps = R.projectsOfBrand(db, BRAND_ID).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const active = ps.filter((p) => ACTIVE_STATUSES.includes(p.status));
  const waiting = ps.flatMap((p) => [
    ...p.videos.filter((v) => v.status === 'marka_inceleme').map((v) => ({ p, v, kind: 'video' as const })),
    ...(p.status === 'kargo' && p.shipping.status === 'bekleniyor' ? [{ p, v: null, kind: 'ship' as const }] : [])
  ]);
  const delivered = ps.flatMap((p) => p.videos.filter((v) => v.status === 'onaylandi').map((v) => ({ p, v })));
  const draft = db.drafts[BRAND_ID];

  return (
    <div className="page">
      <PageHead title={'Merhaba, ' + DEMO_USERS.brand.name.split(' ')[0]} sub={`${b.name} · ${active.length} aktif proje`} />
      <div className="credit-hero">
        <CreditCard c={c} />
        <div className="card">
          <div className="card-head"><div><h3>Onayınızı bekleyenler</h3><div className="sub">Sırası sizde olan işler</div></div>{waiting.length > 0 && <Badge tone="orange">{waiting.length}</Badge>}</div>
          {waiting.length ? waiting.map((w) => w.kind === 'video' ? (
            <button key={w.p.id + w.v!.no} className="list-row" onClick={() => openBrandVideo(w.p.id, w.v!.no)}><span className="lr-i t-orange"><Icon name="play" size={16} /></span>
              <div className="lr-main"><div className="lr-t">{w.p.title} · Video {w.v!.no}</div><div className="lr-s">Önizleyin, onaylayın veya revize isteyin</div></div><span className="btn btn-primary btn-sm">İncele</span></button>
          ) : (
            <button key={w.p.id + 'ship'} className="list-row" onClick={() => openModal(<ShipModal pid={w.p.id} />)}><span className="lr-i t-blue"><Icon name="truck" size={16} /></span>
              <div className="lr-main"><div className="lr-t">{w.p.title}</div><div className="lr-s">Ürünü kargolayın ve takip numarasını girin</div></div><span className="btn btn-ghost btn-sm">Kargo bilgisi</span></button>
          )) : <EmptyState icon="check-circle" title="Her şey yolunda" text="Onay bekleyen bir işiniz yok." />}
        </div>
      </div>
      {draft && (draft.productName || draft.creators.length > 0) && (
        <Callout tone="orange" icon="save" className="mt-24"><div className="row between row-wrap"><span>Kaydedilmiş bir brief taslağınız var{draft.productName && <>: <b>{draft.productName}</b></>}.</span>
          <Link className="btn btn-dark btn-sm" href={'/marka/yeni-proje?adim=' + (draft.step || 0)}>Devam et</Link></div></Callout>
      )}
      <div className="section-title mt-32"><h2>Aktif projeler</h2><Link className="btn-link small" href="/marka/projeler">Tümü</Link></div>
      {active.length ? <div className="stack">{active.map((p) => <ProjectCard key={p.id} db={db} p={p} />)}</div>
        : <div className="card"><EmptyState icon="folder" title="Aktif projeniz yok" text="Video hakkınızla hemen yeni bir proje başlatın." action={<Link className="btn btn-primary" href="/marka/yeni-proje">Yeni proje</Link>} /></div>}
      {delivered.length > 0 && <>
        <div className="section-title mt-32"><h2>Son teslimatlar</h2><Link className="btn-link small" href="/marka/teslimatlar">Tümü</Link></div>
        <div className="dl-grid">{delivered.slice(0, 4).map(({ p, v }) => <DeliveryItem key={p.id + v.no} db={db} p={p} v={v} />)}</div>
      </>}
    </div>
  );
}
