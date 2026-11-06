'use client';
/* İçerik Üreticisi paneli bileşenleri ve hesaplamaları */
import Link from 'next/link';
import { useState } from 'react';
import type { Db, Project } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { ACTIVE_STATUSES } from '@/lib/domain/status';
import { fmtDate, fmtDateLong, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { CREATOR_ID } from '@/lib/store/demo-store';
import { closeModal, toast } from '@/lib/store/ui-store';
import { Icon, type IconName } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Badge } from '@/components/ui/primitives';
import { Modal, useBusy } from '@/components/ui/interactive';

export function earnings(db: Db) {
  const ps = R.projectsOfCreator(db, CREATOR_ID);
  const sum = (fn: (p: Project) => boolean) => ps.filter(fn).reduce((s, p) => s + p.fee * p.videoCount, 0);
  return {
    paid: sum((p) => p.payout.status === 'odendi'),
    due: sum((p) => p.payout.status === 'odenecek'),
    expected: sum((p) => p.payout.status === 'olusmadi' && ACTIVE_STATUSES.includes(p.status))
  };
}

export interface Todo { p: Project; icon: IconName; t: string; title: string; cta: string; href?: string; received?: boolean }
export function todos(db: Db): Todo[] {
  const out: Todo[] = [];
  R.projectsOfCreator(db, CREATOR_ID).forEach((p) => {
    if (p.status === 'kargo' && p.shipping.status === 'kargoda') out.push({ p, icon: 'package', t: 't-blue', title: 'Ürün yolda — teslim alınca işaretleyin', cta: 'Teslim aldım', received: true });
    p.videos.forEach((v) => {
      const href = `/icerik-uretici/yukle/${p.id}/${v.no}`;
      if (v.status === 'revize') out.push({ p, icon: 'revise', t: 't-orange', title: `Video ${v.no} · revize talebi`, cta: 'Revize yükle', href });
      else if (v.status === 'bekleniyor' && v.adminNote) out.push({ p, icon: 'alert', t: 't-amber', title: `Video ${v.no} · COUGC düzeltme istedi`, cta: 'Yeniden yükle', href });
      else if (v.status === 'bekleniyor' && p.status !== 'kargo' && p.status !== 'kesinlestirme') out.push({ p, icon: 'upload', t: '', title: `Video ${v.no} · yükleme bekleniyor`, cta: 'Yükle', href });
    });
  });
  return out;
}

export function OfferCard({ db, p }: { db: Db; p: Project }) {
  const b = R.brandOf(db, p.brandId);
  const of = p.offers.find((o) => o.creatorId === CREATOR_ID && o.status === 'pending')!;
  return (
    <Link className="offer-card card-link" href={'/icerik-uretici/teklifler/' + p.id}>
      <div className="oc-top"><BrandLogo b={b} /><div className="grow" style={{ minWidth: 0 }}><b className="strong">{b.name}</b><div className="small muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div></div><Badge tone="blue">Yeni</Badge></div>
      <div className="oc-grid"><div><small>Ücret</small><b>{tl(of.fee * p.videoCount)}</b></div><div><small>Video</small><b>{p.videoCount} × {p.videos[0].format}</b></div><div><small>Teslim</small><b>{fmtDate(p.requestedDeadline)}</b></div></div>
      <div className="row between small"><span className="muted"><Icon name="clock" size={13} /> Yanıt için son gün: {fmtDate(of.expires)}</span><span className="btn-link">Detay <Icon name="chevron-right" size={14} /></span></div>
    </Link>
  );
}

export function receivedAction(pid: string) {
  return async () => { await api.creatorReceived(pid); toast('Ürünü teslim aldınız', 'success', 'Çekime başlayabilirsiniz. Marka bilgilendirildi.'); };
}

export function AcceptModal({ db, p, onDone }: { db: Db; p: Project; onDone: () => void }) {
  const [ok, setOk] = useState(true); const [busy, wrap] = useBusy();
  const of = R.pendingOffer(p)!;
  return (
    <Modal title="Teklifi kabul et" sub={`${p.title} · ${R.brandOf(db, p.brandId).name}`} footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button>
      <button className={'btn btn-primary' + (busy ? ' is-loading' : '')} disabled={busy} onClick={async () => {
        if (!ok) { toast('Onay kutusunu işaretleyin', 'error'); return; }
        if (await wrap(() => api.creatorRespond(p.id, true))) { closeModal(); onDone(); toast('Teklifi kabul ettiniz', 'success', 'COUGC teslim tarihini kesinleştirdiğinde bildirim alacaksınız.'); }
      }}>{busy ? <><span className="spinner" />Gönderiliyor…</> : 'Kabul et'}</button></>}>
      <div className="stack">
        <div className="summary-list"><div><span>Video</span><b>{p.videoCount} adet</b></div><div><span>İstenen teslim</span><b>{fmtDateLong(p.requestedDeadline)}</b></div><div><span>Toplam ücret</span><b>{tl(of.fee * p.videoCount)}</b></div></div>
        <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span className="small">Brief’i okudum; istenen tarihte teslim edebileceğimi ve <Link className="btn-link" href="/yasal" onClick={closeModal}>içerik üreticisi sözleşmesi</Link> koşullarını onaylıyorum.</span></label>
      </div>
    </Modal>
  );
}

const REASONS = ['Tarih uygun değil', 'Kategori bana uygun değil', 'Ücret uygun değil', 'Ürünü kullanmak istemiyorum'];
export function RejectModal({ pid, onDone }: { pid: string; onDone: () => void }) {
  const [why, setWhy] = useState(''); const [note, setNote] = useState(''); const [err, setErr] = useState(false);
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Teklifi reddet" sub="Gerekçeniz yalnızca COUGC ekibiyle paylaşılır." footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button>
      <button className={'btn btn-danger-ghost' + (busy ? ' is-loading' : '')} disabled={busy} onClick={async () => {
        if (!note.trim()) { setErr(true); return; }
        if (await wrap(() => api.creatorRespond(pid, false, (why ? why + ': ' : '') + note.trim()))) { closeModal(); onDone(); toast('Teklif reddedildi', 'info', 'COUGC ekibi bilgilendirildi.'); }
      }}>{busy ? <><span className="spinner" />Gönderiliyor…</> : 'Teklifi reddet'}</button></>}>
      <div className="stack">
        <div className="choices">{REASONS.map((t) => <label key={t} className="choice"><input type="radio" name="why" checked={why === t} onChange={() => setWhy(t)} /><span>{t}</span></label>)}</div>
        <div className={'field' + (err ? ' has-error' : '')}><label>Açıklama <span className="req">*</span></label>
          <textarea className="input" value={note} onChange={(e) => { setNote(e.target.value); setErr(false); }} placeholder="Kısaca açıklayın" /><span className="err">Gerekçe zorunludur.</span></div>
      </div>
    </Modal>
  );
}
