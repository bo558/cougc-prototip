'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import * as R from '@/lib/domain/rules';
import { OFFER_STATUS, PROJECT_STATUS } from '@/lib/domain/status';
import { fmtDateLong, rating, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { openModal, toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar, BrandLogo } from '@/components/ui/media';
import { Badge, EmptyState, Stat, StatusBadge } from '@/components/ui/primitives';
import { AsyncButton } from '@/components/ui/interactive';
import { CreatorProfileModal } from '@/components/shared/creator';
import { FlagSwitch } from '@/components/admin/FlagSwitch';

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const db = useDb();
  const c = R.creatorOf(db, id);
  useCrumbs([{ t: 'İçerik Üreticileri', h: '/admin/icerik-ureticileri' }, { t: c?.name || 'İçerik Üreticisi' }]);
  const [fee, setFee] = useState(c?.fee || 0);
  if (!c) return <div className="page"><EmptyState icon="users" title="İçerik üreticisi bulunamadı" /></div>;
  const ps = db.projects.filter((p) => p.creatorId === c.id || p.offers.some((o) => o.creatorId === c.id));
  const sum = (s: string) => ps.filter((p) => p.creatorId === c.id && p.payout.status === s).reduce((t, p) => t + p.fee * p.videoCount, 0);
  return (
    <div className="page">
      <div className="page-head">
        <div className="row"><Avatar c={c} size="xl" />
          <div><div className="row-sm"><h1>{c.name}</h1>{c.showcase && <Badge tone="orange">Vitrinde</Badge>}{!c.visible && <Badge>Gizli</Badge>}</div>
            <p className="sub">{c.city} · {c.age} · {c.cats.join(', ')} · Katılım {fmtDateLong(c.joined)}</p></div></div>
        <div className="actions"><button className="btn btn-ghost" onClick={() => openModal(<CreatorProfileModal id={c.id} role="brand" />)}><Icon name="eye" size={15} />Markanın gördüğü profil</button></div>
      </div>
      <div className="stats">
        <Stat k="Puan" icon="star" v={c.rating ? rating(c.rating) : '—'} d={c.done + ' tamamlanan iş'} />
        <Stat k="Zamanında teslim" icon="clock" v={'%' + c.onTime} d="son 6 ay" />
        <Stat k="Ödenen" icon="wallet" v={tl(sum('odendi'))} d="platform üzerinden" />
        <Stat k="Ödenecek" icon="receipt" v={tl(sum('odenecek'))} d="onaylanmış işler" />
      </div>
      <div className="layout-2 mt-24">
        <div className="card"><div className="card-head"><h3>Projeler ve teklifler</h3></div>
          {ps.length ? ps.map((p) => {
            const of = p.offers.filter((o) => o.creatorId === c.id).pop();
            return (
              <Link key={p.id} className="list-row" href={'/admin/projeler/' + p.id}><BrandLogo b={R.brandOf(db, p.brandId)} size="sm" />
                <div className="lr-main"><div className="lr-t">{p.title}</div><div className="lr-s">{p.no} · {R.brandOf(db, p.brandId).name}{of && ' · teklif: ' + OFFER_STATUS[of.status].label.toLocaleLowerCase('tr-TR')}</div></div>
                {p.creatorId === c.id ? <StatusBadge map={PROJECT_STATUS} value={p.status} /> : of && <StatusBadge map={OFFER_STATUS} value={of.status} />}</Link>
            );
          }) : <EmptyState icon="folder" title="Henüz proje yok" />}
        </div>
        <div className="stack-lg">
          <div className="card"><div className="card-head"><h3>Yönetim</h3></div><div className="card-body stack">
            <div className="row between"><div><b className="strong small">Markalara görünür</b><div className="xs muted">Kapalıysa teklif almaya devam eder ama vitrinde görünmez.</div></div><FlagSwitch c={c} flag="visible" title="Markalara görünür" /></div>
            <div className="row between"><div><b className="strong small">Marka vitrininde</b><div className="xs muted">Markaların inceleme ekranında listelenir.</div></div><FlagSwitch c={c} flag="showcase" title="Marka vitrininde" /></div>
            <div className="field"><label>Video başı ücret</label><div className="row-sm">
              <input className="input" type="number" value={fee} step={50} onChange={(e) => setFee(Number(e.target.value))} />
              <AsyncButton className="btn btn-ghost" onRun={async () => { await api.setCreatorFee(c.id, fee); toast('Ücret güncellendi', 'success', 'Yeni tekliflerde varsayılan olarak kullanılır.'); }}>Kaydet</AsyncButton></div></div>
          </div></div>
          <div className="card"><div className="card-head"><h3>İletişim ve ödeme</h3></div><div className="card-body">
            <dl className="kv" style={{ gridTemplateColumns: '90px 1fr' }}><dt>E-posta</dt><dd>{c.email}</dd><dt>Telefon</dt><dd>{c.phone}</dd><dt>Instagram</dt><dd>{c.ig}</dd><dt>TikTok</dt><dd>{c.tt}</dd>
              <dt>IBAN</dt><dd>{c.iban || <span className="muted-2">Girilmedi</span>}</dd></dl>
            <p className="xs muted-2 mt-16"><Icon name="lock" size={12} /> İçerik üreticisinin kişisel iletişim bilgileri markalarla paylaşılmaz.</p>
          </div></div>
        </div>
      </div>
    </div>
  );
}
