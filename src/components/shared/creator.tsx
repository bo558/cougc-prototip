'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { Creator } from '@/lib/types';
import { rating } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { closeModal, toast } from '@/lib/store/ui-store';
import { Icon } from '@/components/ui/Icon';
import { Portrait, VideoThumb } from '@/components/ui/media';
import { Callout } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/interactive';

export const MAX_PICKS = 3;

export const availTone = (a: string) => (a === 'Müsait' ? 'green' : a === 'Yoğun' ? 'amber' : 'gray');

/** "Tercih Et": tercih COUGC Admin paneline düşer. Atama veya kesin onay anlamına gelmez. */
export function togglePick(id: string) {
  const r = api.togglePick(id, MAX_PICKS);
  if (r === 'limit') toast('En fazla ' + MAX_PICKS + ' içerik üreticisi tercih edebilirsiniz', 'error', 'Bir tercihi geri alarak yenisini ekleyebilirsiniz.');
  else if (r === 'added') toast('Tercihiniz COUGC ekibine iletildi', 'success', 'Bu bir atama değildir. Nihai seçim görüşmede belirlenir.');
  else toast('Tercihiniz geri alındı', 'info');
}

export function CreatorCard({ c, selectedIndex, actions, onOpen }: { c: Creator; selectedIndex?: number; actions?: ReactNode; onOpen: () => void }) {
  return (
    <article className={'ccard ' + (selectedIndex ? 'selected' : '')}>
      {!!selectedIndex && <span className="pick">{selectedIndex}</span>}
      <button className="portrait-btn unstyled-btn" onClick={onOpen} aria-label={c.name + ' profilini aç'}>
        <Portrait c={c}>
          <div className="tl"><span className="badge glass no-dot"><Icon name="star-fill" size={11} /> {rating(c.rating)}</span></div>
          <div className="br"><span className="badge glass-dark no-dot"><Icon name="play" size={10} /> {c.samples.length} örnek</span></div>
        </Portrait>
      </button>
      <div className="cc-body">
        <div className="cc-name"><b>{c.name}</b><span className={'badge t-' + availTone(c.avail)}>{c.avail}</span></div>
        <div className="cc-meta"><Icon name="pin" size={13} />{c.city} · {c.age} yaş</div>
        <div className="cc-tags">{c.cats.map((x) => <span key={x} className="tag">{x}</span>)}</div>
      </div>
      {actions && <div className="cc-actions">{actions}</div>}
    </article>
  );
}

function SampleThumb({ c, i, title }: { c: Creator; i: number; title: string }) {
  const [pct, setPct] = useState<number | null>(null);
  useEffect(() => {
    if (pct === null) return;
    if (pct >= 100) { const t = setTimeout(() => setPct(null), 300); return () => clearTimeout(t); }
    const t = setTimeout(() => setPct(pct + 4), 100);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <button className="unstyled-btn" onClick={() => { if (pct === null) { setPct(0); toast(c.name + ' · ' + title, 'info', 'Demo önizleme oynatılıyor'); } }}>
      <VideoThumb tone={c.tone + i + 1} meta={title} small playing={pct !== null}>
        {pct !== null && <div style={{ position: 'absolute', left: 8, right: 8, bottom: 34, height: 3, borderRadius: 3, background: 'rgba(255,255,255,.3)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: Math.min(pct, 100) + '%', background: 'var(--orange)', transition: 'width .2s linear' }} /></div>}
      </VideoThumb>
    </button>
  );
}

function MiniStat({ k, v }: { k: string; v: ReactNode }) {
  return <div style={{ background: 'var(--paper)', borderRadius: 12, padding: '10px 12px' }}><div className="xs muted">{k}</div><b className="strong">{v}</b></div>;
}

/** İçerik Üreticisi profil modalı: rol bazlı içerik (marka: Tercih Et, admin: ücret/iletişim) */
export function CreatorProfileModal({ id, role }: { id: string; role: 'admin' | 'brand' | 'creator' | 'public' }) {
  const db = useDb();
  const c = db.creators.find((x) => x.id === id)!;
  const picked = (db.drafts[BRAND_ID]?.creators || []).includes(c.id);
  // Admin "markanın gördüğü profil" önizlemesinde tercih düğmesi gösterilmez
  const canPrefer = role === 'brand' && db.session.role === 'brand';
  return (
    <Modal size="lg" footer={<>
      <button className="btn btn-ghost" onClick={closeModal}>Kapat</button>
      {canPrefer && <button className={'btn ' + (picked ? 'btn-ghost' : 'btn-primary')} onClick={() => { togglePick(c.id); closeModal(); }}>
        {picked ? <><Icon name="check" size={16} /> Tercih edildi</> : 'Tercih Et'}</button>}
      {role === 'admin' && <Link className="btn btn-dark" href={'/admin/icerik-ureticileri/' + c.id} onClick={closeModal}>Yönetim sayfası</Link>}
    </>}>
      <div className="player" style={{ gridTemplateColumns: 'minmax(160px,220px) 1fr' }}>
        <div><Portrait c={c} /></div>
        <div className="stack">
          <div>
            <div className="row-sm"><h3 style={{ fontSize: 24 }}>{c.name}</h3><span className={'badge t-' + availTone(c.avail)}>{c.avail}</span></div>
            <div className="row-sm muted small mt-8"><Icon name="pin" size={14} />{c.city} · {c.age} yaş · {c.gender === 'K' ? 'Kadın' : 'Erkek'}</div>
          </div>
          <p>{c.bio}</p>
          <div className="row-sm row-wrap">{c.cats.map((x) => <span key={x} className="tag">{x}</span>)}</div>
          <div className="grid-3" style={{ gap: 10 }}>
            <MiniStat k="Puan" v={c.rating ? rating(c.rating) + ' / 5' : '—'} /><MiniStat k="Tamamlanan iş" v={c.done} /><MiniStat k="Takipçi" v={c.followers} />
          </div>
          {role === 'admin' && <><div className="divider" /><dl className="kv"><dt>Video ücreti</dt><dd>₺{c.fee.toLocaleString('tr-TR')}</dd><dt>Zamanında teslim</dt><dd>%{c.onTime}</dd><dt>İletişim</dt><dd>{c.email}<br />{c.phone}</dd></dl></>}
        </div>
      </div>
      <div className="section-title mt-24"><h2 style={{ fontSize: 16 }}>Örnek videolar</h2><span className="xs muted-2">Temsilî önizleme</span></div>
      {c.samples.length ? <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(c.samples.length, 4)}, minmax(0,150px))`, gap: 12 }}>
        {c.samples.map((s, i) => <SampleThumb key={s} c={c} i={i} title={s} />)}
      </div> : <p className="small muted">Henüz örnek video eklenmedi.</p>}
      {role === 'brand' && <Callout className="mt-24">Tercih Et, atama veya kesin onay anlamına gelmez. Uygun içerik üreticilerini COUGC ekibi değerlendirip size önerir; nihai seçim COUGC ekibiyle yapacağınız görüşmede belirlenir.</Callout>}
    </Modal>
  );
}
