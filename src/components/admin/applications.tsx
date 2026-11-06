'use client';
/* Web sitesi başvuru formundan gelen kayıtlar (demo: yalnızca bu tarayıcıda). Dosyaların yalnızca adı ve boyutu görünür. */
import { useState, type ReactNode } from 'react';
import type { CreatorApplication } from '@/lib/types';
import { fileSize, fmtDate, fmtDateTime } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { closeModal, openModal, toast } from '@/lib/store/ui-store';
import { Icon } from '@/components/ui/Icon';
import { Callout } from '@/components/ui/primitives';
import { AsyncButton, Modal } from '@/components/ui/interactive';

const Row = ({ k, children }: { k: string; children: ReactNode }) => <><dt>{k}</dt><dd>{children || <span className="muted-2">—</span>}</dd></>;

function ApplicationModal({ id }: { id: string }) {
  const db = useDb(); const a = db.applications.find((x) => x.id === id)!;
  const [fee, setFee] = useState(1800); const [gender, setGender] = useState<'' | 'K' | 'E'>(''); const [show, setShow] = useState(false); const [err, setErr] = useState(false);
  return (
    <Modal size="lg" title="Başvuruyu değerlendir" sub={`${a.name} · ${a.city} / ${a.district} · ${fmtDateTime(a.date)}`} footer={a.status !== 'pending' ? <button className="btn btn-dark" onClick={closeModal}>Kapat</button> : <>
      <AsyncButton className="btn btn-danger-ghost" onRun={async () => { await api.reviewFormApplication(a.id, false); closeModal(); toast('Başvuru uygun bulunmadı', 'info', 'Başvuru sahibine bilgilendirme gönderilir (demo).'); }}>Uygun değil</AsyncButton>
      <AsyncButton className="btn btn-success" onRun={async () => {
        if (!gender) { setErr(true); return; }
        await api.reviewFormApplication(a.id, true, { fee, gender, visible: show }); closeModal(); toast('Başvuru onaylandı', 'success', 'İçerik üreticileri listesine eklendi.');
      }}>Onayla</AsyncButton></>}>
      <div className="stack">
        <Callout tone="amber" icon="alert" className="small">Demo kaydı: Bu bilgiler yalnızca bu tarayıcıda tutulur, hiçbir sunucuya gönderilmedi.</Callout>
        <dl className="kv">
          <Row k="Ad Soyad">{a.name}</Row><Row k="Yaş">{a.age}</Row><Row k="İl / ilçe">{a.city} / {a.district}</Row>
          <Row k="Telefon">{a.phone}</Row><Row k="E-posta">{a.email}</Row><Row k="Instagram">{a.instagram}</Row><Row k="TikTok">{a.tiktok}</Row>
          <Row k="Profesyonel çekim deneyimi">{a.shootExperience}</Row><Row k="Kamera karşısında">{a.cameraFeeling}</Row>
          <Row k="Video içeriği deneyimi">{a.contentExperience}</Row><Row k="Örnek içerik / portfolyo">{a.portfolio}</Row>
          <Row k="İçerik türleri">{a.contentTypes.join(', ')}</Row><Row k="Müsaitlik">{a.availability.join(', ')}</Row><Row k="Şehir dışı çekim">{a.travel}</Row>
          <Row k="Fotoğraf"><Icon name="image" size={14} /> {a.photo.name} · {fileSize(a.photo.size)}</Row>
          <Row k="Tanıtım videosu"><Icon name="film" size={14} /> {a.video.name} · {fileSize(a.video.size)}{a.video.duration ? ' · ' + Math.round(a.video.duration) + ' sn' : ''}</Row>
          <Row k="Notlar">{a.notes}</Row><Row k="Gelecek fırsatlar için iletişim">{a.futureContact ? 'Evet, izin verdi' : 'Hayır'}</Row>
        </dl>
        {a.status === 'pending' && <>
          <div className="divider" />
          <div className="grid-2">
            <div className={'field' + (err ? ' has-error' : '')}><label htmlFor="ap-gender">Vitrin filtresi için cinsiyet (yalnızca ekip)</label>
              <select id="ap-gender" className="input" value={gender} onChange={(e) => { setGender(e.target.value as 'K' | 'E' | ''); setErr(false); }}><option value="">Seçin</option><option value="K">Kadın</option><option value="E">Erkek</option></select>
              <span className="err">Onaylamak için seçin.</span></div>
            <div className="field"><label htmlFor="ap-fee">Video başı ücret (onaylanırsa)</label><input id="ap-fee" className="input" type="number" value={fee} step={50} onChange={(e) => setFee(Number(e.target.value))} /></div>
          </div>
          <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Onaylanınca markalara görünür olsun</label>
        </>}
      </div>
    </Modal>
  );
}

export function FormApplicationRow({ a }: { a: CreatorApplication }) {
  return (
    <div className="list-row"><span className="avatar"><Icon name="user" size={16} /></span>
      <div className="lr-main"><div className="lr-t">{a.name} · {a.city} / {a.district} · {a.age} yaş</div><div className="lr-s">Web sitesi formu · {a.contentTypes.join(', ')} · {a.instagram} · {fmtDate(a.date)}</div></div>
      <button className="btn btn-dark btn-sm" onClick={() => openModal(<ApplicationModal id={a.id} />)}>Değerlendir</button></div>
  );
}
