'use client';
/* coUGC Marka Yüzü & İçerik Üreticisi Başvurusu.
   DEMO: Ağ isteği yapılmaz, dosyalar cihazdan çıkmaz; yalnızca başvuru özeti bu tarayıcıda tutulur. */
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ageFrom, asList, asStr, clearFieldError, formValues, validateForm } from '@/lib/forms';
import { fileSize } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useTitle } from '@/hooks/nav';
import { Icon, Star, type IconName } from '@/components/ui/Icon';
import { Callout } from '@/components/ui/primitives';
import { useBusy } from '@/components/ui/interactive';

/** Marka yazımı: PDF'teki gibi. Resmî yazım kesinleşince tek yerden değişir. */
const BRAND = 'coUGC';
const FORM_TITLE = 'Marka Yüzü & İçerik Üreticisi Başvurusu';

const STEPS = ['Kişisel bilgiler', 'Seni tanıyalım', 'İçerik üretimi deneyimin', 'Son bir adım!'];
const SHOOT_EXPERIENCE = ['Evet', 'Hayır', 'Yalnızca kişisel içeriklerimde yer aldım'];
const CAMERA_FEELING = ['Çok rahatım', 'Biraz heyecanlanırım ama alışabilirim', 'Yeni deneyimlemek istiyorum'];
const CONTENT_EXPERIENCE = ['Evet, markalar için içerik ürettim', 'Evet, kendi sosyal medya hesaplarım için üretiyorum', 'Her ikisi için de içerik ürettim', 'Hayır, henüz deneyimim yok'];
const CONTENT_TYPES = ['UGC / Ürün deneyimi videoları', 'Konuşmalı / Tanıtım videoları', 'Trend / Reels / TikTok içerikleri', 'Fotoğraf / Lifestyle çekimleri', 'Reklam filmi / Marka yüzü'];
const AVAILABILITY = ['Hafta içi', 'Hafta sonu', 'Esnek'];
const TRAVEL = ['Evet', 'Proje ve ulaşım koşullarına göre', 'Hayır, yalnızca bulunduğum şehirde'];
const HIGHLIGHTS: [IconName, string][] = [['globe', 'Türkiye Geneli Başvuru'], ['briefcase', 'Proje Bazlı İş Birliği'], ['wallet', 'Ücretli Çekimler']];
const FAQS: [string, string][] = [
  ['Profesyonel oyuncu veya model olmam gerekiyor mu?', 'Hayır. Deneyim şart değil. Kamera karşısında rahat olman ve kendini doğal şekilde ifade edebilmen yeterli.'],
  ['Çekimleri ben mi yapacağım?', 'Cogros tarafından organize edilen marka yüzü projelerinde fotoğraf ve video çekimlerini ekip gerçekleştirir; sen kamera önünde yer alırsın. UGC üretim projelerinin kapsamı ayrıca belirtilir.'],
  ['Çekimler ücretli mi?', 'Evet. Ücret, çekim süresi ve diğer koşullar proje özelinde önceden paylaşılır.'],
  ['Başvuru yaptıktan sonra kesin çekime çağrılır mıyım?', 'Hayır. Başvurular projelere uygunluk açısından değerlendirilir; ihtiyaç oluştuğunda iletişime geçilir.'],
  ['Takipçi sayım önemli mi?', 'Belirli bir takipçi sayısı şartı yok. Önceliğimiz marka uyumu ve kamera karşısındaki enerjin.'],
  ['Hangi şehirlerden başvurabilirim?', 'Türkiye genelinden başvuru kabul ediyoruz. Çekim lokasyonları projeye göre değişir.']
];

const PHOTO_MAX = 10 * 1024 * 1024;
const VIDEO_MIN = 15; const VIDEO_MAX = 30;
/** Telefonların kayıt süresi yuvarlaması için küçük pay */
const VIDEO_TOLERANCE = 0.5;

type Picked = { file: File; url: string; duration?: number; note?: string };

function readDuration(url: string) {
  return new Promise<number | null>((resolve) => {
    const v = document.createElement('video');
    const done = (r: number | null) => { clearTimeout(t); v.removeAttribute('src'); v.load(); resolve(r); };
    const t = setTimeout(() => done(null), 8000);
    v.preload = 'metadata'; v.muted = true;
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) && v.duration > 0 ? v.duration : null);
    v.onerror = () => done(null);
    v.src = url;
  });
}

const Req = () => <span className="req" aria-hidden="true"> *</span>;

function TextField({ id, label, required, hint, err, children }: { id: string; label: string; required?: boolean; hint?: ReactNode; err?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && <Req />}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
      {err && <span className="err" role="alert">{err}</span>}
    </div>
  );
}

function Options({ name, label, type, options, err }: { name: string; label: string; type: 'radio' | 'checkbox'; options: string[]; err: string }) {
  const lid = name + '-label';
  return (
    <div className="field" role={type === 'radio' ? 'radiogroup' : 'group'} aria-labelledby={lid}>
      <span className="label" id={lid}>{label}<Req /></span>
      {type === 'checkbox' && <span className="hint">Birden fazla seçebilirsin.</span>}
      <div className="choices choices-col">
        {options.map((o) => <label key={o} className="choice"><input type={type} name={name} value={o} /><span>{o}</span></label>)}
      </div>
      <input type="hidden" data-required data-group={name} />
      <span className="err" role="alert">{err}</span>
    </div>
  );
}

function Upload({ id, label, icon, formats, hint, accept, picked, error, onPick, onClear, err }: {
  id: string; label: string; icon: IconName; formats: string; hint: string; accept: string; picked: Picked | null; error: string;
  onPick: (f: File) => void; onClear: () => void; err: string;
}) {
  return (
    <div className="field">
      <span className="label">{label}<Req /></span>
      {picked ? (
        <div className="apply-file">
          {picked.file.type.startsWith('video/') || /\.(mp4|mov)$/i.test(picked.file.name)
            ? <video src={picked.url} controls playsInline preload="metadata" aria-label="Seçilen video önizlemesi" />
            // eslint-disable-next-line @next/next/no-img-element -- yerel nesne adresi; görsel optimizasyonu uygulanmaz
            : <img src={picked.url} alt="Seçilen fotoğraf önizlemesi" />}
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="strong small apply-file-name">{picked.file.name}</div>
            <div className="xs muted">{fileSize(picked.file.size)}{picked.duration ? ' · ' + Math.round(picked.duration) + ' saniye' : ''}</div>
            {picked.note && <div className="xs amber mt-8">{picked.note}</div>}
            <button type="button" className="btn-link small mt-8" onClick={onClear}>Dosyayı değiştir</button>
          </div>
        </div>
      ) : (
        <label className="dropzone apply-drop" htmlFor={id}>
          <span className="dz-i"><Icon name={icon} size={22} /></span>
          <b>Dosya seç</b><small>{formats}</small>
          <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onPick(f); }} />
        </label>
      )}
      <span className="hint">{hint}</span>
      {error && <span className="err" style={{ display: 'block' }} role="alert">{error}</span>}
      <input type="hidden" data-required value={picked ? '1' : ''} readOnly />
      {!error && <span className="err" role="alert">{err}</span>}
    </div>
  );
}

function Faq() {
  return (
    <section className="sec apply-faq"><div className="container">
      <div className="sec-head center"><h2>Sık sorulan sorular</h2></div>
      <div className="faq">
        {FAQS.map(([q, a]) => <details key={q}><summary>{q}<Icon name="plus" size={18} /></summary><p>{a}</p></details>)}
      </div>
    </div></section>
  );
}

export default function ApplyPage() {
  useTitle(`${BRAND} | ${FORM_TITLE}`);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [photo, setPhoto] = useState<Picked | null>(null);
  const [video, setVideo] = useState<Picked | null>(null);
  const [photoErr, setPhotoErr] = useState('');
  const [videoErr, setVideoErr] = useState('');
  const [busy, wrap] = useBusy();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const urls = useRef<string[]>([]);

  // Adım değişince formun başına dön ve başlığa odaklan
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    cardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  // Yerel önizleme adreslerini sayfadan çıkarken serbest bırak
  useEffect(() => { const list = urls; return () => { list.current.forEach((u) => URL.revokeObjectURL(u)); }; }, []);
  const makeUrl = (f: File) => { const u = URL.createObjectURL(f); urls.current.push(u); return u; };

  const pickPhoto = (f: File) => {
    setPhotoErr('');
    if (!(['image/jpeg', 'image/png'].includes(f.type) || /\.(jpe?g|png)$/i.test(f.name))) { setPhotoErr('Lütfen JPG veya PNG biçiminde bir fotoğraf seç.'); return; }
    if (f.size > PHOTO_MAX) { setPhotoErr('Fotoğraf 10 MB’tan büyük olamaz. Daha küçük bir dosya seç.'); return; }
    setPhoto({ file: f, url: makeUrl(f) });
    clearUploadError(0);
  };
  const pickVideo = async (f: File) => {
    setVideoErr('');
    if (!(['video/mp4', 'video/quicktime'].includes(f.type) || /\.(mp4|mov)$/i.test(f.name))) { setVideoErr('Lütfen MP4 veya MOV biçiminde bir video seç.'); return; }
    const url = makeUrl(f);
    const d = await readDuration(url);
    if (d !== null && (d < VIDEO_MIN - VIDEO_TOLERANCE || d > VIDEO_MAX + VIDEO_TOLERANCE)) {
      setVideoErr(`Video süresi 15–30 saniye olmalı (seçtiğin video ${Math.round(d)} saniye).`);
      return;
    }
    setVideo({ file: f, url, duration: d ?? undefined, note: d === null ? 'Bu tarayıcı video süresini okuyamadı. Videonun 15–30 saniye olduğundan emin ol.' : undefined });
    clearUploadError(1);
  };
  /** Dosya seçilince ilgili alanın hata görünümünü kaldırır (input'lar her zaman DOM'da değil) */
  const clearUploadError = (i: number) => {
    stepRefs.current[3]?.querySelectorAll('.apply-upload .field')[i]?.classList.remove('has-error');
  };

  const next = () => {
    const el = stepRefs.current[step];
    if (el && validateForm(el)) setStep(step + 1);
  };

  if (done) {
    return (
      <>
        <section className="sec sec-paper apply-done"><div className="container"><div className="result card card-pad">
          <div className="ri ok"><Icon name="check" size={32} /></div>
          <h1>Başvurun bize ulaştı!</h1>
          <p>{BRAND}’ye ilgi gösterdiğin için teşekkür ederiz. Başvurunu inceleyeceğiz. Profiline uygun bir çekim projesi oluştuğunda seninle iletişime geçebiliriz.</p>
          <p className="strong" style={{ color: 'var(--ink)' }}>Belki de bir sonraki çekimimizde görüşürüz!</p>
          <p className="small">{BRAND} by Cogros</p>
          <Callout tone="amber" icon="alert" className="mt-16"><span style={{ textAlign: 'left', display: 'block' }}><b>Bu bir prototip gösterimidir.</b> Başvurun hiçbir sunucuya gönderilmedi ve dosyaların cihazından çıkmadı. Ekip akışını göstermek için özet yalnızca bu tarayıcıda tutulur; üst şeritteki “Sıfırla” ile silinir.</span></Callout>
          <div className="row row-wrap mt-16" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-ghost" href="/">Ana sayfa</Link>
          </div>
        </div></div></section>
      </>
    );
  }

  return (
    <>
      <section className="apply-hero"><Star /><div className="container">
        <span className="eyebrow">{BRAND}</span>
        <h1>Bir sonraki çekimimizde sen ol!</h1>
        <p className="lead">Kamera karşısında olmayı seviyor musun? O zaman tanışalım!</p>
        <p>{BRAND} olarak Cogros bünyesinde çalıştığımız markaların reklam, fotoğraf ve sosyal medya içeriklerinde yer alacak yeni yüzler arıyoruz. Profesyonel oyuncu, model veya içerik üreticisi olman gerekmiyor. Deneyimin olmasa da başvurabilirsin.</p>
        <ul className="apply-highlights">{HIGHLIGHTS.map(([i, t]) => <li key={t}><Icon name={i} size={17} />{t}</li>)}</ul>
        <p>Başvurunu oluştur, sana uygun projelerde birlikte çalışalım.</p>
        <a className="btn btn-primary btn-lg mt-16" href="#basvuru-formu" onClick={(e) => { e.preventDefault(); cardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); stepRefs.current[0]?.querySelector('input')?.focus({ preventScroll: true }); }}>BAŞVURUNU OLUŞTUR <Icon name="arrow-right" size={16} /></a>
      </div></section>

      <section className="sec sec-paper apply-form-sec"><div className="container apply-container">
        <div className="card apply-card" id="basvuru-formu" ref={cardRef}>
          <div className="apply-card-head">
            <h2>{FORM_TITLE}</h2>
            <p className="small muted">Zorunlu alanlar <span className="req">*</span> ile gösterilir.</p>
            <div className="row between small mt-16"><b className="strong" ref={titleRef} tabIndex={-1}>{STEPS[step]}</b><span className="muted">Adım {step + 1} / {STEPS.length}</span></div>
            <div className="stepper mt-8" role="progressbar" aria-label="Başvuru ilerlemesi" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-valuetext={`Adım ${step + 1} / ${STEPS.length}: ${STEPS[step]}`}>
              {STEPS.map((s, i) => <div key={s} className={'st ' + (i < step ? 'done' : i === step ? 'cur' : '')} />)}
            </div>
          </div>

          <form className="apply-body" noValidate onInput={clearFieldError} onChange={clearFieldError} onSubmit={async (e) => {
            e.preventDefault();
            if (step < STEPS.length - 1) { next(); return; }
            const form = e.currentTarget;
            const el = stepRefs.current[step];
            if (!el || !validateForm(el) || !photo || !video) return;
            const v = formValues(form);
            const ok = await wrap(() => api.submitApplication({
              name: asStr(v.name).trim(), age: ageFrom(asStr(v.birth)) ?? 0, city: asStr(v.city).trim(), district: asStr(v.district).trim(),
              phone: asStr(v.phone).trim(), email: asStr(v.email).trim(), instagram: asStr(v.instagram).trim(), tiktok: asStr(v.tiktok).trim() || undefined,
              shootExperience: asStr(v.shootExperience), cameraFeeling: asStr(v.cameraFeeling), contentExperience: asStr(v.contentExperience),
              portfolio: asStr(v.portfolio).trim() || undefined, contentTypes: asList(v.contentTypes), availability: asList(v.availability), travel: asStr(v.travel),
              photo: { name: photo.file.name, size: photo.file.size }, video: { name: video.file.name, size: video.file.size, duration: video.duration },
              notes: asStr(v.notes).trim() || undefined, futureContact: !!v.futureContact
            }));
            if (ok) { setDone(true); window.scrollTo({ top: 0 }); }
          }}>
            <Callout tone="amber" icon="alert" className="small"><b>Prototip:</b> Bu form demo amaçlıdır. Bilgilerin ve dosyaların hiçbir sunucuya gönderilmez; gerçek kişisel bilgilerini girmene gerek yok.</Callout>

            {/* ADIM 01 — Kişisel bilgiler */}
            <div className="apply-step" hidden={step !== 0} ref={(el) => { stepRefs.current[0] = el; }}>
              <TextField id="name" label="Ad Soyad" required err="Adını ve soyadını yaz."><input id="name" className="input" name="name" data-required autoComplete="name" /></TextField>
              <TextField id="birth" label="Doğum tarihi" required hint="Başvuru 18 yaş ve üzeri kişiler içindir." err="Geçerli bir doğum tarihi gir. Başvuru 18 yaş ve üzeri kişiler içindir.">
                <input id="birth" className="input" type="date" name="birth" data-required data-rule="adult" min="1900-01-01" autoComplete="bday" />
              </TextField>
              <div className="grid-2">
                <TextField id="city" label="Yaşadığın il" required err="Yaşadığın ili yaz."><input id="city" className="input" name="city" data-required autoComplete="address-level1" /></TextField>
                <TextField id="district" label="Yaşadığın ilçe" required err="Yaşadığın ilçeyi yaz."><input id="district" className="input" name="district" data-required autoComplete="address-level2" /></TextField>
              </div>
              <TextField id="phone" label="Telefon numarası" required err="Geçerli bir cep telefonu numarası gir. Örnek: 05XX XXX XX XX">
                <input id="phone" className="input" type="tel" inputMode="tel" name="phone" data-required data-rule="phone" placeholder="05XX XXX XX XX" autoComplete="tel" />
              </TextField>
              <TextField id="email" label="E-posta adresi" required err="Geçerli bir e-posta adresi gir."><input id="email" className="input" type="email" inputMode="email" name="email" data-required autoComplete="email" /></TextField>
            </div>

            {/* ADIM 02 — Seni tanıyalım */}
            <div className="apply-step" hidden={step !== 1} ref={(el) => { stepRefs.current[1] = el; }}>
              <TextField id="instagram" label="Instagram kullanıcı adın" required hint="Profilinin herkese açık olması zorunlu değil." err="Geçerli bir kullanıcı adı yaz. Örnek: @kullaniciadi">
                <input id="instagram" className="input" name="instagram" data-required data-rule="handle" placeholder="@kullaniciadi" autoCapitalize="none" autoCorrect="off" />
              </TextField>
              <TextField id="tiktok" label="TikTok kullanıcı adın" err="Geçerli bir kullanıcı adı yaz. Örnek: @kullaniciadi">
                <input id="tiktok" className="input" name="tiktok" data-rule="handle" placeholder="@kullaniciadi" autoCapitalize="none" autoCorrect="off" />
              </TextField>
              <Options name="shootExperience" type="radio" label="Daha önce profesyonel bir fotoğraf veya video çekiminde yer aldın mı?" options={SHOOT_EXPERIENCE} err="Bir seçenek işaretle." />
              <Options name="cameraFeeling" type="radio" label="Kamera karşısında kendini nasıl hissediyorsun?" options={CAMERA_FEELING} err="Bir seçenek işaretle." />
            </div>

            {/* ADIM 03 — İçerik üretimi deneyimin */}
            <div className="apply-step" hidden={step !== 2} ref={(el) => { stepRefs.current[2] = el; }}>
              <Options name="contentExperience" type="radio" label="Daha önce sosyal medya için video içeriği ürettin mi?" options={CONTENT_EXPERIENCE} err="Bir seçenek işaretle." />
              <TextField id="portfolio" label="Örnek içerik / portfolyo bağlantısı" hint="Instagram Reels, TikTok, Drive veya portfolyo bağlantısı">
                <input id="portfolio" className="input" name="portfolio" inputMode="url" autoCapitalize="none" autoCorrect="off" />
              </TextField>
              <Options name="contentTypes" type="checkbox" label="Hangi tür içeriklerde yer almak istersin?" options={CONTENT_TYPES} err="En az bir içerik türü seç." />
              <Options name="availability" type="checkbox" label="Çekimler için genel müsaitlik durumun" options={AVAILABILITY} err="En az bir seçenek işaretle." />
              <Options name="travel" type="radio" label="Yaşadığın şehir dışında gerçekleştirilen çekimlere katılabilir misin?" options={TRAVEL} err="Bir seçenek işaretle." />
            </div>

            {/* ADIM 04 — Son bir adım! */}
            <div className="apply-step" hidden={step !== 3} ref={(el) => { stepRefs.current[3] = el; }}>
              <p className="small muted">Seni kamera karşısında da tanımak istiyoruz. Profesyonel çekim gerekmiyor. Kendini tanıttığın 15–30 saniyelik doğal bir video ve yüzünün net göründüğü bir fotoğraf yeterli.</p>
              <div className="apply-upload stack-lg">
                <Upload id="photo" label="Fotoğraf yükle" icon="image" formats="JPG veya PNG · en fazla 10 MB" hint="Yüzün net göründüğü güncel fotoğraf." accept="image/jpeg,image/png" picked={photo} error={photoErr} err="Fotoğrafını seç." onPick={pickPhoto} onClear={() => setPhoto(null)} />
                <Upload id="video" label="Tanıtım videosu yükle" icon="video" formats="MP4 veya MOV · 15–30 saniye" hint="Mobil cihazla çekilebilir." accept="video/mp4,video/quicktime,.mov" picked={video} error={videoErr} err="Tanıtım videonu seç." onPick={pickVideo} onClear={() => setVideo(null)} />
                <p className="xs muted"><Icon name="lock" size={12} /> Demo: Seçtiğin dosyalar yalnızca bu cihazda önizlenir, hiçbir yere yüklenmez.</p>
              </div>
              <TextField id="notes" label="Eklemek istediğin bir şey var mı?" hint="İlgi alanları, yetenekler veya çekim deneyimi."><textarea id="notes" className="input" name="notes" /></TextField>
              <div className="field">
                <label className="check"><input type="checkbox" name="kvkk" data-required /><span><Link className="btn-link" href="/yasal" target="_blank" rel="noopener">KVKK aydınlatma metnini</Link> okudum.<Req /></span></label>
                <span className="err" role="alert">Devam etmek için KVKK aydınlatma metnini okuduğunu onayla.</span>
              </div>
              <label className="check"><input type="checkbox" name="futureContact" /><span>Gelecekteki farklı çekim fırsatları hakkında ayrıca iletişim kurulmasını istiyorum.</span></label>
            </div>

            <div className="apply-foot">
              {step > 0 ? <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(step - 1)}><Icon name="arrow-left" size={15} />Geri</button> : <span />}
              {step < STEPS.length - 1
                ? <button type="submit" className="btn btn-dark btn-lg">Devam Et <Icon name="arrow-right" size={15} /></button>
                : <button type="submit" className={'btn btn-primary btn-lg' + (busy ? ' is-loading' : '')} disabled={busy}>{busy ? <><span className="spinner" />Gönderiliyor…</> : 'BAŞVURUMU GÖNDER'}</button>}
            </div>
          </form>
        </div>
      </div></section>

      <Faq />
    </>
  );
}
