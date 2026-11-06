'use client';
import Link from 'next/link';
import * as R from '@/lib/domain/rules';
import { ORDER_STATUS } from '@/lib/domain/status';
import { fmtDateTime, tl } from '@/lib/format';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHead, StatusBadge } from '@/components/ui/primitives';
import { downloadToast } from '@/components/shared/video';

export default function BrandPayments() {
  useCrumbs([{ t: 'Ödemeler' }]);
  const db = useDb();
  const os = R.ordersOfBrand(db, BRAND_ID);
  return (
    <div className="page">
      <PageHead title="Ödemeler" sub="Sipariş ve fatura geçmişiniz" actions={<Link className="btn btn-primary" href="/marka/paketler">Paketler</Link>} />
      <div className="card">{os.length ? (
        <div className="table-wrap"><table className="table responsive"><thead><tr><th>Sipariş</th><th>Paket</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th>Fatura</th></tr></thead>
          <tbody>{os.map((o) => (
            <tr key={o.id}><td className="td-main"><div className="cell-main">{o.no}</div><div className="cell-sub">Kart {o.card}</div></td>
              <td data-l="Paket">{R.pkgOf(db, o.packageId)!.name} · {o.videos} video</td><td data-l="Tarih">{fmtDateTime(o.date)}</td>
              <td data-l="Tutar" className="mono strong">{tl(R.orderTotal(db, o))}</td><td data-l="Durum"><StatusBadge map={ORDER_STATUS} value={o.status} /></td>
              <td data-l="Fatura">{o.invoice ? <button className="btn btn-ghost btn-sm" onClick={downloadToast}><Icon name="download" size={14} />PDF</button> : <span className="muted-2">—</span>}</td></tr>
          ))}</tbody></table></div>
      ) : <EmptyState icon="receipt" title="Henüz ödeme yok" />}</div>
    </div>
  );
}
