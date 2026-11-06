'use client';
import { useEffect, useState, type ReactNode } from 'react';
import type { Project, Video } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { VIDEO_STATUS } from '@/lib/domain/status';
import { fileSize, fmtDateTime } from '@/lib/format';
import { useDb } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { Icon } from '@/components/ui/Icon';
import { VideoThumb } from '@/components/ui/media';
import { Modal } from '@/components/ui/interactive';
import { Callout, StatusBadge } from '@/components/ui/primitives';

export const downloadToast = () => toast('Demo: indirme simüle edildi', 'info', 'Gerçekte yetki kontrolünden sonra kısa süreli güvenli bağlantı üretilir.');

/** Video satırı bilgi bloğu */
export function VideoInfo({ p, v, mode }: { p: Project; v: Video; mode: 'admin' | 'brand' | 'creator' }) {
  const db = useDb();
  const last = v.versions[v.versions.length - 1];
  const limit = R.revisionLimit(db, p);
  return (
    <>
      <div className="row-sm row-wrap"><b className="strong">Video {v.no}</b><span className="tag">{v.format}</span><StatusBadge map={VIDEO_STATUS} value={v.status} mode={mode === 'brand' ? 'brand' : undefined} /></div>
      <div className="small muted mt-8">{last ? `Son sürüm v${last.v} · ${fmtDateTime(last.date)} · ${last.dur}` : 'Henüz yükleme yok'} · Revize {v.revisions.length}/{limit}</div>
      {v.adminNote && mode !== 'brand' && <Callout tone="amber" icon="alert" className="mt-8 small"><b>COUGC notu:</b> {v.adminNote}</Callout>}
      {v.status === 'revize' && v.revisions.length > 0 && <Callout tone="orange" icon="revise" className="mt-8 small"><b>Revize talebi:</b> {v.revisions[v.revisions.length - 1].reason}</Callout>}
    </>
  );
}

/** Demo oynatıcı: gerçek video yerine temsilî önizleme + ilerleme simülasyonu */
function Player({ tone, format, watermark }: { tone: number; format: string; watermark: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPct((x) => (x + 2) % 102), 120);
    return () => clearInterval(t);
  }, [playing]);
  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPlaying((x) => !x)} role="button" aria-label={playing ? 'Duraklat' : 'Oynat'}>
      <VideoThumb tone={tone} format={format} watermark={watermark} playing={playing} />
      <div className="bar"><i style={{ width: pct + '%' }} /></div>
    </div>
  );
}

export function VideoModal({ p, v, mode, actions, extra }: { p: Project; v: Video; mode: 'admin' | 'brand' | 'creator'; actions: ReactNode; extra?: ReactNode }) {
  const db = useDb();
  const c = R.creatorOf(db, p.creatorId);
  const last = v.versions[v.versions.length - 1];
  const limit = R.revisionLimit(db, p);
  return (
    <Modal size="lg" title={`${p.title} · Video ${v.no}`} sub={`${R.brandOf(db, p.brandId).name} · ${c?.name || ''} · ${v.format}`} footer={actions}>
      <div className="player">
        <Player tone={c?.tone || 0} format={v.format} watermark={v.status !== 'onaylandi'} />
        <div className="stack">
          <div><StatusBadge map={VIDEO_STATUS} value={v.status} mode={mode === 'brand' ? 'brand' : undefined} /></div>
          {last?.note && <Callout icon="message" className="small"><b>İçerik Üreticisi notu:</b> {last.note}</Callout>}
          <div><div className="label mb-8">Sürümler</div>
            {v.versions.length ? v.versions.slice().reverse().map((x) => (
              <div key={x.v} className="row between small" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                <span><b className="strong">v{x.v}</b> · {fmtDateTime(x.date)}</span><span className="muted">{x.dur} · {fileSize(x.size)}</span>
              </div>
            )) : <p className="small muted">Henüz yükleme yok.</p>}
          </div>
          {v.revisions.length > 0 && <div><div className="label mb-8">Revize geçmişi ({v.revisions.length}/{limit})</div>
            {v.revisions.map((r, i) => (
              <div key={i} className="small" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                <b className="strong">Revize {i + 1}</b> · <span className="muted">{fmtDateTime(r.date)}</span><div className="mt-8">{r.reason}</div>
              </div>
            ))}</div>}
          {extra}
        </div>
      </div>
      <p className="xs muted-2 mt-16"><Icon name="info" size={12} /> Prototip: gerçek video dosyası yerine temsilî önizleme gösterilir.</p>
    </Modal>
  );
}
