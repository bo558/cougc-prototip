'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES } from '@/lib/domain/status';
import { lower, tl } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Badge, Chips, EmptyState, PageHead } from '@/components/ui/primitives';
import { DemoOnlyModal } from '@/components/admin/modals';

export default function BrandsPage() {
  useCrumbs([{ t: 'Markalar' }]);
  const db = useDb(); const router = useRouter(); const qh = useQueryHref();
  const f = useSearchParams().get('durum') || 'tumu';
  const [term, setTerm] = useState('');
  const t = lower(term.trim());
  const list = db.brands.filter((b) => f === 'tumu' || b.status === f).filter((b) => !t || lower(b.name + ' ' + b.contact.name + ' ' + b.sector).includes(t));
  const newBrand = () => openModal(<DemoOnlyModal title="Marka oluştur" sub="Kurumsal müşteriler için hesabı COUGC ekibi açabilir; yetkiliye davet e-postası gider." cta="Davet gönder" msg="Marka oluşturma bu prototipte simüle edilir"
    fields={<><div className="grid-2"><div className="field"><label>Marka adı</label><input className="input" /></div><div className="field"><label>Sektör</label><input className="input" /></div></div>
      <div className="grid-2"><div className="field"><label>Yetkili ad soyad</label><input className="input" /></div><div className="field"><label>Yetkili e-posta</label><input className="input" type="email" /></div></div></>} />);
  return (
    <div className="page">
      <PageHead title="Markalar" sub={db.brands.length + ' marka hesabı'} actions={<button className="btn btn-dark" onClick={newBrand}><Icon name="plus" size={16} />Marka oluştur</button>} />
      <div className="card">
        <div className="toolbar"><div className="input-wrap"><Icon name="search" size={16} /><input className="input input-sm" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Marka, yetkili veya sektör ara" /></div>
          <Chips active={f} items={[{ key: 'tumu', label: 'Tümü', n: db.brands.length, href: qh({ durum: null }) }, { key: 'active', label: 'Aktif', n: db.brands.filter((b) => b.status === 'active').length, href: qh({ durum: 'active' }) }, { key: 'passive', label: 'Pasif', n: db.brands.filter((b) => b.status === 'passive').length, href: qh({ durum: 'passive' }) }]} /></div>
        {list.length ? <div className="table-wrap"><table className="table responsive">
          <thead><tr><th>Marka</th><th>Yetkili</th><th>Video hakkı</th><th>Aktif proje</th><th>Toplam harcama</th><th>Durum</th></tr></thead>
          <tbody>{list.map((b) => {
            const cr = R.credits(db, b.id);
            const spent = db.orders.filter((o) => o.brandId === b.id && o.status === 'paid').reduce((s, o) => s + R.orderTotal(db, o), 0);
            return (
              <tr key={b.id} data-href onClick={() => router.push('/admin/markalar/' + b.id)}>
                <td className="td-main"><div className="row"><BrandLogo b={b} /><div><div className="cell-main">{b.name}</div><div className="cell-sub">{b.sector} · {b.city}</div></div></div></td>
                <td data-l="Yetkili">{b.contact.name}<div className="cell-sub">{b.contact.email}</div></td>
                <td data-l="Video hakkı"><b className="strong">{cr.available}</b> <span className="muted small">/ {cr.total} kalan</span></td>
                <td data-l="Aktif proje">{R.projectsOfBrand(db, b.id).filter((p) => ACTIVE_STATUSES.includes(p.status)).length}</td>
                <td data-l="Harcama" className="mono">{tl(spent)}</td>
                <td data-l="Durum">{b.status === 'active' ? <Badge tone="green">Aktif</Badge> : <Badge>Pasif</Badge>}</td>
              </tr>
            );
          })}</tbody></table></div> : <EmptyState icon="search" title="Sonuç bulunamadı" />}
      </div>
    </div>
  );
}
