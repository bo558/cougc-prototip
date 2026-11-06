'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES, ORDER_STATUS, PROJECT_STATUS } from '@/lib/domain/status';
import { fmtDate, fmtDateLong, initials, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { useCrumbs, useQueryHref } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Badge, Callout, EmptyState, Stat, StatusBadge, Tabs } from '@/components/ui/primitives';
import { AsyncButton } from '@/components/ui/interactive';
import { Ledger } from '@/components/shared/project';

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>();
  const db = useDb(); const qh = useQueryHref();
  const tab = useSearchParams().get('tab') || 'projeler';
  const b = db.brands.find((x) => x.id === id);
  useCrumbs([{ t: 'Markalar', h: '/admin/markalar' }, { t: b?.name || 'Marka' }]);
  if (!b) return <div className="page"><EmptyState icon="building" title="Marka bulunamadı" /></div>;
  const cr = R.credits(db, b.id);
  const ps = R.projectsOfBrand(db, b.id).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const os = R.ordersOfBrand(db, b.id);
  const tabs = [
    { key: 'projeler', label: 'Projeler', n: ps.length, href: qh({ tab: null }) }, { key: 'siparisler', label: 'Siparişler', n: os.length, href: qh({ tab: 'siparisler' }) },
    { key: 'haklar', label: 'Hak hareketleri', href: qh({ tab: 'haklar' }) }, { key: 'kullanicilar', label: 'Kullanıcılar', n: b.users.length, href: qh({ tab: 'kullanicilar' }) }
  ];
  let body: React.ReactNode;
  if (tab === 'projeler') body = ps.length ? ps.map((p) => (
    <Link key={p.id} className="list-row" href={'/admin/projeler/' + p.id}><div className="lr-main"><div className="lr-t">{p.title}</div><div className="lr-s">{p.no} · {p.videoCount} video · {fmtDate(p.createdAt)}</div></div><StatusBadge map={PROJECT_STATUS} value={p.status} /></Link>
  )) : <EmptyState icon="folder" title="Henüz proje yok" />;
  else if (tab === 'siparisler') body = os.length ? (
    <div className="table-wrap"><table className="table"><thead><tr><th>Sipariş</th><th>Paket</th><th>Tutar</th><th>Tarih</th><th>Durum</th></tr></thead>
      <tbody>{os.map((o) => <tr key={o.id}><td className="cell-main">{o.no}</td><td>{R.pkgOf(db, o.packageId)!.name} · {o.videos} video</td><td className="mono">{tl(R.orderTotal(db, o))}</td><td>{fmtDate(o.date)}</td><td><StatusBadge map={ORDER_STATUS} value={o.status} /></td></tr>)}</tbody></table></div>
  ) : <EmptyState icon="receipt" title="Sipariş yok" />;
  else if (tab === 'haklar') body = <Ledger db={db} bid={b.id} />;
  else body = b.users.map((u) => <div key={u.email} className="list-row"><span className="avatar">{initials(u.name)}</span><div className="lr-main"><div className="lr-t">{u.name}</div><div className="lr-s">{u.email}</div></div><Badge dot={false}>{u.role}</Badge></div>);

  const vs = ps.flatMap((p) => p.videos.filter((v) => v.versions.length));
  return (
    <div className="page">
      <div className="page-head">
        <div className="row"><BrandLogo b={b} size="lg" /><div><h1>{b.name}</h1><p className="sub">{b.sector} · {b.city} · Üyelik {fmtDateLong(b.createdAt)}</p></div></div>
        <div className="actions">{b.status === 'active'
          ? <AsyncButton className="btn btn-ghost" onRun={async () => { await api.setBrandStatus(b.id, 'passive'); toast('Marka pasife alındı', 'info'); }}><Icon name="ban" size={15} />Pasife al</AsyncButton>
          : <AsyncButton className="btn btn-dark" onRun={async () => { await api.setBrandStatus(b.id, 'active'); toast('Marka aktifleştirildi', 'info'); }}>Aktifleştir</AsyncButton>}</div>
      </div>
      {b.status === 'passive' && <Callout tone="amber" icon="alert" className="mb-24">Bu marka pasif. Kullanıcıları giriş yapamaz ve yeni sipariş veremez.</Callout>}
      <div className="stats">
        <Stat k="Kalan video hakkı" icon="package" v={cr.available} d={`${cr.total} toplam · ${cr.reserved} rezerve · ${cr.used} kullanıldı`} />
        <Stat k="Aktif proje" icon="folder" v={ps.filter((x) => ACTIVE_STATUSES.includes(x.status)).length} d={ps.filter((x) => x.status === 'tamamlandi').length + ' tamamlandı'} />
        <Stat k="Toplam harcama" icon="card" v={tl(os.filter((o) => o.status === 'paid').reduce((s, o) => s + R.orderTotal(db, o), 0))} d="KDV dahil" />
        <Stat k="Revize oranı" icon="revise" v={vs.length ? R.revRate(ps) : '—'} d="video başına ortalama" />
      </div>
      <div className="layout-2 mt-24">
        <div className="card"><div style={{ padding: '0 12px' }}><Tabs items={tabs} active={tab} /></div>{body}</div>
        <div className="stack-lg">
          <div className="card"><div className="card-head"><h3>Firma bilgileri</h3></div><div className="card-body"><dl className="kv" style={{ gridTemplateColumns: '110px 1fr' }}>
            <dt>Yetkili</dt><dd>{b.contact.name}<div className="xs muted">{b.contact.title}</div></dd><dt>E-posta</dt><dd>{b.contact.email}</dd><dt>Telefon</dt><dd>{b.contact.phone}</dd>
            <dt>Web</dt><dd>{b.website}</dd><dt>Instagram</dt><dd>{b.instagram}</dd></dl></div></div>
          <div className="card"><div className="card-head"><h3>Fatura bilgileri</h3></div><div className="card-body"><dl className="kv" style={{ gridTemplateColumns: '110px 1fr' }}>
            <dt>Ünvan</dt><dd>{b.billing.title}</dd><dt>Vergi dairesi</dt><dd>{b.billing.taxOffice}</dd><dt>Vergi no</dt><dd>{b.billing.taxNo}</dd><dt>Adres</dt><dd>{b.billing.address}</dd></dl></div></div>
        </div>
      </div>
    </div>
  );
}
