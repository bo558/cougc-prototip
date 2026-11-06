'use client';
import { useSearchParams } from 'next/navigation';
import type { OrderStatus } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { ORDER_STATUS } from '@/lib/domain/status';
import { fmtDateTime, tl } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Chips, EmptyState, PageHead, Stat, StatusBadge } from '@/components/ui/primitives';
import { demoToast, RefundModal } from '@/components/admin/modals';

export default function PaymentsPage() {
  useCrumbs([{ t: 'Siparişler & ödemeler' }]);
  const db = useDb(); const qh = useQueryHref();
  const f = useSearchParams().get('durum') || 'tumu';
  const all = db.orders.slice().sort((a, b) => b.date.localeCompare(a.date));
  const list = all.filter((o) => f === 'tumu' || o.status === f);
  const sum = (s: OrderStatus) => all.filter((o) => o.status === s).reduce((t, o) => t + R.orderTotal(db, o), 0);
  const paidN = all.filter((o) => o.status === 'paid').length;
  return (
    <div className="page">
      <PageHead title="Siparişler & ödemeler" sub="Ödeme durumu yalnızca sağlayıcının sunucu bildirimiyle güncellenir (gerçek sistemde)."
        actions={<button className="btn btn-ghost" onClick={() => demoToast('CSV dışa aktarma simüle edildi')}><Icon name="download" size={15} />Dışa aktar</button>} />
      <div className="stats">
        <Stat k="Tahsil edilen" icon="check-circle" v={tl(sum('paid'))} d={paidN + ' başarılı ödeme'} />
        <Stat k="İade edilen" icon="revise" v={tl(sum('refunded'))} d={all.filter((o) => o.status === 'refunded').length + ' sipariş'} />
        <Stat k="Başarısız" icon="x-circle" v={all.filter((o) => o.status === 'failed').length} d="deneme" />
        <Stat k="Ortalama sepet" icon="card" v={tl(sum('paid') / Math.max(1, paidN))} d="KDV dahil" />
      </div>
      <div className="card mt-24">
        <div className="toolbar"><Chips active={f} items={(['tumu', 'paid', 'failed', 'refunded'] as const).map((k) => ({ key: k, label: k === 'tumu' ? 'Tümü' : ORDER_STATUS[k].label, n: k === 'tumu' ? all.length : all.filter((o) => o.status === k).length, href: qh({ durum: k === 'tumu' ? null : k }) }))} /></div>
        {list.length ? <div className="table-wrap"><table className="table responsive">
          <thead><tr><th>Sipariş</th><th>Marka</th><th>Paket</th><th>Tutar</th><th>Ödeme</th><th>Tarih</th><th>Durum</th><th /></tr></thead>
          <tbody>{list.map((o) => { const b = R.brandOf(db, o.brandId); return (
            <tr key={o.id}>
              <td className="td-main"><div className="cell-main">{o.no}</div><div className="cell-sub">{o.invoice ? 'Fatura ' + o.invoice : o.status === 'failed' ? o.failReason : ''}</div></td>
              <td data-l="Marka"><div className="row-sm"><BrandLogo b={b} size="sm" />{b.name}</div></td>
              <td data-l="Paket">{R.pkgOf(db, o.packageId)!.name} · {o.videos} video{o.coupon && <div className="cell-sub">Kupon {o.coupon}</div>}</td>
              <td data-l="Tutar" className="mono strong">{tl(R.orderTotal(db, o))}</td>
              <td data-l="Ödeme" className="muted">Kart {o.card}</td>
              <td data-l="Tarih" className="nowrap">{fmtDateTime(o.date)}</td>
              <td data-l="Durum"><StatusBadge map={ORDER_STATUS} value={o.status} /></td>
              <td>{o.status === 'paid' && <button className="btn btn-ghost btn-sm" onClick={() => openModal(<RefundModal oid={o.id} />)}>İade</button>}</td>
            </tr>
          ); })}</tbody></table></div> : <EmptyState icon="receipt" title="Sipariş yok" />}
      </div>
    </div>
  );
}
