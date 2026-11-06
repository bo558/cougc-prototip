'use client';
import Link from 'next/link';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES, PROJECT_STATUS } from '@/lib/domain/status';
import { daysUntil, DAYS, fmtDate, MONTHS, MONTHS_LONG, relDays, TODAY, tl } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/media';
import { BarChart, EmptyState, PageHead, Stat } from '@/components/ui/primitives';

export default function AdminDashboard() {
  useCrumbs([{ t: 'Genel bakış' }]);
  const db = useDb();
  const ps = db.projects;
  const active = ps.filter((p) => ACTIVE_STATUSES.includes(p.status));
  const late = active.filter(R.isLate);
  const q = R.adminQueue(db);
  const paid = db.orders.filter((o) => o.status === 'paid');
  const recent = paid.filter((o) => (daysUntil(o.date) ?? -99) >= -30);
  const payoutDue = ps.filter((p) => p.payout.status === 'odenecek');

  const queue: { i: IconName; t: string; title: string; sub: string; href: string; cta: string }[] = [
    ...q.videos.map((p) => ({ i: 'film' as IconName, t: 't-orange', title: p.no + ' · video ön kontrolü', sub: R.creatorOf(db, p.creatorId)!.name + ' yükledi · ' + R.brandOf(db, p.brandId).name, href: '/admin/projeler/' + p.id, cta: 'Kontrol et' })),
    ...q.briefs.map((p) => ({ i: 'file' as IconName, t: 't-amber', title: p.no + ' · ' + p.title, sub: R.brandOf(db, p.brandId).name + ' · ' + (p.offers.some((o) => o.status === 'rejected') ? 'içerik üreticisi reddetti, alternatif gerekli' : 'brief ve tercih değerlendirmesi'), href: '/admin/projeler/' + p.id, cta: 'İncele' })),
    ...q.confirm.map((p) => ({ i: 'calendar' as IconName, t: 't-blue', title: p.no + ' · kesinleştirme', sub: R.creatorOf(db, p.creatorId)!.name + ' kabul etti · ' + R.brandOf(db, p.brandId).name, href: '/admin/projeler/' + p.id, cta: 'Kesinleştir' })),
    ...q.preferences.map((x) => ({ i: 'star' as IconName, t: 't-orange', title: R.brandOf(db, x.brandId).name + ' · ' + R.creatorOf(db, x.creatorId)!.name + ' tercihi', sub: 'Marka tercihi · atama değildir', href: '/admin/marka-tercihleri', cta: 'Değerlendir' })),
    ...q.formApplications.map((a) => ({ i: 'user' as IconName, t: '', title: a.name + ' · web sitesi başvurusu', sub: a.contentTypes.join(', ') + ' · ' + a.city, href: '/admin/icerik-ureticileri?tab=basvuru', cta: 'İncele' })),
    ...q.applications.map((c) => ({ i: 'user' as IconName, t: '', title: c.name + ' · içerik üreticisi başvurusu', sub: c.cats.join(', ') + ' · ' + c.city, href: '/admin/icerik-ureticileri?tab=basvuru', cta: 'İncele' }))
  ];
  const upcoming = active.filter((p) => p.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!)).slice(0, 5);
  const months = R.salesByMonth(db);
  const pipe = ['admin_incelemesi', 'teklif_gonderildi', 'kesinlestirme', 'kargo', 'uretimde', 'teslim'] as const;
  const pipeMax = Math.max(1, ...pipe.map((s) => ps.filter((p) => p.status === s).length));
  const fmtK = (v: number) => (v >= 1000 ? Math.round(v / 1000) + 'B' : String(v));

  return (
    <div className="page">
      <PageHead title="Günaydın, Operasyon"
        sub={`${TODAY.getDate()} ${MONTHS_LONG[TODAY.getMonth()]} ${TODAY.getFullYear()}, ${DAYS[TODAY.getDay()]} · ${queue.length} iş aksiyonunuzu bekliyor`}
        actions={<><Link className="btn btn-ghost" href="/admin/raporlar"><Icon name="chart" size={16} />Raporlar</Link><Link className="btn btn-dark" href="/admin/onaylar"><Icon name="inbox" size={16} />Onay kuyruğu</Link></>} />
      <div className="stats">
        <Stat k="Aktif proje" icon="folder" v={active.length} d={late.length ? <><span className="down">{late.length} gecikmede</span> · {active.filter((p) => p.status === 'teslim').length} teslim sürecinde</> : 'Gecikme yok'} />
        <Stat k="Onay bekleyen" icon="inbox" v={R.adminQueueCount(db)} d={`${q.videos.length} video · ${q.briefs.length} brief · ${q.preferences.length} tercih · ${q.confirm.length} kesinleştirme`} />
        <Stat k="Tahsilat (son 30 gün)" icon="card" v={tl(recent.reduce((s, o) => s + R.orderTotal(db, o), 0))} d={`KDV dahil · ${recent.length} sipariş`} />
        <Stat k="Bekleyen hak ediş" icon="wallet" v={tl(payoutDue.reduce((s, p) => s + p.fee * p.videoCount, 0))} d={`${payoutDue.length} içerik üreticisi ödemesi`} />
      </div>
      <div className="layout-2 mt-24">
        <div className="stack-lg">
          <div className="card">
            <div className="card-head"><div><h3>Aksiyon bekleyenler</h3><div className="sub">Sırası COUGC ekibinde olan işler</div></div><Link className="btn-link small" href="/admin/onaylar">Tümü</Link></div>
            {queue.length ? queue.slice(0, 6).map((x) => (
              <Link key={x.title} className="list-row" href={x.href}><span className={'lr-i ' + x.t}><Icon name={x.i} size={18} /></span>
                <div className="lr-main"><div className="lr-t">{x.title}</div><div className="lr-s">{x.sub}</div></div><span className="btn btn-ghost btn-sm">{x.cta}</span></Link>
            )) : <EmptyState icon="check-circle" title="Kuyruk temiz" text="Şu an aksiyon bekleyen iş yok." />}
          </div>
          <div className="card">
            <div className="card-head"><div><h3>Satışlar</h3><div className="sub">Aylık tahsilat (KDV dahil)</div></div><Link className="btn-link small" href="/admin/raporlar">Detaylı rapor</Link></div>
            <div className="card-body"><BarChart label="Aylık satış" fmt={fmtK} data={months.map((m, i) => ({ l: MONTHS[Number(m.k.slice(5)) - 1], v: m.v, hi: i === months.length - 2 }))} /></div>
          </div>
        </div>
        <div className="stack-lg">
          <div className="card"><div className="card-head"><h3>Proje hattı</h3><Link className="btn-link small" href="/admin/projeler?view=kanban">Kanban</Link></div>
            <div className="card-body"><div className="hbar">
              {pipe.map((s) => { const n = ps.filter((p) => p.status === s).length; return (
                <Link key={s} className="hb-row" href={'/admin/projeler?durum=' + s}><span className="muted">{PROJECT_STATUS[s].label}</span>
                  <div className="progress"><i style={{ width: (n / pipeMax) * 100 + '%', background: 'var(--ink)' }} /></div><b className="strong t-right">{n}</b></Link>
              ); })}
            </div></div>
          </div>
          <div className="card"><div className="card-head"><h3>Yaklaşan teslimler</h3></div>
            {upcoming.map((p) => { const lt = R.isLate(p); return (
              <Link key={p.id} className="list-row" href={'/admin/projeler/' + p.id}><Avatar c={R.creatorOf(db, p.creatorId)} size="sm" />
                <div className="lr-main"><div className="lr-t">{p.title}</div><div className="lr-s">{R.brandOf(db, p.brandId).name}</div></div>
                <div className="t-right"><div className={'small strong ' + (lt ? 'red' : '')}>{fmtDate(p.deadline)}</div><div className={'xs ' + (lt ? 'red' : 'muted-2')}>{relDays(p.deadline)}</div></div></Link>
            ); })}
          </div>
          <div className="card"><div className="card-head"><h3>Platform</h3></div><div className="card-body"><dl className="kv" style={{ gridTemplateColumns: '1fr auto' }}>
            <dt>Aktif marka</dt><dd>{db.brands.filter((b) => b.status === 'active').length}</dd>
            <dt>Aktif içerik üreticisi</dt><dd>{db.creators.filter((c) => c.status === 'active').length}</dd>
            <dt>Vitrindeki içerik üreticisi</dt><dd>{db.creators.filter((c) => c.showcase).length} / {db.settings.showcaseSize}</dd>
            <dt>Tamamlanan proje</dt><dd>{ps.filter((p) => p.status === 'tamamlandi').length}</dd>
          </dl></div></div>
        </div>
      </div>
    </div>
  );
}
