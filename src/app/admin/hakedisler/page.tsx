'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { PayoutStatus } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { PAYOUT_STATUS } from '@/lib/domain/status';
import { fmtDate, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Avatar } from '@/components/ui/media';
import { Chips, EmptyState, PageHead, Stat, StatusBadge } from '@/components/ui/primitives';
import { AsyncButton } from '@/components/ui/interactive';

export default function PayoutsPage() {
  useCrumbs([{ t: 'İçerik Üreticisi hak edişleri' }]);
  const db = useDb(); const qh = useQueryHref();
  const f = useSearchParams().get('durum') || 'odenecek';
  const ps = db.projects.filter((p) => p.creatorId && p.status !== 'iptal');
  const list = ps.filter((p) => f === 'tumu' || p.payout.status === f).sort((a, b) => (b.completedAt || b.createdAt).localeCompare(a.completedAt || a.createdAt));
  const total = (s: PayoutStatus) => ps.filter((p) => p.payout.status === s).reduce((t, p) => t + p.fee * p.videoCount, 0);
  return (
    <div className="page">
      <PageHead title="İçerik Üreticisi hak edişleri" sub="İlk sürümde içerik üreticisi ödemeleri banka üzerinden yapılır ve burada manuel işaretlenir." />
      <div className="stats" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <Stat k="Ödenecek" icon="receipt" v={tl(total('odenecek'))} d="tamamlanan projeler" />
        <Stat k="Süren projelerde" icon="clock" v={tl(total('olusmadi'))} d="onay sonrası oluşur" />
        <Stat k="Ödenen" icon="check-circle" v={tl(total('odendi'))} d="toplam" />
      </div>
      <div className="card mt-24">
        <div className="toolbar"><Chips active={f} items={(['odenecek', 'olusmadi', 'odendi', 'tumu'] as const).map((k) => ({ key: k, label: k === 'tumu' ? 'Tümü' : PAYOUT_STATUS[k].label, href: qh({ durum: k }) }))} /></div>
        {list.length ? <div className="table-wrap"><table className="table responsive">
          <thead><tr><th>İçerik Üreticisi</th><th>Proje</th><th>Tutar</th><th>Tamamlanma</th><th>IBAN</th><th>Durum</th><th /></tr></thead>
          <tbody>{list.map((p) => { const c = R.creatorOf(db, p.creatorId)!; return (
            <tr key={p.id}>
              <td className="td-main"><div className="row-sm"><Avatar c={c} size="sm" /><b className="strong">{c.name}</b></div></td>
              <td data-l="Proje"><Link className="btn-link" href={'/admin/projeler/' + p.id}>{p.no}</Link><div className="cell-sub">{p.title}</div></td>
              <td data-l="Tutar" className="mono strong">{tl(p.fee * p.videoCount)}<div className="cell-sub">{tl(p.fee)} × {p.videoCount}</div></td>
              <td data-l="Tamamlanma">{p.completedAt ? fmtDate(p.completedAt) : '—'}</td>
              <td data-l="IBAN" className="small muted">{c.iban || '—'}</td>
              <td data-l="Durum"><StatusBadge map={PAYOUT_STATUS} value={p.payout.status} />{p.payout.date && <div className="cell-sub">{fmtDate(p.payout.date)}</div>}</td>
              <td>{p.payout.status === 'odenecek' && <AsyncButton className="btn btn-success btn-sm" onRun={async () => { await api.markPayoutPaid(p.id); toast('Hak ediş ödendi olarak işaretlendi', 'success', 'İçerik üreticisi bilgilendirildi.'); }}>Ödendi işaretle</AsyncButton>}</td>
            </tr>
          ); })}</tbody></table></div> : <EmptyState icon="wallet" title="Bu filtrede hak ediş yok" />}
      </div>
    </div>
  );
}
