'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { OFFER_STATUS } from '@/lib/domain/status';
import { fmtDate, tl } from '@/lib/format';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { BrandLogo } from '@/components/ui/media';
import { EmptyState, PageHead, StatusBadge, Tabs } from '@/components/ui/primitives';
import { OfferCard } from '@/components/creator/parts';

export default function OffersPage() {
  useCrumbs([{ t: 'Teklifler' }]);
  const db = useDb();
  const tab = useSearchParams().get('tab') || 'yeni';
  const pending = R.offersForCreator(db, CREATOR_ID);
  const past = db.projects.map((p) => ({ p, o: p.offers.filter((o) => o.creatorId === CREATOR_ID && o.status !== 'pending').pop() }))
    .filter((x) => x.o).sort((a, b) => (b.o!.answeredAt || b.o!.date).localeCompare(a.o!.answeredAt || a.o!.date));
  return (
    <div className="page creator-col">
      <PageHead title="Teklifler" sub="Markalardan COUGC aracılığıyla gelen iş teklifleri" />
      <div className="mb-16"><Tabs active={tab} items={[{ key: 'yeni', label: 'Yanıt bekleyen', n: pending.length, href: '/icerik-uretici/teklifler' }, { key: 'gecmis', label: 'Geçmiş', n: past.length, href: '/icerik-uretici/teklifler?tab=gecmis' }]} /></div>
      {tab === 'yeni'
        ? (pending.length ? <div className="stack">{pending.map((p) => <OfferCard key={p.id} db={db} p={p} />)}</div>
          : <div className="card"><EmptyState icon="inbox" title="Yanıt bekleyen teklif yok" text="Profilinizi güncel tutun; uygun projeler geldiğinde bildirim alırsınız." action={<Link className="btn btn-ghost" href="/icerik-uretici/profil">Profilimi düzenle</Link>} /></div>)
        : <div className="card">{past.length ? past.map(({ p, o }) => (
          <Link key={p.id} className="list-row" href={o!.status === 'accepted' ? '/icerik-uretici/isler/' + p.id : '/icerik-uretici/teklifler/' + p.id}><BrandLogo b={R.brandOf(db, p.brandId)} size="sm" />
            <div className="lr-main"><div className="lr-t">{p.title}</div><div className="lr-s">{R.brandOf(db, p.brandId).name} · {tl(o!.fee * p.videoCount)} · {fmtDate(o!.answeredAt || o!.date)}</div></div>
            <StatusBadge map={OFFER_STATUS} value={o!.status} /></Link>
        )) : <EmptyState icon="inbox" title="Geçmiş teklif yok" />}</div>}
    </div>
  );
}
