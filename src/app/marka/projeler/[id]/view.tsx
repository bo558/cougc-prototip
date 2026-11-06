'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { ProjectStatus } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { PREFERENCE_STATUS, PROJECT_STATUS, SHIPPING_STATUS, VIDEO_STATUS } from '@/lib/domain/status';
import { fmtDate, fmtDateLong, fmtDateTime } from '@/lib/format';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { openModal } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar, EmptyThumb, VideoThumb } from '@/components/ui/media';
import { Badge, Callout, EmptyState, StatusBadge, Timeline } from '@/components/ui/primitives';
import { MiniStepper, openBrandVideo } from '@/components/brand/parts';
import { BriefDetails, ShipModal } from '@/components/shared/project';
import { CreatorProfileModal } from '@/components/shared/creator';
import { downloadToast } from '@/components/shared/video';

export default function BrandProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const isNew = !!useSearchParams().get('yeni');
  const db = useDb();
  const [briefOpen, setBriefOpen] = useState(false);
  const p = R.projectOf(db, id);
  useCrumbs([{ t: 'Projelerim', h: '/marka/projeler' }, { t: p?.title || 'Proje' }]);
  if (!p || p.brandId !== BRAND_ID) return <div className="page"><EmptyState icon="lock" title="Bu projeye erişiminiz yok" text="Yalnızca kendi şirketinizin projelerini görüntüleyebilirsiniz." action={<Link className="btn btn-dark" href="/marka/projeler">Projelerime dön</Link>} /></div>;
  const c = R.creatorOf(db, p.creatorId); const limit = R.revisionLimit(db, p); const pk = R.pkgOfProject(db, p)!;
  const review = p.videos.filter((v) => v.status === 'marka_inceleme');
  const assigning = (['admin_incelemesi', 'teklif_gonderildi', 'kesinlestirme'] as ProjectStatus[]).includes(p.status);
  const sel = p.selection;
  const finalC = R.creatorOf(db, sel?.finalCreatorId);
  const prefs = db.preferences.filter((x) => x.projectId === p.id);
  const reviewText = finalC ? finalC.name + ' görüşmede seçildi. COUGC ekibi teklif sürecini başlatacak.'
    : sel?.meetingAt ? 'İçerik üreticisi görüşmeniz ' + fmtDateLong(sel.meetingAt) + ' için planlandı. Nihai seçim bu görüşmede belirlenecek.'
    : sel?.recommended.length ? 'COUGC ekibi içerik üreticisi önerilerini paylaştı. Nihai seçim birlikte yapacağımız görüşmede belirlenecek.'
    : 'Briefiniz ve tercihleriniz COUGC ekibi tarafından değerlendiriliyor. Uygun içerik üreticileri size önerilecek.';
  const statusText: Record<ProjectStatus, string> = {
    taslak: '', admin_incelemesi: reviewText,
    teklif_gonderildi: 'İçerik üreticisi seçimi sonuçlanıyor. İçerik üreticisi kabul ettiğinde COUGC teslim tarihini kesinleştirecek.',
    kesinlestirme: 'İçerik üreticisi seçimi sonuçlanıyor. Teslim tarihi kısa süre içinde kesinleşecek.',
    kargo: p.shipping.status === 'kargoda' ? 'Ürününüz kargoda. İçerik üreticisi teslim aldığında çekim başlayacak.' : 'İçerik üreticiniz hazır. Ürünü kargoladığınızda çekim süreci başlar.',
    uretimde: 'İçerik üreticisi çekim yapıyor. Video yüklendiğinde önce COUGC kalite kontrolünden geçer, ardından size iletilir.',
    teslim: 'Videolar hazırlanıyor ve inceleniyor.', tamamlandi: 'Tüm videolar onaylandı. Final dosyalarınızı indirebilirsiniz.',
    iptal: 'Bu proje iptal edildi; video hakkınız hesabınıza iade edildi.'
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><div className="row-sm"><span className="muted small">{p.no}</span><StatusBadge map={PROJECT_STATUS} value={p.status} mode="brand" /></div>
          <h1 className="mt-8">{p.title}</h1><p className="sub">{p.product} · {p.videoCount} video · {pk.name} paketi</p></div>
        {p.status === 'tamamlandi' && <div className="actions"><button className="btn btn-primary" onClick={downloadToast}><Icon name="download" size={15} />Tümünü indir</button></div>}
      </div>
      {isNew && <Callout tone="green" icon="check-circle" className="mb-24"><b>Briefiniz gönderildi.</b> COUGC ekibi briefinizi ve tercihlerinizi değerlendirip uygun içerik üreticilerini size önerecek; nihai seçim birlikte yapacağımız görüşmede belirlenecek. Gelişmeleri bildirim ve e-posta ile alacaksınız.</Callout>}
      {review.length > 0 && <Callout tone="orange" icon="play" className="mb-24"><div className="row between row-wrap"><span><b>{review.length} video onayınızı bekliyor.</b> Önizleyip onaylayabilir veya gerekçeli revize isteyebilirsiniz.</span>
        <button className="btn btn-primary btn-sm" onClick={() => openBrandVideo(p.id, review[0].no)}>İncele</button></div></Callout>}
      {p.status === 'kargo' && p.shipping.status === 'bekleniyor' && <Callout tone="orange" icon="truck" className="mb-24"><div className="row between row-wrap"><span><b>Ürünü kargolayın.</b> Takip numarasını girdiğinizde içerik üreticisine bildirim gider.</span>
        <button className="btn btn-primary btn-sm" onClick={() => openModal(<ShipModal pid={p.id} />)}>Kargo bilgisi gir</button></div></Callout>}
      <div className="card mb-24"><div className="card-body"><MiniStepper p={p} /><p className="small muted mt-16">{statusText[p.status]}</p></div></div>

      <div className="layout-2">
        <div className="stack-lg">
          <div className="card"><div className="card-head"><div><h3>Videolar</h3><div className="sub">Video başına {limit} revize hakkı</div></div></div>
            {p.videos.map((v) => {
              const ready = v.versions.length > 0 && ['marka_inceleme', 'onaylandi', 'revize'].includes(v.status);
              const last = v.versions[v.versions.length - 1];
              return (
                <div key={v.no} className="video-row">
                  {ready ? <button className="unstyled-btn" onClick={() => openBrandVideo(p.id, v.no)}><VideoThumb tone={c?.tone || 0} format={v.format} small /></button> : <EmptyThumb />}
                  <div><div className="row-sm row-wrap"><b className="strong">Video {v.no}</b><span className="tag">{v.format}</span><StatusBadge map={VIDEO_STATUS} value={v.status} mode="brand" /></div>
                    <div className="small muted mt-8">{ready ? `Sürüm v${v.versions.length} · ${fmtDateTime(last.date)}` : v.status === 'admin_kontrol' ? 'Video yüklendi, COUGC kalite kontrolünde' : 'İçerik üreticisi hazırlıyor'} · {limit - v.revisions.length} revize hakkı kaldı</div>
                    {v.status === 'revize' && <Callout tone="orange" icon="revise" className="small mt-8"><b>Revize talebiniz iletildi:</b> {v.revisions[v.revisions.length - 1].reason}</Callout>}</div>
                  <div className="vr-actions">
                    {v.status === 'marka_inceleme' && <button className="btn btn-primary btn-sm" onClick={() => openBrandVideo(p.id, v.no)}><Icon name="play" size={12} /> İncele</button>}
                    {v.status === 'onaylandi' && <><button className="btn btn-ghost btn-sm" onClick={() => openBrandVideo(p.id, v.no)}>İzle</button><button className="btn btn-dark btn-sm" onClick={downloadToast}><Icon name="download" size={14} />İndir</button></>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card"><div className="card-head"><h3>Brief</h3><button className="btn-link small" onClick={() => setBriefOpen((o) => !o)}>{briefOpen ? 'Daralt' : 'Tümünü göster'}</button></div>
            <div className="card-body" style={{ maxHeight: briefOpen ? 'none' : 260, overflow: 'hidden', position: 'relative' }}>
              <BriefDetails p={p} b={R.briefOf(db, p)} />
              {!briefOpen && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: 'linear-gradient(transparent,#fff)' }} />}
            </div></div>
        </div>
        <div className="stack-lg">
          <div className="card"><div className="card-head"><h3>İçerik Üreticisi</h3></div><div className="card-body">
            {c && !assigning ? (
              <div className="row"><Avatar c={c} size="lg" /><div className="grow"><b className="strong">{c.name}</b><div className="small muted">{c.cats.join(', ')} · {c.city}</div></div>
                <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="brand" />)}>Profil</button></div>
            ) : (
              <div className="stack-sm">
                <p className="small muted">Nihai seçim COUGC ekibiyle yapacağınız görüşmede belirlenir.</p>
                <div className="label">Tercihleriniz</div>
                {p.preferred.length ? p.preferred.map((pid, i) => {
                  const pr = prefs.find((x) => x.creatorId === pid);
                  return <div key={pid} className="row" style={{ padding: '4px 0' }}><span className="xs strong">{i + 1}</span><Avatar c={R.creatorOf(db, pid)} size="sm" /><span className="small strong grow">{R.creatorOf(db, pid)!.name}</span>{pr && <StatusBadge map={PREFERENCE_STATUS} value={pr.status} mode="brand" />}</div>;
                }) : <p className="small">Değerlendirmeyi COUGC ekibine bıraktınız.</p>}
                {!!sel?.recommended.length && <>
                  <div className="label mt-8">COUGC önerileri</div>
                  {sel.recommended.map((cid) => { const rc = R.creatorOf(db, cid)!; return (
                    <div key={cid} className="row" style={{ padding: '4px 0' }}><Avatar c={rc} size="sm" /><span className="small strong grow">{rc.name}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={cid} role="brand" />)}>Profil</button></div>
                  ); })}
                </>}
                {sel?.meetingAt && <Callout icon="calendar" className="small mt-8"><b>Görüşme:</b> {fmtDateLong(sel.meetingAt)}{sel.meetingNote && <> · {sel.meetingNote}</>}</Callout>}
                {finalC && <div className="row-sm mt-8"><Badge tone="green">Görüşmede seçildi</Badge><b className="strong small">{finalC.name}</b></div>}
              </div>
            )}
          </div></div>
          <div className="card"><div className="card-body"><dl className="kv" style={{ gridTemplateColumns: '120px 1fr' }}>
            <dt>Teslim tarihi</dt><dd>{p.deadline ? fmtDateLong(p.deadline) : <><span className="muted">Kesinleşecek</span><div className="xs muted">İstenen: {fmtDate(p.requestedDeadline)}</div></>}</dd>
            <dt>Kargo</dt><dd><StatusBadge map={SHIPPING_STATUS} value={p.shipping.status} />{p.shipping.tracking && <div className="xs muted mt-8">{p.shipping.tracking}</div>}</dd>
            <dt>Onaylanan</dt><dd>{p.videos.filter((v) => v.status === 'onaylandi').length} / {p.videoCount} video</dd>
          </dl></div></div>
          <div className="card"><div className="card-head"><h3>Geçmiş</h3></div><div className="card-body"><Timeline events={p.events.filter((ev) => !['offer', 'reject', 'accept'].includes(ev.type))} /></div></div>
          <Callout icon="help" className="small">Sorunuz mu var? Proje ekibine <b>destek@cougc.demo</b> üzerinden ulaşın. <span className="muted">(Demo adres; prototipte e-posta gönderilmez.)</span></Callout>
        </div>
      </div>
    </div>
  );
}
