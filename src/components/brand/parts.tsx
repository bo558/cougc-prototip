'use client';
/* Marka paneli bileşenleri */
import Link from 'next/link';
import { useState } from 'react';
import type { Db, Project, Video } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { PROJECT_STATUS } from '@/lib/domain/status';
import { fmtDate, fmtDateLong } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { closeModal, openModal, toast } from '@/lib/store/ui-store';
import { Icon, Star } from '@/components/ui/Icon';
import { Avatar, VideoThumb } from '@/components/ui/media';
import { Badge, Callout, EmptyState, StatusBadge } from '@/components/ui/primitives';
import { AsyncButton, Modal, useBusy } from '@/components/ui/interactive';
import { MeterCells } from '@/components/layout/PanelShell';
import { downloadToast, VideoModal } from '@/components/shared/video';

const STEPS = ['Brief', 'İçerik Üreticisi seçimi', 'Ürün & çekim', 'İnceleme', 'Teslim'];
export function MiniStepper({ p }: { p: Project }) {
  const cur = R.brandStep(p);
  return <div className="stepper">{STEPS.map((s, i) => <div key={s} className={'st ' + (i < cur ? 'done' : i === cur ? 'cur' : '')}><span>{s}</span></div>)}</div>;
}

export function CreditCard({ c, compact }: { c: R.Credits; compact?: boolean }) {
  return (
    <div className="credit-card"><Star />
      <div className="lbl">Kalan video hakkı</div>
      <div className="row" style={{ alignItems: 'flex-end', gap: 10, marginTop: 6 }}><span className="big">{c.available}</span><span className="lbl" style={{ paddingBottom: 8 }}>/ {c.total} video</span></div>
      <div className="meter mt-16"><MeterCells c={c} /></div>
      <div className="row mt-12 xs" style={{ gap: 16, color: 'rgba(255,255,255,.6)' }}><span>{c.used} kullanıldı</span><span>{c.reserved} rezerve</span><span>{c.available} kullanılabilir</span></div>
      {!compact && <div className="row row-wrap mt-24"><Link className="btn btn-primary" href="/marka/yeni-proje"><Icon name="plus" size={15} />Yeni proje başlat</Link><Link className="btn" style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }} href="/marka/paketler">Paketler</Link></div>}
    </div>
  );
}

export function ProjectCard({ db, p }: { db: Db; p: Project }) {
  const c = R.creatorOf(db, p.creatorId);
  return (
    <Link className="card card-link" href={'/marka/projeler/' + p.id} style={{ display: 'block' }}><div className="card-body stack">
      <div className="row between row-wrap">
        <div className="row" style={{ minWidth: 0 }}>{c ? <Avatar c={c} /> : <span className="avatar"><Icon name="users" size={16} /></span>}
          <div style={{ minWidth: 0 }}><div className="strong" style={{ fontSize: 15 }}>{p.title}</div><div className="small muted">{p.no} · {p.videoCount} video · {c ? c.name : 'İçerik Üreticisi seçimi sürüyor'}</div></div></div>
        <div className="row-sm">{R.needsBrand(p) && <Badge tone="orange">Aksiyon bekliyor</Badge>}<StatusBadge map={PROJECT_STATUS} value={p.status} mode="brand" /></div>
      </div>
      <MiniStepper p={p} />
      <div className="row between small muted">
        <span>{p.deadline ? <><Icon name="calendar" size={14} /> Teslim {fmtDateLong(p.deadline)}</> : 'İstenen teslim ' + fmtDateLong(p.requestedDeadline)}</span>
        <span>{p.videos.filter((v) => v.status === 'onaylandi').length}/{p.videoCount} video onaylandı</span>
      </div>
    </div></Link>
  );
}

export function DeliveryItem({ db, p, v }: { db: Db; p: Project; v: Video }) {
  const c = R.creatorOf(db, p.creatorId)!;
  return (
    <div className="dl-item">
      <button className="unstyled-btn" onClick={() => openBrandVideo(p.id, v.no)}><VideoThumb tone={c.tone} format={v.format} meta={v.format} meta2={v.versions[v.versions.length - 1].dur} /></button>
      <div><div className="dl-t">{p.title} · V{v.no}</div><div className="dl-s">{c.name} · {fmtDate(v.approvedAt)}</div></div>
      <button className="btn btn-ghost btn-sm" onClick={downloadToast}><Icon name="download" size={14} />İndir</button>
    </div>
  );
}

export function LockedCard() {
  return <div className="card"><EmptyState icon="lock" title="İçerik üreticilerini incelemek için video hakkı gerekli" text="Video hakkınız tanımlandıktan sonra içerik üreticisi vitrini ve brief formu açılır." action={<Link className="btn btn-primary" href="/marka/paketler">Paketleri gör</Link>} /></div>;
}

// ---------- Video inceleme, onay ve revize ----------
function BrandVideoModal({ pid, no }: { pid: string; no: number }) {
  const db = useDb(); const p = R.projectOf(db, pid)!; const v = p.videos.find((x) => x.no === no)!;
  const left = R.revisionLimit(db, p) - v.revisions.length;
  const actions = v.status === 'marka_inceleme' ? <>
    <button className="btn btn-ghost" disabled={left <= 0} title={left <= 0 ? 'Revize hakkınız doldu' : undefined} onClick={() => openModal(<RevisionModal pid={pid} no={no} />)}><Icon name="revise" size={15} />Revize iste ({left} hak)</button>
    <button className="btn btn-success" onClick={() => openModal(<ApproveModal pid={pid} no={no} />)}><Icon name="check" size={15} />Onayla</button>
  </> : v.status === 'onaylandi'
    ? <><button className="btn btn-ghost" onClick={closeModal}>Kapat</button><button className="btn btn-dark" onClick={downloadToast}><Icon name="download" size={15} />Final dosyayı indir</button></>
    : <button className="btn btn-ghost" onClick={closeModal}>Kapat</button>;
  return <VideoModal p={p} v={v} mode="brand" actions={actions} extra={v.status === 'marka_inceleme' && (
    <Callout className="small">Önizleme filigranlıdır. Onayladığınızda final dosya filigransız olarak indirilebilir olur.{left <= 0 && <> <b>Revize hakkınız doldu;</b> ek revize için COUGC ile iletişime geçin.</>}</Callout>
  )} />;
}
export const openBrandVideo = (pid: string, no: number) => openModal(<BrandVideoModal pid={pid} no={no} />);

function ApproveModal({ pid, no }: { pid: string; no: number }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const last = p.videos.filter((v) => v.status !== 'onaylandi').length === 1;
  return (
    <Modal title={`Video ${no}’i onayla`} sub={p.title} footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button>
      <AsyncButton className="btn btn-success" busyLabel="Onaylanıyor…" onRun={async () => {
        const r = await api.brandApprove(pid, no); closeModal();
        toast(r.status === 'tamamlandi' ? 'Proje tamamlandı' : 'Video onaylandı', 'success', r.status === 'tamamlandi' ? 'Final dosyalarınız Teslimatlar bölümünde.' : 'Final dosya indirilebilir.');
      }}>Onayla</AsyncButton></>}>
      <Callout tone="green" icon="check-circle">Onayladığınızda final dosya indirilebilir olur, bu video için revize talep edilemez{last && <> ve <b>proje tamamlanır</b></>}.</Callout>
    </Modal>
  );
}

const TOPICS = ['Ürün görünürlüğü', 'Kurgu / tempo', 'Ses / anlatım', 'Metin / altyazı', 'Işık / görüntü', 'Diğer'];
function RevisionModal({ pid, no }: { pid: string; no: number }) {
  const db = useDb(); const p = R.projectOf(db, pid)!; const v = p.videos.find((x) => x.no === no)!;
  const left = R.revisionLimit(db, p) - v.revisions.length;
  const [topics, setTopics] = useState<string[]>([]); const [reason, setReason] = useState(''); const [err, setErr] = useState(false);
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Revize talebi" sub={`${p.title} · Video ${no} · ${left} revize hakkınız var`} footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button>
      <button className={'btn btn-primary' + (busy ? ' is-loading' : '')} disabled={busy} onClick={async () => {
        if (!reason.trim()) { setErr(true); return; }
        const text = (topics.length ? '[' + topics.join(', ') + '] ' : '') + reason.trim();
        if (await wrap(() => api.brandRevise(pid, no, text))) { closeModal(); toast('Revize talebiniz iletildi', 'success', 'İçerik üreticisi ve COUGC bilgilendirildi.'); }
      }}>{busy ? <><span className="spinner" />Gönderiliyor…</> : 'Revize talebini gönder'}</button></>}>
      <div className="stack">
        <div className="field"><label>Konu</label><div className="choices">{TOPICS.map((t) => (
          <label key={t} className="choice"><input type="checkbox" checked={topics.includes(t)} onChange={(e) => setTopics(e.target.checked ? [...topics, t] : topics.filter((x) => x !== t))} /><span>{t}</span></label>
        ))}</div></div>
        <div className={'field' + (err ? ' has-error' : '')}><label>Revize gerekçesi <span className="req">*</span></label>
          <textarea className="input" value={reason} onChange={(e) => { setReason(e.target.value); setErr(false); }} placeholder="Neyin, nasıl değişmesini istiyorsunuz? Mümkünse saniye belirtin (örn. 0:05)." />
          <span className="err">İçerik üreticisinin doğru anlaması için gerekçe zorunludur.</span></div>
        <Callout tone="amber" className="small">Revize talebi brief kapsamında olmalıdır. Kapsam dışı değişiklikler (yeni senaryo, farklı ürün vb.) COUGC tarafından ayrıca değerlendirilir.</Callout>
      </div>
    </Modal>
  );
}
