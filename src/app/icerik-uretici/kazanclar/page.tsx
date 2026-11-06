'use client';
import Link from 'next/link';
import * as R from '@/lib/domain/rules';
import { PAYOUT_STATUS } from '@/lib/domain/status';
import { fmtDate, tl } from '@/lib/format';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Star } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Callout, EmptyState, PageHead, StatusBadge } from '@/components/ui/primitives';
import { earnings } from '@/components/creator/parts';

export default function Earnings() {
  useCrumbs([{ t: 'Kazançlar' }]);
  const db = useDb(); const er = earnings(db); const c = R.creatorOf(db, CREATOR_ID)!;
  const ps = R.projectsOfCreator(db, CREATOR_ID).filter((p) => p.status !== 'iptal').sort((a, b) => (b.completedAt || b.createdAt).localeCompare(a.completedAt || a.createdAt));
  return (
    <div className="page creator-col">
      <PageHead title="Kazançlar" />
      <div className="credit-card"><Star />
        <div className="lbl">Ödenecek tutar</div><div className="big" style={{ fontSize: 44, marginTop: 6 }}>{tl(er.due)}</div>
        <div className="row mt-16 xs" style={{ gap: 18, color: 'rgba(255,255,255,.65)' }}><span>Süren işler: <b style={{ color: '#fff' }}>{tl(er.expected)}</b></span><span>Toplam ödenen: <b style={{ color: '#fff' }}>{tl(er.paid)}</b></span></div>
      </div>
      <Callout className="mt-16 small">Hak edişiniz, projedeki tüm videolar marka tarafından onaylandığında oluşur. Ödemeler COUGC tarafından <b>{c.iban || 'IBAN'}</b> hesabınıza yapılır.</Callout>
      <div className="section-title mt-24"><h2>Proje bazında</h2></div>
      <div className="card">{ps.length ? ps.map((p) => (
        <Link key={p.id} className="list-row" href={'/icerik-uretici/isler/' + p.id}><BrandLogo b={R.brandOf(db, p.brandId)} size="sm" />
          <div className="lr-main"><div className="lr-t">{p.title}</div><div className="lr-s">{p.no} · {p.videoCount} × {tl(p.fee)}{p.payout.date && ' · ödendi ' + fmtDate(p.payout.date)}</div></div>
          <div className="t-right"><div className="strong mono">{tl(p.fee * p.videoCount)}</div><StatusBadge map={PAYOUT_STATUS} value={p.payout.status} /></div></Link>
      )) : <EmptyState icon="wallet" title="Henüz kazanç yok" />}</div>
    </div>
  );
}
