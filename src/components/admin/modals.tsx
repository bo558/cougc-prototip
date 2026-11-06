'use client';
/* Admin işlem modalları */
import { useState } from 'react';
import * as R from '@/lib/domain/rules';
import { addDays, fmtDate, fmtDateLong, iso, TODAY, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { closeModal, openModal, toast } from '@/lib/store/ui-store';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/media';
import { Badge, Callout } from '@/components/ui/primitives';
import { AsyncButton, Modal, useBusy } from '@/components/ui/interactive';
import { VideoModal } from '@/components/shared/video';
import { availTone } from '@/components/shared/creator';

function SubmitBtn({ busy, form, children, cls = 'btn btn-primary' }: { busy: boolean; form: string; children: React.ReactNode; cls?: string }) {
  return <button type="submit" form={form} className={cls + (busy ? ' is-loading' : '')} disabled={busy}>{busy ? <><span className="spinner" />İşleniyor…</> : children}</button>;
}
const Cancel = () => <button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button>;

export function OfferModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const rejected = p.offers.filter((o) => o.status === 'rejected').map((o) => o.creatorId);
  const pool = db.creators.filter((c) => c.status === 'active' && c.visible).sort((a, b) => {
    const ia = p.preferred.indexOf(a.id), ib = p.preferred.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const finalId = p.selection?.finalCreatorId;
  const first = pool.find((c) => c.id === finalId) || pool.find((c) => !rejected.includes(c.id));
  const [sel, setSel] = useState(first?.id || '');
  const [fee, setFee] = useState(first?.fee || 2000);
  const [busy, wrap] = useBusy();
  return (
    <Modal size="lg" title="İçerik üreticisine teklif gönder" sub={`${p.title} · ${p.videoCount} video · istenen teslim ${fmtDate(p.requestedDeadline)}`}
      footer={<><Cancel /><SubmitBtn busy={busy} form="offerForm"><Icon name="send" size={15} />Teklifi gönder</SubmitBtn></>}>
      <form className="stack" id="offerForm" onSubmit={async (e) => {
        e.preventDefault();
        if (!sel) { toast('İçerik üreticisi seçin', 'error'); return; }
        const note = String(new FormData(e.currentTarget).get('note') || '');
        if (await wrap(() => api.adminSendOffer(pid, sel, fee, note))) {
          closeModal();
          toast('Teklif gönderildi', 'success', R.creatorOf(db, sel)!.name + ' bildirim aldı.' + (sel === 'c-zeynep' ? ' İçerik üreticisi panelinden yanıtlayabilirsiniz.' : ''));
        }
      }}>
        <div className="label">İçerik üreticisi seçin</div>
        <div className="stack-sm" style={{ maxHeight: 300, overflow: 'auto', padding: 2 }}>
          {pool.map((c) => {
            const pi = p.preferred.indexOf(c.id); const rj = rejected.includes(c.id);
            return (
              <label key={c.id} className="file-row" style={{ cursor: rj ? 'not-allowed' : 'pointer', opacity: rj ? 0.55 : 1 }}>
                <input type="radio" name="creator" checked={sel === c.id} disabled={rj} onChange={() => { setSel(c.id); setFee(c.fee); }} style={{ accentColor: 'var(--orange)' }} />
                <Avatar c={c} />
                <div className="grow"><div className="row-sm"><b className="strong small">{c.name}</b>{finalId === c.id && <Badge tone="green" dot={false}>Görüşmede seçildi</Badge>}{pi >= 0 && <Badge tone="orange" dot={false}>Marka tercihi #{pi + 1}</Badge>}{rj && <Badge tone="red">Reddetti</Badge>}</div>
                  <div className="xs muted">{c.cats.join(', ')} · {c.city} · %{c.onTime} zamanında</div></div>
                <Badge tone={availTone(c.avail)}>{c.avail}</Badge><span className="small strong mono" style={{ width: 70, textAlign: 'right' }}>{tl(c.fee)}</span>
              </label>
            );
          })}
        </div>
        <div className="grid-2">
          <div className="field"><label>Video başı içerik üreticisi ücreti</label><input className="input" type="number" value={fee} min={0} step={50} onChange={(e) => setFee(Number(e.target.value))} /><span className="hint">Markaya gösterilmez.</span></div>
          <div className="field"><label>Yanıt süresi</label><select className="input" name="exp"><option>3 gün</option><option>2 gün</option><option>1 gün</option></select></div>
        </div>
        <div className="field"><label>İçerik üreticisine not (isteğe bağlı)</label><textarea className="input" name="note" placeholder="Örn. ürün COUGC ofisinden kargolanacak." /></div>
      </form>
    </Modal>
  );
}

/** COUGC önerisi: marka tercihleri öne alınır; vitrin dışındaki içerik üreticileri de önerilebilir */
export function RecommendModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const rejected = p.offers.filter((o) => o.status === 'rejected').map((o) => o.creatorId);
  const pool = db.creators.filter((c) => c.status === 'active' && c.visible).sort((a, b) => {
    const ia = p.preferred.indexOf(a.id), ib = p.preferred.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const [ids, setIds] = useState<string[]>(p.selection?.recommended || []);
  const [busy, wrap] = useBusy();
  return (
    <Modal size="lg" title="Markaya içerik üreticisi önerin" sub={`${R.brandOf(db, p.brandId).name} · ${p.title}`}
      footer={<><Cancel /><SubmitBtn busy={busy} form="recForm">Markaya öner</SubmitBtn></>}>
      <form className="stack" id="recForm" onSubmit={async (e) => {
        e.preventDefault();
        if (!ids.length) { toast('En az bir içerik üreticisi seçin', 'error'); return; }
        if (await wrap(() => api.adminRecommend(pid, ids))) { closeModal(); toast('Öneriler markaya iletildi', 'success', 'Sıradaki adım: görüşme planlamak.'); }
      }}>
        <Callout className="small">Öneri kesin atama değildir. Nihai seçim markayla yapılacak görüşmede belirlenir.</Callout>
        <div className="stack-sm" style={{ maxHeight: 340, overflow: 'auto', padding: 2 }}>
          {pool.map((c) => {
            const pi = p.preferred.indexOf(c.id); const rj = rejected.includes(c.id);
            return (
              <label key={c.id} className="file-row" style={{ cursor: rj ? 'not-allowed' : 'pointer', opacity: rj ? 0.55 : 1 }}>
                <input type="checkbox" checked={ids.includes(c.id)} disabled={rj} onChange={(e) => setIds(e.target.checked ? [...ids, c.id] : ids.filter((x) => x !== c.id))} style={{ accentColor: 'var(--orange)', width: 18, height: 18 }} />
                <Avatar c={c} />
                <div className="grow"><div className="row-sm row-wrap"><b className="strong small">{c.name}</b>{pi >= 0 && <Badge tone="orange" dot={false}>Marka tercihi #{pi + 1}</Badge>}{rj && <Badge tone="red">Reddetti</Badge>}</div>
                  <div className="xs muted">{c.cats.join(', ')} · {c.city}</div></div>
                <Badge tone={availTone(c.avail)}>{c.avail}</Badge>
              </label>
            );
          })}
        </div>
      </form>
    </Modal>
  );
}

export function MeetingModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Görüşme planla" sub={`${R.brandOf(db, p.brandId).name} · ${p.title}`} footer={<><Cancel /><SubmitBtn busy={busy} form="meetForm">Kaydet</SubmitBtn></>}>
      <form className="stack" id="meetForm" onSubmit={async (e) => {
        e.preventDefault(); const f = new FormData(e.currentTarget);
        if (await wrap(() => api.adminScheduleMeeting(pid, String(f.get('date')), String(f.get('note') || '').trim()))) { closeModal(); toast('Görüşme kaydedildi', 'success', 'Marka bilgilendirildi.'); }
      }}>
        <div className="field"><label htmlFor="meet-date">Görüşme tarihi</label><input id="meet-date" className="input" type="date" name="date" defaultValue={p.selection?.meetingAt} min={iso(TODAY)} required /></div>
        <div className="field"><label htmlFor="meet-note">Not (isteğe bağlı)</label><input id="meet-note" className="input" name="note" defaultValue={p.selection?.meetingNote} placeholder="Örn. çevrim içi toplantı, 30 dakika" /></div>
        <p className="xs muted-2">Prototipte takvim daveti gönderilmez; görüşme COUGC ekibi tarafından ayrıca organize edilir.</p>
      </form>
    </Modal>
  );
}

export function MeetingResultModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const rejected = p.offers.filter((o) => o.status === 'rejected').map((o) => o.creatorId);
  const ids = p.selection?.recommended || [];
  const [sel, setSel] = useState(p.selection?.finalCreatorId || ids.find((x) => !rejected.includes(x)) || '');
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Görüşme sonucunu kaydedin" sub={`${R.brandOf(db, p.brandId).name} · ${p.title}`} footer={<><Cancel /><SubmitBtn busy={busy} form="resForm">Sonucu kaydet</SubmitBtn></>}>
      <form className="stack" id="resForm" onSubmit={async (e) => {
        e.preventDefault();
        if (!sel) { toast('İçerik üreticisi seçin', 'error'); return; }
        if (await wrap(() => api.adminSetFinalCreator(pid, sel))) { closeModal(); toast('Görüşme sonucu kaydedildi', 'success', 'Sıradaki adım: teklif göndermek.'); }
      }}>
        <div className="label">Görüşmede belirlenen içerik üreticisi</div>
        <div className="stack-sm">
          {ids.map((id) => { const c = R.creatorOf(db, id)!; const rj = rejected.includes(id); return (
            <label key={id} className="file-row" style={{ cursor: rj ? 'not-allowed' : 'pointer', opacity: rj ? 0.55 : 1 }}>
              <input type="radio" name="final" checked={sel === id} disabled={rj} onChange={() => setSel(id)} style={{ accentColor: 'var(--orange)' }} />
              <Avatar c={c} /><div className="grow"><div className="row-sm"><b className="strong small">{c.name}</b>{rj && <Badge tone="red">Reddetti</Badge>}</div><div className="xs muted">{c.cats.join(', ')} · {c.city}</div></div>
            </label>
          ); })}
        </div>
        <p className="xs muted-2">Görüşmede başka bir içerik üreticisi belirlendiyse önce “Önerileri düzenle” adımıyla listeye ekleyin.</p>
      </form>
    </Modal>
  );
}

export function ConfirmModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Projeyi kesinleştir" sub={`${p.title} · ${R.creatorOf(db, p.creatorId)?.name}`} footer={<><Cancel /><SubmitBtn busy={busy} form="confForm">Kesinleştir</SubmitBtn></>}>
      <form className="stack" id="confForm" onSubmit={async (e) => {
        e.preventDefault(); const d = String(new FormData(e.currentTarget).get('deadline'));
        if (await wrap(() => api.adminConfirm(pid, d))) { closeModal(); toast('Proje kesinleşti', 'success', 'Marka ve içerik üreticisi bilgilendirildi.'); }
      }}>
        <div className="field"><label>Kesin teslim tarihi</label><input className="input" type="date" name="deadline" defaultValue={p.requestedDeadline} min={iso(TODAY)} required />
          <span className="hint">Markanın istediği tarih: {fmtDateLong(p.requestedDeadline)}. Ürünün içerik üreticisine ulaşma süresini hesaba katın.</span></div>
        <Callout tone="orange">Kesinleştirildiğinde markanın <b>{p.videoCount} video hakkı kullanılmış</b> sayılır; marka ve içerik üreticisine bildirim gider.</Callout>
      </form>
    </Modal>
  );
}

export function DeadlineModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Teslim tarihini değiştir" sub={p.title} footer={<><Cancel /><SubmitBtn busy={busy} form="dlForm" cls="btn btn-dark">Kaydet</SubmitBtn></>}>
      <form className="stack" id="dlForm" onSubmit={async (e) => {
        e.preventDefault(); const d = String(new FormData(e.currentTarget).get('deadline'));
        if (await wrap(() => api.adminExtendDeadline(pid, d))) { closeModal(); toast('Teslim tarihi güncellendi', 'success', 'Marka bilgilendirildi.'); }
      }}>
        <div className="field"><label>Yeni teslim tarihi</label><input className="input" type="date" name="deadline" defaultValue={p.deadline || p.requestedDeadline} required /></div>
        <div className="field"><label>Gerekçe (işlem geçmişine yazılır)</label><input className="input" name="why" placeholder="Örn. kargo gecikmesi" /></div>
      </form>
    </Modal>
  );
}

export function CancelModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Projeyi iptal et" sub={p.no + ' · ' + p.title} footer={<><Cancel /><SubmitBtn busy={busy} form="cnForm" cls="btn btn-danger-ghost">Projeyi iptal et</SubmitBtn></>}>
      <form className="stack" id="cnForm" onSubmit={async (e) => {
        e.preventDefault(); const why = String(new FormData(e.currentTarget).get('why') || '').trim();
        if (!why) return;
        if (await wrap(() => api.adminCancelProject(pid, why))) { closeModal(); toast('Proje iptal edildi', 'info', 'Video hakkı markaya iade edildi.'); }
      }}>
        <div className="field"><label>İptal gerekçesi</label><textarea className="input" name="why" required placeholder="Markaya ve işlem geçmişine yazılır" /></div>
        <Callout tone="red" icon="alert">Bu işlem geri alınamaz. Projenin <b>{p.videoCount} video hakkı</b> markaya iade edilir; bekleyen teklifler geri çekilir.</Callout>
      </form>
    </Modal>
  );
}

const CHECKLIST = ['Ürün ilk 3 saniyede görünüyor', 'Brief’teki vurgular yer alıyor', 'Yasaklı ifade kullanılmamış', 'Format ve süre uygun', 'Ses ve görüntü kalitesi yeterli'];

/** Admin video inceleme: ön kontrol bekliyorsa kontrol listesi + markaya gönder / geri gönder */
export function AdminVideoModal({ pid, no }: { pid: string; no: number }) {
  const db = useDb(); const p = R.projectOf(db, pid)!; const v = p.videos.find((x) => x.no === no)!;
  const [note, setNote] = useState(''); const [err, setErr] = useState(false);
  const check = v.status === 'admin_kontrol';
  const actions = check ? (
    <>
      <AsyncButton className="btn btn-ghost" busyLabel="Gönderiliyor…" onRun={async () => {
        if (!note.trim()) { setErr(true); toast('İçerik üreticisine bir not yazın', 'error'); return; }
        await api.adminReviewVideo(pid, no, false, note.trim()); closeModal(); toast('Video içerik üreticisine geri gönderildi', 'info');
      }}><Icon name="revise" size={15} />İçerik üreticisine geri gönder</AsyncButton>
      <AsyncButton className="btn btn-primary" busyLabel="Gönderiliyor…" onRun={async () => { await api.adminReviewVideo(pid, no, true); closeModal(); toast('Video markaya gönderildi', 'success', 'Marka inceleme bildirimi aldı.'); }}>
        <Icon name="check" size={15} />Uygun — markaya gönder</AsyncButton>
    </>
  ) : <><button className="btn btn-ghost" onClick={() => toast('Demo: indirme simüle edildi', 'info')}><Icon name="download" size={15} />İndir</button><button className="btn btn-dark" onClick={closeModal}>Kapat</button></>;
  return (
    <VideoModal p={p} v={v} mode="admin" actions={actions} extra={check && (
      <>
        <div><div className="label mb-8">Kontrol listesi</div><div className="stack-sm small">
          {CHECKLIST.map((x) => <label key={x} className="check"><input type="checkbox" />{x === 'Format ve süre uygun' ? `${x} (${v.format})` : x}</label>)}
        </div></div>
        <div className={'field' + (err ? ' has-error' : '')}><label>İçerik üreticisine not (geri gönderirken zorunlu)</label>
          <textarea className="input" value={note} onChange={(e) => { setNote(e.target.value); setErr(false); }} placeholder="Örn. 0:12’deki ürün etiketi bulanık." /></div>
      </>
    )} />
  );
}
export const openAdminVideo = (pid: string, no: number) => openModal(<AdminVideoModal pid={pid} no={no} />);

export function ReviewAppModal({ cid }: { cid: string }) {
  const db = useDb(); const c = R.creatorOf(db, cid)!;
  const [fee, setFee] = useState(1800); const [show, setShow] = useState(true);
  const done = (ok: boolean) => { closeModal(); toast(ok ? 'İçerik üreticisi onaylandı' : 'Başvuru reddedildi', ok ? 'success' : 'info', 'İçerik üreticisine e-posta bildirimi gönderilir (demo).'); };
  return (
    <Modal title="Başvuruyu değerlendir" sub={c.name + ' · ' + c.cats.join(', ')} footer={<>
      <AsyncButton className="btn btn-danger-ghost" onRun={async () => { await api.reviewApplication(cid, false, 0, false); done(false); }}>Reddet</AsyncButton>
      <AsyncButton className="btn btn-success" onRun={async () => { await api.reviewApplication(cid, true, fee, show); done(true); }}>Onayla</AsyncButton>
    </>}>
      <div className="stack">
        <div className="row"><Avatar c={c} size="lg" /><div><b className="strong">{c.name}</b><div className="small muted">{c.city} · {c.age} · {c.ig} · {c.followers} takipçi</div><p className="small mt-8">{c.bio}</p></div></div>
        <div className="field"><label>Video başı ücret (onaylanırsa)</label><input className="input" type="number" value={fee} step={50} onChange={(e) => setFee(Number(e.target.value))} /></div>
        <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Onaylanınca markalara görünür olsun</label>
      </div>
    </Modal>
  );
}

export function RefundModal({ oid }: { oid: string }) {
  const db = useDb(); const o = R.orderOf(db, oid)!; const cr = R.credits(db, o.brandId);
  const [why, setWhy] = useState('');
  return (
    <Modal title="Sipariş iadesi" sub={`${o.no} · ${R.brandOf(db, o.brandId).name} · ${tl(R.orderTotal(db, o))}`}
      footer={<><Cancel /><AsyncButton className="btn btn-danger-ghost" onRun={async () => { await api.refundOrder(oid, why); closeModal(); toast('İade işlendi'); }}>İadeyi başlat</AsyncButton></>}>
      <div className="stack">
        <div className="field"><label>İade gerekçesi</label><textarea className="input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="İşlem geçmişine ve markaya yazılır" /></div>
        {cr.available < o.videos
          ? <Callout tone="red" icon="alert">Markanın bu siparişe ait hakları kullanılmış ya da rezerve. Kural gereği yalnızca kullanılmamış haklar iade edilebilir.</Callout>
          : <Callout tone="amber">İade sağlayıcı üzerinden kartına yapılır (demo). {o.videos} video hakkı marka hesabından düşülür.</Callout>}
      </div>
    </Modal>
  );
}

export function PackageModal({ id }: { id: string }) {
  const db = useDb(); const pk = R.pkgOf(db, id)!;
  const [busy, wrap] = useBusy();
  return (
    <Modal title={pk.name + ' paketini düzenle'} footer={<><Cancel /><SubmitBtn busy={busy} form="pkForm" cls="btn btn-dark">Kaydet</SubmitBtn></>}>
      <form className="stack" id="pkForm" onSubmit={async (e) => {
        e.preventDefault(); const f = new FormData(e.currentTarget);
        if (await wrap(() => api.updatePackage(id, { price: Number(f.get('price')), videos: Number(f.get('videos')), revisions: Number(f.get('revisions')), delivery: String(f.get('delivery')), desc: String(f.get('desc')), active: f.get('active') === 'on' }))) {
          closeModal(); toast('Paket güncellendi', 'success', 'Özel fiyat sayfasına ve marka paneline yansıdı.');
        }
      }}>
        <div className="grid-2"><div className="field"><label>Fiyat (KDV hariç, ₺)</label><input className="input" type="number" name="price" defaultValue={pk.price} step={100} /></div><div className="field"><label>Video adedi</label><input className="input" type="number" name="videos" defaultValue={pk.videos} min={1} /></div></div>
        <div className="grid-2"><div className="field"><label>Video başına revize</label><input className="input" type="number" name="revisions" defaultValue={pk.revisions} min={0} /></div><div className="field"><label>Teslim süresi</label><input className="input" name="delivery" defaultValue={pk.delivery} /></div></div>
        <div className="field"><label>Kısa açıklama</label><input className="input" name="desc" defaultValue={pk.desc} /></div>
        <label className="check"><input type="checkbox" name="active" defaultChecked={pk.active} />Satışta</label>
      </form>
    </Modal>
  );
}

export function CouponModal() {
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Kupon oluştur" footer={<><Cancel /><SubmitBtn busy={busy} form="cpForm" cls="btn btn-dark">Oluştur</SubmitBtn></>}>
      <form className="stack" id="cpForm" onSubmit={async (e) => {
        e.preventDefault(); const f = new FormData(e.currentTarget); const code = String(f.get('code') || '').trim().toLocaleUpperCase('tr-TR');
        if (!code) return;
        if (await wrap(() => api.addCoupon({ code, type: f.get('type') as 'percent' | 'amount', value: Number(f.get('value')), limit: Number(f.get('limit')), until: String(f.get('until')) }))) { closeModal(); toast('Kupon oluşturuldu'); }
      }}>
        <div className="grid-2"><div className="field"><label>Kod</label><input className="input" name="code" required placeholder="ORN10" style={{ textTransform: 'uppercase' }} /></div>
          <div className="field"><label>Tür</label><select className="input" name="type"><option value="percent">Yüzde (%)</option><option value="amount">Tutar (₺)</option></select></div></div>
        <div className="grid-2"><div className="field"><label>Değer</label><input className="input" type="number" name="value" defaultValue={10} /></div><div className="field"><label>Kullanım limiti</label><input className="input" type="number" name="limit" defaultValue={50} /></div></div>
        <div className="field"><label>Son geçerlilik</label><input className="input" type="date" name="until" defaultValue={addDays(TODAY, 60)} /></div>
      </form>
    </Modal>
  );
}

/** Prototipte kalıcı kayıt oluşturmayan işlemler için bilgilendirme */
export function DemoOnlyModal({ title, sub, fields, cta, msg }: { title: string; sub?: string; fields: React.ReactNode; cta: string; msg: string }) {
  return (
    <Modal title={title} sub={sub} footer={<><Cancel /><button className="btn btn-dark" onClick={() => { closeModal(); toast(msg, 'info', 'Prototipte kayıt oluşturulmadı.'); }}>{cta}</button></>}>
      <form className="stack" onSubmit={(e) => e.preventDefault()}>{fields}</form>
    </Modal>
  );
}
export const demoToast = (msg: string) => toast(msg, 'info', 'Prototipte kayıt oluşturulmadı.');
