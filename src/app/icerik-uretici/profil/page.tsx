'use client';
import type { Availability } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { rating } from '@/lib/format';
import { asList, asStr, formValues } from '@/lib/forms';
import { api } from '@/lib/api/mock-api';
import { CREATOR_ID, useDb } from '@/lib/store/demo-store';
import { openModal, toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar, VideoThumb } from '@/components/ui/media';
import { useBusy } from '@/components/ui/interactive';
import { CreatorProfileModal } from '@/components/shared/creator';
import { demoToast } from '@/components/admin/modals';

export default function CreatorProfile() {
  useCrumbs([{ t: 'Profil' }]);
  const db = useDb(); const c = R.creatorOf(db, CREATOR_ID)!;
  const [busy, wrap] = useBusy();
  return (
    <div className="page creator-col">
      <div className="card card-pad t-center stack" style={{ alignItems: 'center' }}>
        <Avatar c={c} size="xl" />
        <div><h1 style={{ fontSize: 22 }}>{c.name}</h1><p className="small muted">{c.city} · {c.age} · <Icon name="star-fill" size={11} /> {rating(c.rating)} · {c.done} iş</p></div>
        <div className="row-sm row-wrap" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => demoToast('Profil fotoğrafı yükleme simüle edildi')}><Icon name="image" size={14} />Fotoğrafı değiştir</button>
          <button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="public" />)}><Icon name="eye" size={14} />Markaların gördüğü</button>
        </div>
      </div>
      <form className="stack-lg mt-16" onSubmit={async (e) => {
        e.preventDefault(); const d = formValues(e.currentTarget);
        if (await wrap(() => api.updateCreatorProfile({ avail: asStr(d.avail) as Availability, bio: asStr(d.bio), cats: asList(d.cats), ig: asStr(d.ig), tt: asStr(d.tt), phone: asStr(d.phone) }))) toast('Profiliniz güncellendi');
      }}>
        <div className="card card-pad stack"><h3 style={{ fontSize: 15 }}>Müsaitlik</h3>
          <div className="choices">{(['Müsait', 'Yoğun', 'Uygun değil'] as const).map((x) => <label key={x} className="choice"><input type="radio" name="avail" value={x} defaultChecked={c.avail === x} /><span>{x}</span></label>)}</div>
          <span className="xs muted">“Uygun değil” seçtiğinizde yeni teklif almazsınız.</span></div>
        <div className="card card-pad stack"><h3 style={{ fontSize: 15 }}>Hakkımda</h3>
          <div className="field"><label>Kısa tanıtım</label><textarea className="input" name="bio" defaultValue={c.bio} /></div>
          <div className="field"><label>Kategoriler</label><div className="choices">{db.categories.map((x) => <label key={x} className="choice"><input type="checkbox" name="cats" value={x} defaultChecked={c.cats.includes(x)} /><span>{x}</span></label>)}</div></div>
          <div className="grid-2"><div className="field"><label>Instagram</label><input className="input" name="ig" defaultValue={c.ig} /></div><div className="field"><label>TikTok</label><input className="input" name="tt" defaultValue={c.tt} /></div></div></div>
        <div className="card card-pad stack"><div className="row between"><h3 style={{ fontSize: 15 }}>Portfolyo</h3><button type="button" className="btn btn-ghost btn-sm" onClick={() => demoToast('Portfolyo videosu ekleme simüle edildi')}><Icon name="plus" size={14} />Video ekle</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>{c.samples.map((s, i) => <VideoThumb key={s} tone={c.tone + i + 1} meta={s} small />)}</div></div>
        <div className="card card-pad stack"><h3 style={{ fontSize: 15 }}>İletişim ve ödeme</h3>
          <div className="grid-2"><div className="field"><label>E-posta</label><input className="input" value={c.email} readOnly /></div><div className="field"><label>Telefon</label><input className="input" name="phone" defaultValue={c.phone} /></div></div>
          <div className="field"><label>IBAN</label><input className="input" value={c.iban} readOnly /><span className="hint"><Icon name="lock" size={11} /> Prototipte IBAN değiştirilemez.</span></div>
          <p className="xs muted-2">Telefon ve e-posta bilgileriniz markalarla paylaşılmaz.</p></div>
        <button className={'btn btn-dark btn-lg btn-block' + (busy ? ' is-loading' : '')} type="submit" disabled={busy}>{busy ? <><span className="spinner" />Kaydediliyor…</> : 'Profili kaydet'}</button>
      </form>
    </div>
  );
}
