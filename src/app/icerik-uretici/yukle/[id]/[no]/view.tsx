'use client';
/* Video yükleme: dosya yalnızca bu cihazda önizlenir; yükleme ilerlemesi simüle edilir (sunucuya gönderim yok).
   Gerçek sistemde: imzalı URL ile depolamaya doğrudan, parçalı ve kaldığı yerden devam eden yükleme. */
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import * as R from '@/lib/domain/rules';
import { VIDEO_STATUS } from '@/lib/domain/status';
import { fileSize } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Callout, EmptyState } from '@/components/ui/primitives';

const MAX_SIZE = 2 * 1024 * 1024 * 1024;
type Stage = 'pick' | 'selected' | 'uploading' | 'done';

export default function UploadPage() {
  const params = useParams<{ id: string; no: string }>();
  const no = Number(params.no);
  const db = useDb();
  const p = R.projectOf(db, params.id); const v = p?.videos.find((x) => x.no === no);
  useCrumbs([{ t: 'İşlerim', h: '/icerik-uretici/isler' }, { t: p?.no || '', h: '/icerik-uretici/isler/' + params.id }, { t: 'Video ' + no }]);
  const [stage, setStage] = useState<Stage>('pick');
  // Yükleme tamamlanınca sürüm numarası artar; başlıkta yüklenen sürüm sabit kalsın
  const [verNo] = useState(() => (v ? v.versions.length + 1 : 1));
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [dur, setDur] = useState('');
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  if (!p || p.creatorId !== CREATOR_ID || !v) return <div className="page creator-col"><EmptyState icon="lock" title="Bu yüklemeye erişiminiz yok" /></div>;
  if (stage !== 'done' && (!['bekleniyor', 'revize'].includes(v.status) || !['uretimde', 'teslim'].includes(p.status)))
    return <div className="page creator-col"><EmptyState icon="check-circle" title="Bu video için şu an yükleme gerekmiyor" text={'Durum: ' + VIDEO_STATUS[v.status].label} action={<Link className="btn btn-dark" href={'/icerik-uretici/isler/' + p.id}>İşe dön</Link>} /></div>;
  const brief = R.briefOf(db, p); const isRev = v.status === 'revize' || !!v.adminNote;

  const pick = (f: File) => {
    setErr('');
    const okType = /\.(mp4|mov)$/i.test(f.name) || ['video/mp4', 'video/quicktime'].includes(f.type);
    if (!okType) { setErr('Desteklenmeyen dosya türü. Yalnızca MP4 veya MOV yükleyebilirsiniz.'); return; }
    if (f.size > MAX_SIZE) { setErr(`Dosya çok büyük. En fazla 2 GB yükleyebilirsiniz (${fileSize(f.size)}).`); return; }
    setFile(f); setUrl(URL.createObjectURL(f)); setDur(''); setStage('selected');
  };
  const start = () => {
    if (!file) return;
    setStage('uploading'); setSent(0);
    const total = file.size; const speed = Math.max(total / 9, 4 * 1024 * 1024);
    let s = 0;
    timer.current = setInterval(async () => {
      s = Math.min(total, s + speed * 0.25 * (0.7 + Math.random() * 0.6)); setSent(s);
      if (s >= total) {
        clearInterval(timer.current!); timer.current = null;
        await api.creatorUpload(p.id, no, { name: file.name, size: file.size, dur: dur || undefined }, note.trim());
        setStage('done'); toast('Video teslim edildi', 'success', 'COUGC ön kontrolüne gönderildi.');
      }
    }, 250);
  };
  const cancel = () => { if (timer.current) clearInterval(timer.current); setStage('selected'); toast('Yükleme iptal edildi', 'info'); };
  const pct = file ? Math.round((sent / file.size) * 100) : 0;
  const speed = file ? Math.max(file.size / 9, 4 * 1024 * 1024) : 1;

  return (
    <div className="page creator-col">
      <h1 style={{ fontSize: 22 }}>{isRev ? 'Yeni sürüm yükle' : 'Video yükle'}</h1>
      <p className="small muted mt-8">{p.title} · Video {no} · v{verNo}</p>
      {v.status === 'revize' && <Callout tone="orange" icon="revise" className="mt-16"><b>Revize talebi ({v.revisions.length}/{R.revisionLimit(db, p)}):</b> {v.revisions[v.revisions.length - 1].reason}</Callout>}
      {v.adminNote && <Callout tone="amber" icon="alert" className="mt-16"><b>COUGC notu:</b> {v.adminNote}</Callout>}
      <div className="card card-pad mt-16">
        <div className="row-sm row-wrap small"><span className="tag"><Icon name="film" size={13} /> {v.format}</span><span className="tag"><Icon name="clock" size={13} /> {brief.duration}</span><span className="tag">MP4 / MOV · en fazla 2 GB</span></div>
        <div className="small muted mt-12"><b className="strong">Hatırlatma:</b> {brief.highlights}</div>
      </div>

      {stage === 'pick' && (
        <div className="mt-16">
          <label className={'dropzone' + (drag ? ' drag' : '')}
            onDragEnter={(e) => { e.preventDefault(); setDrag(true); }} onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDrag(false); }} onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pick(f); }}>
            <span className="dz-i"><Icon name="upload" size={26} /></span><b>Videonuzu seçin</b><small>Galeriden seçin veya buraya sürükleyin</small>
            <span className="btn btn-primary mt-8" style={{ pointerEvents: 'none' }}>Dosya seç</span>
            <input ref={inputRef} id="fileIn" type="file" accept="video/mp4,video/quicktime,.mp4,.mov" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); }} />
          </label>
          {err && <Callout tone="red" icon="alert" className="mt-12"><b>{err.split('.')[0]}.</b>{err.slice(err.indexOf('.') + 1)}</Callout>}
        </div>
      )}

      {stage === 'selected' && file && (
        <div className="mt-16 stack">
          <div className="card" style={{ overflow: 'hidden' }}>
            <video src={url} playsInline controls style={{ width: '100%', maxHeight: 420, background: '#000' }} onLoadedMetadata={(e) => { const s = Math.round(e.currentTarget.duration || 0); setDur(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')); }} />
            <div className="card-body"><div className="file-row" style={{ border: 0, padding: 0 }}><span className="fi"><Icon name="film" size={20} /></span>
              <div className="grow"><div className="strong small">{file.name}</div><div className="xs muted">{fileSize(file.size)} · {file.type || 'video'}{dur && ' · ' + dur}</div></div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setStage('pick'); setFile(null); }}>Değiştir</button></div></div>
          </div>
          <div className="field"><label>Not (isteğe bağlı)</label><textarea className="input" id="upNote" value={note} onChange={(e) => setNote(e.target.value)} placeholder={isRev ? 'Revizede neleri değiştirdiğinizi kısaca yazın' : 'COUGC ekibi için not'} /></div>
          <button className="btn btn-primary btn-lg btn-block" onClick={start}><Icon name="upload" size={17} />Yüklemeyi başlat</button>
          <p className="xs muted-2 t-center">Demo: video bu cihazdan dışarı gönderilmez; yükleme simüle edilir.</p>
        </div>
      )}

      {stage === 'uploading' && file && (
        <div className="mt-16 card card-pad stack">
          <div className="row between"><b className="strong">Yükleniyor…</b><span className="mono strong" id="pct">{pct}%</span></div>
          <div className="progress" style={{ height: 10 }}><i style={{ width: pct + '%' }} /></div>
          <div className="row between xs muted"><span>{fileSize(sent)} / {fileSize(file.size)}</span><span>{pct < 100 ? 'yaklaşık ' + Math.max(1, Math.round((file.size - sent) / speed)) + ' sn kaldı' : 'tamamlanıyor'}</span></div>
          <Callout className="small">Bağlantınız koparsa yükleme kaldığı yerden devam eder (gerçek sistemde parçalı yükleme). Bu ekranı kapatmayın.</Callout>
          <button className="btn btn-ghost" onClick={cancel}>İptal et</button>
        </div>
      )}

      {stage === 'done' && (
        <div className="mt-16" id="upDone"><div className="result card card-pad" style={{ margin: 0 }}>
          <div className="ri ok"><Icon name="check" size={32} /></div><h1 style={{ fontSize: 22 }}>Video teslim edildi</h1>
          <p>COUGC ekibi videoyu kontrol ettikten sonra markaya iletecek. Gelişmeleri bildirimlerden takip edebilirsiniz.</p>
          <Link className="btn btn-dark mt-8" href={'/icerik-uretici/isler/' + p.id}>İşe dön</Link>
        </div></div>
      )}
    </div>
  );
}
