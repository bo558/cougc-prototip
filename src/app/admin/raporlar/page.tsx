'use client';
import { useRouter } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES } from '@/lib/domain/status';
import { MONTHS, MONTHS_LONG, rating, TODAY, tl } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/media';
import { BarChart, PageHead, Seg, Stat } from '@/components/ui/primitives';
import { demoToast } from '@/components/admin/modals';

export default function ReportsPage() {
  useCrumbs([{ t: 'Raporlar' }]);
  const db = useDb(); const router = useRouter();
  const months = R.salesByMonth(db);
  const monthAt = (back: number) => MONTHS_LONG[new Date(TODAY.getFullYear(), TODAY.getMonth() - back, 1).getMonth()];
  const paid = db.orders.filter((o) => o.status === 'paid');
  const byPkg = db.packages.map((pk) => { const os = paid.filter((o) => o.packageId === pk.id); return { pk, n: os.length, v: os.reduce((s, o) => s + R.orderTotal(db, o), 0) }; });
  const maxPkg = Math.max(1, ...byPkg.map((x) => x.v));
  const ps = db.projects;
  const totalCredits = paid.reduce((s, o) => s + o.videos, 0);
  const usedCredits = ps.filter((p) => !['iptal', 'taslak'].includes(p.status)).reduce((s, p) => s + p.videoCount, 0);
  const creatorCost = ps.filter((p) => p.creatorId && p.status !== 'iptal').reduce((s, p) => s + p.fee * p.videoCount, 0);
  const revenueNet = paid.reduce((s, o) => s + o.net - (o.discount || 0), 0);
  const offers = ps.flatMap((p) => p.offers);
  const top = db.creators.filter((c) => c.status === 'active').sort((a, b) => b.done - a.done).slice(0, 6);
  const margin = Math.round((1 - creatorCost / Math.max(1, (revenueNet * usedCredits) / Math.max(1, totalCredits))) * 100);
  return (
    <div className="page">
      <PageHead title="Raporlar" sub={`${monthAt(5)}–${monthAt(0)} ${TODAY.getFullYear()} · ${monthAt(5)} ve ${monthAt(4)} platform öncesi manuel kayıtlardır (demo).`}
        actions={<><Seg items={[{ label: '6 ay', on: true }, { label: '12 ay', on: false, onClick: () => demoToast('Dönem filtresi demo') }]} />
          <button className="btn btn-ghost" onClick={() => demoToast('PDF/CSV dışa aktarma simüle edildi')}><Icon name="download" size={15} />Dışa aktar</button></>} />
      <div className="stats">
        <Stat k="Net satış (KDV hariç)" icon="trending" v={tl(revenueNet)} d="platform siparişleri" />
        <Stat k="İçerik Üreticisi maliyeti" icon="wallet" v={tl(creatorCost)} d="atanmış projeler" />
        <Stat k="Brüt marj" icon="percent" v={'%' + margin} d="kullanılan haklar üzerinden" />
        <Stat k="Paket kullanımı" icon="package" v={'%' + Math.round((usedCredits / Math.max(1, totalCredits)) * 100)} d={`${usedCredits} / ${totalCredits} video hakkı`} />
      </div>
      <div className="layout-2 mt-24">
        <div className="card"><div className="card-head"><div><h3>Aylık satış</h3><div className="sub">KDV dahil tahsilat</div></div>
          <div className="legend"><span><i style={{ background: '#d9dcd5' }} />Manuel kayıt</span><span><i style={{ background: 'var(--ink)' }} />Platform</span></div></div>
          <div className="card-body"><BarChart h={260} fmt={(v) => (v >= 1000 ? Math.round(v / 1000) + 'B' : String(v))} data={months.map((m, i) => ({ l: MONTHS[Number(m.k.slice(5)) - 1], v: m.v, muted: i < 2 }))} /></div></div>
        <div className="card"><div className="card-head"><h3>Paket dağılımı</h3></div><div className="card-body">
          <div className="hbar">{byPkg.map((x) => (
            <div key={x.pk.id} className="hb-row" style={{ gridTemplateColumns: '90px 1fr 80px' }}><span className="muted">{x.pk.name}</span>
              <div className="progress"><i style={{ width: (x.v / maxPkg) * 100 + '%' }} /></div><span className="t-right"><b className="strong">{x.n}</b> <span className="xs muted">adet</span></span></div>
          ))}</div>
          <div className="divider" />
          <dl className="kv" style={{ gridTemplateColumns: '1fr auto' }}>
            <dt>Ortalama teslim süresi</dt><dd>17 gün</dd><dt>Video başına revize</dt><dd>{R.revRate(ps)}</dd>
            <dt>İçerik Üreticisi ret oranı</dt><dd>%{Math.round((offers.filter((o) => o.status === 'rejected').length / Math.max(1, offers.length)) * 100)}</dd>
            <dt>Geciken proje</dt><dd>{ps.filter(R.isLate).length}</dd>
          </dl>
        </div></div>
      </div>
      <div className="card mt-24"><div className="card-head"><h3>İçerik Üreticisi performansı</h3></div>
        <div className="table-wrap"><table className="table responsive"><thead><tr><th>İçerik Üreticisi</th><th>Tamamlanan</th><th>Zamanında</th><th>Puan</th><th>Aktif iş</th><th>Ücret</th></tr></thead>
          <tbody>{top.map((c) => (
            <tr key={c.id} data-href onClick={() => router.push('/admin/icerik-ureticileri/' + c.id)}>
              <td className="td-main"><div className="row-sm"><Avatar c={c} size="sm" /><b className="strong">{c.name}</b></div></td>
              <td data-l="Tamamlanan">{c.done}</td>
              <td data-l="Zamanında"><div className="row-sm"><div className="progress green" style={{ width: 80 }}><i style={{ width: c.onTime + '%' }} /></div>%{c.onTime}</div></td>
              <td data-l="Puan">{rating(c.rating)}</td>
              <td data-l="Aktif iş">{R.projectsOfCreator(db, c.id).filter((p) => ACTIVE_STATUSES.includes(p.status)).length}</td>
              <td data-l="Ücret" className="mono">{tl(c.fee)}</td>
            </tr>
          ))}</tbody></table></div></div>
    </div>
  );
}
