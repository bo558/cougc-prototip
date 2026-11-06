'use client';
/* Yeni proje: 5 adımlı brief sihirbazı. Her adımda form değerleri taslağa yazılır (otomatik kayıt). */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, type ReactNode } from 'react';
import type { Draft } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { addDays, fileSize, fmtDateLong, TODAY } from '@/lib/format';
import { asList, asStr, clearFieldError, formValues, validateForm } from '@/lib/forms';
import { api, emptyDraft } from '@/lib/api/mock-api';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/media';
import { Callout, PageHead } from '@/components/ui/primitives';
import { AsyncButton, useBusy } from '@/components/ui/interactive';
import { LockedCard } from '@/components/brand/parts';
import { MAX_PICKS, togglePick } from '@/components/shared/creator';

const WSTEPS = ['İçerik Üreticisi tercihi', 'Ürün & marka', 'Video detayları', 'Kargo & teslim', 'Özet & gönder'];
const GOALS = ['Reklam (dönüşüm)', 'Bilinirlik', 'Ürün tanıtımı', 'Organik içerik'];
const PLATFORMS = ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Meta reklamları', 'Web sitesi'];
const TEXT_KEYS = ['title', 'productName', 'productLink', 'description', 'features', 'audience', 'website', 'social', 'goal', 'format', 'duration', 'tone', 'highlights', 'forbidden', 'script', 'references', 'address', 'deadline', 'notes'] as const;

/** Form → taslak yaması (yalnızca o adımda bulunan alanlar) */
function collect(form: HTMLFormElement, step: number): Partial<Draft> {
  const v = formValues(form); const patch: Record<string, unknown> = {};
  TEXT_KEYS.forEach((k) => { if (k in v) patch[k] = asStr(v[k]); });
  if (step === 0) patch.letCougc = !!v.letCougc;
  if (step === 2) patch.platforms = asList(v.platforms);
  if (v.videoCount) patch.videoCount = Number(asStr(v.videoCount));
  if (v.shipping) patch.shipping = asStr(v.shipping);
  return patch as Partial<Draft>;
}

export default function NewProjectWizard() {
  useCrumbs([{ t: 'Yeni proje' }]);
  const db = useDb(); const router = useRouter();
  const step = Math.max(0, Math.min(4, Number(useSearchParams().get('adim') || 0)));
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, wrap] = useBusy();
  const c = R.credits(db, BRAND_ID);
  if (!c.available) return <div className="page"><PageHead title="Yeni proje" /><LockedCard /></div>;
  const d: Draft = { ...emptyDraft(), ...db.drafts[BRAND_ID] };
  const b = R.brandOf(db, BRAND_ID);

  const save = () => { if (formRef.current) api.updateDraft({ ...collect(formRef.current, step), step }); };
  const goTo = (to: number) => {
    const f = formRef.current!;
    if (to > step && !validateForm(f)) return;
    api.updateDraft({ ...collect(f, step), step: to });
    router.push('/marka/yeni-proje?adim=' + to);
  };

  let body: ReactNode;
  if (step === 0) {
    const picked = d.creators.map((id) => R.creatorOf(db, id)!);
    body = (
      <div className="form-section">
        <div><h3>Hangi içerik üreticilerini tercih edersiniz?</h3><p className="small muted mt-8">Tercih sıranız COUGC ekibine iletilir. Tercih, atama veya kesin onay değildir: uygun içerik üreticilerini COUGC ekibi değerlendirip size önerir, nihai seçim görüşmede belirlenir. Video hakkınız bu süreçte korunur.</p></div>
        {picked.length ? <div className="stack-sm">{picked.map((x, i) => (
          <div key={x.id} className="file-row"><span className="xs strong" style={{ width: 18 }}>#{i + 1}</span><Avatar c={x} />
            <div className="grow"><b className="strong small">{x.name}</b><div className="xs muted">{x.cats.join(', ')} · {x.city}</div></div>
            {i > 0 && <button type="button" className="btn btn-ghost btn-sm btn-icon" title="Öne al" aria-label="Yukarı taşı" onClick={() => { const cr = [...d.creators]; [cr[i - 1], cr[i]] = [cr[i], cr[i - 1]]; api.updateDraft({ creators: cr }); }}><Icon name="arrow-up" size={14} /></button>}
            <button type="button" className="btn btn-ghost btn-sm btn-icon" aria-label="Kaldır" onClick={() => togglePick(x.id)}><Icon name="x" size={14} /></button></div>
        ))}</div> : <Callout>Henüz içerik üreticisi tercih etmediniz. Vitrinden tercih edebilir veya değerlendirmeyi COUGC ekibine bırakabilirsiniz.</Callout>}
        <div className="row row-wrap"><Link className="btn btn-ghost" href="/marka/icerik-ureticileri" onClick={save}><Icon name="users" size={15} />{picked.length ? 'Tercihleri düzenle' : 'İçerik Üreticisi vitrinini aç'}</Link>
          {picked.length < MAX_PICKS && <span className="small muted">{MAX_PICKS - picked.length} tercih hakkınız kaldı</span>}</div>
        <label className="check"><input type="checkbox" name="letCougc" defaultChecked={d.letCougc} /><span>Tercihlerim uygun değilse <b className="strong">COUGC benim için önersin</b>.</span></label>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="form-section"><h3>Ürün bilgileri</h3>
        <div className="field"><label>Proje adı</label><input className="input" name="title" defaultValue={d.title} placeholder="Örn. Güneş kremi yaz kampanyası" /><span className="hint">Boş bırakırsanız ürün adı kullanılır.</span></div>
        <div className="grid-2"><div className="field"><label>Ürün adı <span className="req">*</span></label><input className="input" name="productName" defaultValue={d.productName} data-required /><span className="err">Ürün adını girin.</span></div>
          <div className="field"><label>Ürün bağlantısı</label><input className="input" name="productLink" defaultValue={d.productLink} placeholder="https://" /></div></div>
        <div className="field"><label>Ürün açıklaması <span className="req">*</span></label><textarea className="input" name="description" data-required defaultValue={d.description} placeholder="Ürün ne işe yarar, neden farklı?" /><span className="err">Kısa bir açıklama yazın.</span></div>
        <div className="field"><label>Öne çıkan özellikler</label><input className="input" name="features" defaultValue={d.features} placeholder="Örn. Parfümsüz · Hızlı emilim · Vegan" /></div>
        <div className="field"><label>Hedef kitle <span className="req">*</span></label><input className="input" name="audience" defaultValue={d.audience} data-required placeholder="Yaş, ilgi alanı, ihtiyaç" /><span className="err">Hedef kitleyi belirtin.</span></div>
        <h3 className="mt-8">Marka bilgileri</h3>
        <div className="grid-3"><div className="field"><label>Marka adı</label><input className="input" value={b.name} readOnly /></div>
          <div className="field"><label>Web sitesi</label><input className="input" name="website" defaultValue={d.website ?? b.website} /></div>
          <div className="field"><label>Sosyal hesap</label><input className="input" name="social" defaultValue={d.social ?? b.instagram} /></div></div>
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="form-section"><h3>Video detayları</h3>
        <div className="field"><label>Bu projede kaç video? <span className="req">*</span></label>
          <div className="choices">{Array.from({ length: Math.min(c.available, 5) }, (_, i) => i + 1).map((n) => (
            <label key={n} className="choice choice-card"><input type="radio" name="videoCount" value={n} defaultChecked={Number(d.videoCount || 1) === n} /><span><b>{n} video</b><small>{c.available - n} hak kalır</small></span></label>
          ))}</div><span className="hint">Kalan hakkınız: {c.available}. Haklarınızı farklı projelere bölebilirsiniz.</span></div>
        <div className="field"><label>Video hedefi</label><div className="choices">{GOALS.map((g) => <label key={g} className="choice"><input type="radio" name="goal" value={g} defaultChecked={d.goal === g} /><span>{g}</span></label>)}</div></div>
        <div className="field"><label>Yayınlanacak platformlar <span className="req">*</span></label>
          <div className="choices">{PLATFORMS.map((g) => <label key={g} className="choice"><input type="checkbox" name="platforms" value={g} defaultChecked={(d.platforms || []).includes(g)} /><span>{g}</span></label>)}</div>
          <input type="hidden" data-required data-group="platforms" /><span className="err">En az bir platform seçin.</span></div>
        <div className="grid-2">
          <div className="field"><label>Format</label><div className="choices">{['9:16', '1:1', '4:5'].map((f) => <label key={f} className="choice"><input type="radio" name="format" value={f} defaultChecked={(d.format || '9:16') === f} /><span>{f}</span></label>)}</div></div>
          <div className="field"><label>Süre</label><select className="input" name="duration" defaultValue={d.duration || '15–30 sn'}>{['15 sn', '15–30 sn', '30–45 sn', '45–60 sn'].map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <div className="field"><label>Üslup</label><input className="input" name="tone" defaultValue={d.tone} placeholder="Örn. samimi, enerjik, doğal ışık" /></div>
        <div className="grid-2"><div className="field"><label>Mutlaka vurgulansın</label><textarea className="input" name="highlights" defaultValue={d.highlights} placeholder="Videoda geçmesi gereken mesajlar" /></div>
          <div className="field"><label>Yasaklı ifadeler</label><textarea className="input" name="forbidden" defaultValue={d.forbidden} placeholder="Kullanılmaması gereken ifadeler, iddialar" /></div></div>
        <div className="field"><label>Senaryo / akış önerisi</label><textarea className="input" name="script" defaultValue={d.script} placeholder="Varsa hook, akış veya senaryo. Boş bırakırsanız içerik üreticisi önerir." /></div>
        <div className="field"><label>Referanslar</label><input className="input" name="references" defaultValue={d.references} placeholder="Beğendiğiniz video bağlantıları" /></div>
        <div className="field"><label>Ek dosyalar</label>
          <label className="dropzone" style={{ padding: 22 }}><span className="dz-i" style={{ width: 44, height: 44 }}><Icon name="paperclip" size={20} /></span><b>Dosya ekleyin</b><small>Marka rehberi, ürün görselleri, logo · PDF, JPG, PNG, ZIP · en fazla 100 MB</small>
            <input type="file" multiple className="sr-only" onChange={(e) => {
              const files = Array.from(e.target.files || []).map((x) => ({ name: x.name, size: x.size }));
              api.updateDraft({ ...collect(formRef.current!, step), attachments: [...(d.attachments || []), ...files] });
              toast(files.length + ' dosya eklendi', 'success', 'Demo: dosyalar bilgisayarınızdan dışarı gönderilmez.');
            }} /></label>
          <div className="stack-sm mt-8">{(d.attachments || []).map((a, i) => (
            <div key={a.name + i} className="file-row"><span className="fi"><Icon name="file" size={18} /></span><div className="grow"><div className="strong small">{a.name}</div><div className="xs muted">{fileSize(a.size)}</div></div>
              <button type="button" className="btn btn-ghost btn-sm btn-icon" aria-label="Kaldır" onClick={() => api.updateDraft({ attachments: (d.attachments || []).filter((_, j) => j !== i) })}><Icon name="x" size={14} /></button></div>
          ))}</div></div>
      </div>
    );
  } else if (step === 3) {
    const min = addDays(TODAY, 10);
    body = (
      <div className="form-section"><h3>Ürün gönderimi</h3>
        <div className="choices">
          <label className="choice choice-card"><input type="radio" name="shipping" value="evet" defaultChecked={d.shipping !== 'hayir'} /><span><b><Icon name="truck" size={15} /> Ürün göndereceğim</b><small>İçerik üreticisi ürünü kullanarak çekim yapar</small></span></label>
          <label className="choice choice-card"><input type="radio" name="shipping" value="hayir" defaultChecked={d.shipping === 'hayir'} /><span><b><Icon name="globe" size={15} /> Gönderim gerekmiyor</b><small>Dijital ürün, uygulama veya hizmet</small></span></label>
        </div>
        <Callout icon="pin">Proje kesinleştiğinde gönderim adresi ve kargo talimatı proje ekranınızda görünür. İçerik üreticilerinin kişisel adresleri markalarla paylaşılmaz.</Callout>
        <div className="field"><label>Gönderimle ilgili not</label><input className="input" name="address" defaultValue={d.address} placeholder="Örn. 2 adet ürün gönderilecek, beden: M" /></div>
        <h3 className="mt-8">Teslim</h3>
        <div className="field" style={{ maxWidth: 320 }}><label>Talep ettiğiniz teslim tarihi <span className="req">*</span></label><input className="input" type="date" name="deadline" defaultValue={d.deadline} min={min} data-required />
          <span className="hint">En erken {fmtDateLong(min)}. Kesin tarih, ürünün ulaşması ve içerik üreticisinin uygunluğuna göre COUGC tarafından belirlenir.</span><span className="err">Tarih seçin.</span></div>
        <div className="field"><label>Ek notlar</label><textarea className="input" name="notes" defaultValue={d.notes} placeholder="COUGC ekibinin bilmesi gereken başka bir şey var mı?" /></div>
      </div>
    );
  } else {
    const picked = d.creators.map((id) => R.creatorOf(db, id)!);
    const row = (k: string, v?: ReactNode) => <div key={k}><span>{k}</span><b>{v || <span className="muted-2">—</span>}</b></div>;
    const sec = (n: number, t: string, rows: ReactNode) => (
      <div className="card" style={{ borderRadius: 'var(--r-md)' }}>
        <div className="card-head" style={{ padding: '14px 18px' }}><h3 style={{ fontSize: 14 }}>{t}</h3><Link className="btn-link small" href={'/marka/yeni-proje?adim=' + n}>Düzenle</Link></div>
        <div className="card-body" style={{ padding: '6px 18px 12px' }}><div className="summary-list">{rows}</div></div>
      </div>
    );
    body = (
      <div className="form-section">
        <div><h3>Göndermeden önce kontrol edin</h3><p className="small muted mt-8">Gönderdikten sonra brief COUGC ekibi tarafından incelenir; değişiklik için COUGC ile iletişime geçebilirsiniz.</p></div>
        {sec(0, 'İçerik Üreticisi tercihi', <>{row('Tercih sırası', picked.map((x, i) => `${i + 1}. ${x.name}`).join('  ·  ') || 'COUGC önersin')}{row('Alternatif', d.letCougc ? 'COUGC önerebilir' : 'Önce bana sorulsun')}</>)}
        {sec(1, 'Ürün & marka', <>{row('Proje adı', d.title || d.productName)}{row('Ürün', d.productName)}{row('Hedef kitle', d.audience)}{row('Açıklama', d.description)}</>)}
        {sec(2, 'Video detayları', <>{row('Video adedi', (d.videoCount || 1) + ' video')}{row('Hedef', d.goal)}{row('Platformlar', (d.platforms || []).join(', '))}{row('Format / süre', `${d.format || '9:16'} · ${d.duration || '15–30 sn'}`)}{row('Vurgular', d.highlights)}{row('Yasaklı ifadeler', d.forbidden)}{row('Ekler', (d.attachments || []).length + ' dosya')}</>)}
        {sec(3, 'Kargo & teslim', <>{row('Ürün gönderimi', d.shipping === 'hayir' ? 'Gerekmiyor' : 'Gönderilecek')}{row('İstenen teslim', d.deadline ? fmtDateLong(d.deadline) : '')}</>)}
        <Callout tone="orange" icon="package">Gönderdiğinizde <b>{d.videoCount || 1} video hakkınız rezerve edilir</b> (kalan: {c.available - (d.videoCount || 1)}). Tercihleriniz COUGC ekibine iletilir; nihai seçim görüşmede belirlenir. Proje iptal edilirse hak hesabınıza geri döner.</Callout>
        <div className="field"><label className="check"><input type="checkbox" name="confirm" data-required /><span>Brief bilgilerinin doğru olduğunu ve videoların paket kapsamındaki kullanım haklarıyla teslim edileceğini onaylıyorum.</span></label><span className="err">Devam etmek için onay gerekli.</span></div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHead title="Yeni proje" sub={`Kalan video hakkı: ${c.available} · Taslağınız otomatik kaydedilir.`}
        actions={<AsyncButton className="btn btn-ghost" busyLabel="Kaydediliyor…" onRun={async () => { await api.saveDraft({ ...d, ...collect(formRef.current!, step), step }); toast('Taslak kaydedildi', 'success', 'Dilediğiniz zaman kaldığınız yerden devam edebilirsiniz.'); }}><Icon name="save" size={15} />Taslağı kaydet</AsyncButton>} />
      <div className="wizard">
        <nav className="wizard-nav" aria-label="Brief adımları">{WSTEPS.map((s, i) => (
          <button key={s} type="button" className={i === step ? 'on' : i < step ? 'done' : ''} onClick={() => goTo(i)}><span className="wn">{i < step ? <Icon name="check" size={12} /> : i + 1}</span>{s}</button>
        ))}</nav>
        <div>
          <div className="wizard-mobile"><div className="row between small mb-8"><b className="strong">{WSTEPS[step]}</b><span className="muted">Adım {step + 1} / 5</span></div>
            <div className="stepper">{WSTEPS.map((s, i) => <div key={s} className={'st ' + (i < step ? 'done' : i === step ? 'cur' : '')} />)}</div></div>
          <form key={step} ref={formRef} className="card card-pad stack-lg" noValidate onInput={clearFieldError} onChange={clearFieldError} onSubmit={async (e) => {
            e.preventDefault();
            if (step < 4) { goTo(step + 1); return; }
            if (!validateForm(e.currentTarget)) return;
            if (!d.productName || !d.deadline) { toast('Eksik bilgi var', 'error', 'Ürün adı ve teslim tarihi zorunludur.'); return; }
            let id = '';
            if (await wrap(async () => { id = (await api.submitBrief(d)).id; })) router.push('/marka/projeler/' + id + '?yeni=1');
          }}>
            {body}
            <div className="form-foot" style={{ borderTop: '1px solid var(--line-2)', paddingTop: 18 }}>
              {step > 0 ? <button type="button" className="btn btn-ghost" onClick={() => goTo(step - 1)}><Icon name="arrow-left" size={15} />Geri</button> : <span />}
              {step < 4 ? <button className="btn btn-dark" type="submit">Devam et <Icon name="arrow-right" size={15} /></button>
                : <button className={'btn btn-primary btn-lg' + (busy ? ' is-loading' : '')} type="submit" disabled={busy}>{busy ? <><span className="spinner" />Gönderiliyor…</> : <><Icon name="send" size={16} />Brief’i gönder</>}</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
