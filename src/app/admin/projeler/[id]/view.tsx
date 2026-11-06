'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Db, Project } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { OFFER_STATUS, PAYOUT_STATUS, PROJECT_STATUS, SHIPPING_STATUS, VIDEO_STATUS, isActive } from '@/lib/domain/status';
import { fmtDate, fmtDateLong, fmtDateTime, rating, relDays, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { openModal, toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Avatar, EmptyThumb, VideoThumb } from '@/components/ui/media';
import { Badge, EmptyState, StatusBadge, Timeline } from '@/components/ui/primitives';
import { AsyncButton, Dropdown } from '@/components/ui/interactive';
import { CancelModal, ConfirmModal, DeadlineModal, MeetingModal, MeetingResultModal, OfferModal, openAdminVideo, RecommendModal } from '@/components/admin/modals';
import { BriefDetails, ShipModal } from '@/components/shared/project';
import { CreatorProfileModal, availTone } from '@/components/shared/creator';
import { VideoInfo } from '@/components/shared/video';

const TONE_BG: Record<string, [string, string]> = {
  orange: ['var(--orange-50)', 'var(--orange-700)'], blue: ['var(--blue-50)', 'var(--blue)'], green: ['var(--green-50)', 'var(--green)'],
  violet: ['var(--violet-50)', 'var(--violet)'], red: ['var(--red-50)', 'var(--red)'], gray: ['var(--paper)', 'var(--muted)']
};
function StepBox({ tone, icon, title, text, actions }: { tone: string; icon: IconName; title: ReactNode; text: ReactNode; actions?: ReactNode }) {
  const [bg, fg] = TONE_BG[tone];
  return (
    <div className="card" style={{ borderColor: tone === 'orange' ? 'var(--orange-100)' : 'var(--line)', background: tone === 'orange' ? 'linear-gradient(180deg,var(--orange-50),#fff)' : '#fff' }}>
      <div className="card-body row" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', flex: 'none', background: bg, color: fg }}><Icon name={icon} size={20} /></span>
        <div className="grow" style={{ minWidth: 220 }}>
          <div className="xs strong" style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>Sıradaki adım</div>
          <h3 style={{ fontSize: 17, marginTop: 4 }}>{title}</h3><p className="small muted mt-8">{text}</p>
        </div>
        {actions && <div className="row-sm row-wrap">{actions}</div>}
      </div>
    </div>
  );
}

function NextStep({ db, p }: { db: Db; p: Project }) {
  const c = R.creatorOf(db, p.creatorId);
  const rej = p.offers.filter((o) => o.status === 'rejected');
  const open = (node: ReactNode) => () => openModal(node);
  switch (p.status) {
    case 'admin_incelemesi': {
      // Sıra: öneri → görüşme → görüşme sonucu → teklif. Marka tercihi tek başına atama değildir.
      const sel = p.selection;
      const prefix = rej.length ? `${R.creatorOf(db, rej[rej.length - 1].creatorId)!.name} teklifi reddetti; markanın video hakkı rezerve durumda. ` : '';
      if (!sel?.recommended.length) return <StepBox tone="orange" icon="users" title="Tercihleri değerlendirip markaya içerik üreticisi önerin"
        text={prefix + (p.preferred.length ? `Marka ${p.preferred.length} içerik üreticisi tercih etti. Tercih, atama veya kesin onay değildir; uygun bulduklarınızı markaya önerin.` : 'Marka değerlendirmeyi COUGC ekibine bıraktı. Uygun içerik üreticilerini markaya önerin.')}
        actions={<button className="btn btn-primary" onClick={open(<RecommendModal pid={p.id} />)}>Öneri hazırla</button>} />;
      if (!sel.meetingAt) return <StepBox tone="orange" icon="calendar" title="Markayla görüşme planlayın"
        text={prefix + `${sel.recommended.length} içerik üreticisi markaya önerildi. Nihai seçim, COUGC ekibiyle yapılacak görüşmede belirlenir.`}
        actions={<><button className="btn btn-ghost" onClick={open(<RecommendModal pid={p.id} />)}>Önerileri düzenle</button><button className="btn btn-primary" onClick={open(<MeetingModal pid={p.id} />)}>Görüşme planla</button></>} />;
      const finalC = R.creatorOf(db, sel.finalCreatorId);
      if (!finalC) return <StepBox tone="orange" icon="check-circle" title="Görüşme sonucunu kaydedin"
        text={prefix + `Görüşme tarihi: ${fmtDateLong(sel.meetingAt)}.${sel.meetingNote ? ' Not: ' + sel.meetingNote : ''} Görüşmede belirlenen içerik üreticisini kaydedin.`}
        actions={<><button className="btn btn-ghost" onClick={open(<MeetingModal pid={p.id} />)}>Tarihi değiştir</button><button className="btn btn-primary" onClick={open(<MeetingResultModal pid={p.id} />)}>Sonucu kaydet</button></>} />;
      return <StepBox tone="orange" icon="send" title="Görüşmede seçilen içerik üreticisine teklif gönderin"
        text={`${finalC.name} görüşmede seçildi. İçerik üreticisi teklifi kabul ettiğinde proje kesinleştirilir.`}
        actions={<><button className="btn btn-ghost" onClick={open(<MeetingResultModal pid={p.id} />)}>Sonucu değiştir</button><button className="btn btn-primary" onClick={open(<OfferModal pid={p.id} />)}><Icon name="send" size={15} />Teklif gönder</button></>} />;
    }
    case 'teklif_gonderildi': {
      const po = R.pendingOffer(p)!;
      return <StepBox tone="blue" icon="clock" title={R.creatorOf(db, po.creatorId)!.name + ' yanıtı bekleniyor'} text={`Teklif ${fmtDateTime(po.date)} tarihinde gönderildi (${tl(po.fee)}/video). Son yanıt tarihi: ${fmtDate(po.expires)}.`}
        actions={<><AsyncButton className="btn btn-ghost" onRun={async () => { await api.adminWithdrawOffer(p.id); toast('Teklif geri çekildi', 'info'); }}>Teklifi geri çek</AsyncButton>
          <button className="btn btn-ghost" onClick={open(<OfferModal pid={p.id} />)}>Başka içerik üreticisine gönder</button></>} />;
    }
    case 'kesinlestirme':
      return <StepBox tone="orange" icon="calendar" title="Teslim tarihini belirleyip projeyi kesinleştirin" text={`${c!.name} teklifi kabul etti. Kesinleştirdiğinizde markanın video hakkı kullanılır ve taraflara bildirim gider.`}
        actions={<button className="btn btn-primary" onClick={open(<ConfirmModal pid={p.id} />)}>Kesinleştir</button>} />;
    case 'kargo':
      return p.shipping.status === 'kargoda'
        ? <StepBox tone="blue" icon="truck" title="Ürün kargoda" text={`${p.shipping.carrier} · ${p.shipping.tracking}. İçerik üreticisi teslim aldığını işaretlediğinde çekim başlar.`}
            actions={<AsyncButton className="btn btn-ghost" onRun={async () => { await api.creatorReceived(p.id); toast('Ürün teslim alındı, proje çekim aşamasında'); }}>Teslim alındı olarak işaretle</AsyncButton>} />
        : <StepBox tone="gray" icon="package" title="Markanın ürünü kargolaması bekleniyor" text="Marka kargo takip numarasını girdiğinde içerik üreticisine bildirim gider."
            actions={<button className="btn btn-ghost" onClick={open(<ShipModal pid={p.id} />)}>Kargo bilgisini gir</button>} />;
    case 'uretimde':
      return <StepBox tone="violet" icon="video" title="İçerik üreticisi çekimde" text={<>Teslim tarihi {fmtDateLong(p.deadline)} ({relDays(p.deadline)}).{R.isLate(p) && <> <b className="red">Teslim gecikti.</b> İçerik üreticisiyle iletişime geçin veya tarihi güncelleyin.</>}</>}
        actions={<button className="btn btn-ghost" onClick={open(<DeadlineModal pid={p.id} />)}>Teslim tarihini değiştir</button>} />;
    case 'teslim': {
      const ak = p.videos.filter((v) => v.status === 'admin_kontrol');
      if (ak.length) return <StepBox tone="orange" icon="shield" title={ak.length + ' video ön kontrol bekliyor'} text="Videoyu brief’e uygunluk açısından kontrol edin; uygunsa markaya iletin, değilse notla içerik üreticisine geri gönderin."
        actions={<button className="btn btn-primary" onClick={() => openAdminVideo(p.id, ak[0].no)}>Kontrol et</button>} />;
      const full = p.videos.some((v) => v.status === 'revize' && v.revisions.length >= R.revisionLimit(db, p));
      return <StepBox tone="gray" icon="clock" title={R.nextActor(p) === 'brand' ? 'Marka onayı bekleniyor' : 'İçerik üreticisinin yüklemesi bekleniyor'}
        text={p.videos.map((v) => `Video ${v.no}: ${VIDEO_STATUS[v.status].label}`).join(' · ')}
        actions={<>{full && <AsyncButton className="btn btn-ghost" onRun={async () => { await api.adminGrantRevision(p.id); toast('Ek revize hakkı tanımlandı'); }}>+1 ek revize hakkı</AsyncButton>}
          <button className="btn btn-ghost" onClick={open(<DeadlineModal pid={p.id} />)}>Teslim tarihini değiştir</button></>} />;
    }
    case 'tamamlandi':
      return <StepBox tone="green" icon="check-circle" title="Proje tamamlandı" text={`Tüm videolar ${fmtDateLong(p.completedAt)} tarihinde onaylandı. Hak ediş: ${PAYOUT_STATUS[p.payout.status].label}.`}
        actions={p.payout.status === 'odenecek' && <AsyncButton className="btn btn-success" onRun={async () => { await api.markPayoutPaid(p.id); toast('Hak ediş ödendi olarak işaretlendi', 'success', 'İçerik üreticisi bilgilendirildi.'); }}>Hak edişi ödendi işaretle</AsyncButton>} />;
    case 'iptal':
      return <StepBox tone="red" icon="ban" title="Proje iptal edildi" text="Video hakkı markaya iade edildi." />;
    default: return null;
  }
}

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const db = useDb();
  const p = R.projectOf(db, id);
  useCrumbs([{ t: 'Projeler', h: '/admin/projeler' }, { t: p?.no || 'Proje' }]);
  if (!p) return <div className="page"><EmptyState icon="folder" title="Proje bulunamadı" action={<Link className="btn btn-dark" href="/admin/projeler">Projelere dön</Link>} /></div>;
  const b = R.brandOf(db, p.brandId); const c = R.creatorOf(db, p.creatorId); const o = R.orderOf(db, p.orderId)!; const pk = R.pkgOfProject(db, p)!;
  const late = R.isLate(p);
  const canRevise = p.videos.some((v) => v.revisions.length >= R.revisionLimit(db, p));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="row-sm row-wrap"><span className="muted small">{p.no}</span><StatusBadge map={PROJECT_STATUS} value={p.status} />{late && <Badge tone="red">{relDays(p.deadline)}</Badge>}</div>
          <h1 className="mt-8">{p.title}</h1><p className="sub">{b.name} · {p.product} · {p.videoCount} video</p>
        </div>
        {isActive(p.status) && <div className="actions">
          <Dropdown className="btn btn-ghost" label="İşlemler" trigger={<><Icon name="more" size={16} />İşlemler</>}>
            {(close) => (<>
              {p.deadline && <button onClick={() => { close(); openModal(<DeadlineModal pid={p.id} />); }}><Icon name="calendar" size={16} />Teslim tarihini değiştir</button>}
              {canRevise && <button onClick={async () => { close(); await api.adminGrantRevision(p.id); toast('Ek revize hakkı tanımlandı'); }}><Icon name="revise" size={16} />+1 ek revize hakkı</button>}
              <Link href={'/admin/markalar/' + b.id} onClick={close}><Icon name="building" size={16} />Marka sayfası</Link>
              <div className="menu-sep" />
              <button style={{ color: 'var(--red)' }} onClick={() => { close(); openModal(<CancelModal pid={p.id} />); }}><Icon name="ban" size={16} />Projeyi iptal et</button>
            </>)}
          </Dropdown>
        </div>}
      </div>

      <div className="layout-2 wide-side">
        <div className="stack-lg">
          <NextStep db={db} p={p} />
          <div className="card">
            <div className="card-head"><div><h3>Videolar</h3><div className="sub">Revize hakkı: video başına {R.revisionLimit(db, p)}{p.extraRevisions ? ` (+${p.extraRevisions} ek)` : ''}</div></div></div>
            {p.videos.map((v) => (
              <div key={v.no} className="video-row">
                {v.versions.length ? <button className="unstyled-btn" onClick={() => openAdminVideo(p.id, v.no)}><VideoThumb tone={c?.tone || 0} format={v.format} small /></button> : <EmptyThumb />}
                <div><VideoInfo p={p} v={v} mode="admin" /></div>
                <div className="vr-actions">
                  {v.status === 'admin_kontrol' ? <button className="btn btn-dark btn-sm" onClick={() => openAdminVideo(p.id, v.no)}>Kontrol et</button>
                    : v.versions.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => openAdminVideo(p.id, v.no)}><Icon name="play" size={12} /> İzle</button>}
                </div>
              </div>
            ))}
          </div>
          <div className="card"><div className="card-head"><h3>Brief</h3><span className="xs muted-2">Gönderim: {fmtDateTime(p.createdAt)}</span></div><div className="card-body"><BriefDetails p={p} b={R.briefOf(db, p)} /></div></div>
          {p.offers.length > 0 && (
            <div className="card"><div className="card-head"><h3>Teklif geçmişi</h3></div>
              <div className="table-wrap"><table className="table"><thead><tr><th>İçerik Üreticisi</th><th>Ücret</th><th>Gönderim</th><th>Durum</th></tr></thead>
                <tbody>{p.offers.slice().reverse().map((of, i) => (
                  <tr key={i}><td><div className="row-sm"><Avatar c={R.creatorOf(db, of.creatorId)} size="sm" />{R.creatorOf(db, of.creatorId)!.name}</div>{of.reason && <div className="cell-sub">“{of.reason}”</div>}</td>
                    <td>{tl(of.fee)}/video</td><td>{fmtDate(of.date)}</td><td><StatusBadge map={OFFER_STATUS} value={of.status} /></td></tr>
                ))}</tbody></table></div>
            </div>
          )}
        </div>
        <div className="stack-lg sticky-side">
          <div className="card"><div className="card-head"><h3>Özet</h3></div><div className="card-body"><dl className="kv" style={{ gridTemplateColumns: '120px 1fr' }}>
            <dt>Marka</dt><dd><Link className="btn-link" href={'/admin/markalar/' + b.id}>{b.name}</Link></dd>
            <dt>Sipariş</dt><dd>{o.no} · {pk.name}</dd>
            <dt>İstenen teslim</dt><dd>{fmtDate(p.requestedDeadline)}</dd>
            <dt>Kesin teslim</dt><dd>{p.deadline ? <span className={late ? 'red' : ''}>{fmtDateLong(p.deadline)}</span> : <span className="muted-2">Kesinleşmedi</span>}</dd>
            <dt>Kargo</dt><dd><StatusBadge map={SHIPPING_STATUS} value={p.shipping.status} />{p.shipping.tracking && <div className="xs muted mt-8">{p.shipping.carrier} · {p.shipping.tracking}</div>}</dd>
            <dt>İçerik Üreticisi ücreti</dt><dd>{p.fee ? <>{tl(p.fee)} × {p.videoCount} = <b>{tl(p.fee * p.videoCount)}</b></> : '—'}</dd>
            <dt>Hak ediş</dt><dd><StatusBadge map={PAYOUT_STATUS} value={p.payout.status} /></dd>
          </dl></div></div>
          <div className="card"><div className="card-head"><h3>İçerik Üreticisi</h3></div><div className="card-body">
            {c ? (
              <div className="row"><Avatar c={c} size="lg" />
                <div className="grow"><b className="strong">{c.name}</b><div className="small muted">{c.city} · {c.cats.join(', ')}</div><div className="small muted"><Icon name="star-fill" size={11} /> {rating(c.rating)} · %{c.onTime} zamanında</div></div>
                <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="admin" />)}>Profil</button></div>
            ) : (
              <><p className="small muted mb-8">Markanın tercih sırası:</p>
                {p.preferred.map((pid, i) => { const pc = R.creatorOf(db, pid)!; return (
                  <div key={pid} className="row" style={{ padding: '6px 0' }}><span className="xs strong" style={{ width: 14 }}>{i + 1}</span><Avatar c={pc} size="sm" /><span className="grow small strong">{pc.name}</span><Badge tone={availTone(pc.avail)}>{pc.avail}</Badge></div>
                ); })}
                {!p.preferred.length && <p className="small">Marka tercih iletmedi; değerlendirme COUGC ekibinde.</p>}
                {!!p.selection?.recommended.length && <><p className="small muted mt-12 mb-8">COUGC önerileri:</p>
                  {p.selection.recommended.map((pid) => { const pc = R.creatorOf(db, pid)!; return (
                    <div key={pid} className="row" style={{ padding: '6px 0' }}><Avatar c={pc} size="sm" /><span className="grow small strong">{pc.name}</span>{p.selection?.finalCreatorId === pid && <Badge tone="green">Seçildi</Badge>}</div>
                  ); })}</>}
                {p.selection?.meetingAt && <p className="xs muted mt-8"><Icon name="calendar" size={12} /> Görüşme: {fmtDateLong(p.selection.meetingAt)}</p>}</>
            )}
          </div></div>
          <div className="card"><div className="card-head"><h3>Zaman çizelgesi</h3></div><div className="card-body"><Timeline events={p.events} /></div></div>
        </div>
      </div>
    </div>
  );
}
