/* Hafif form yardımcıları (kontrolsüz formlar için).
   Zorunlu alanlar `data-required`, biçim kuralları `data-rule` ile işaretlenir; hata mesajı `.field .err` içinde gösterilir.
   `data-rule` tek başına kullanıldığında alan isteğe bağlıdır: yalnızca doluysa denetlenir.
   Gerçek uygulamada şema tabanlı doğrulama (ör. zod) ile sunucu tarafında da tekrarlanmalıdır. */

/** Doğum tarihinden (YYYY-MM-DD) bugünkü yaşı hesaplar; geçersiz tarihte null döner */
export function ageFrom(birth: string, today = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (y < 1900) return null;
  const hadBirthday = today.getMonth() + 1 > mo || (today.getMonth() + 1 === mo && today.getDate() >= d);
  const age = today.getFullYear() - y - (hadBirthday ? 0 : 1);
  return age < 0 ? null : age;
}

const RULES: Record<string, (v: string) => boolean> = {
  /** Türkiye cep telefonu: 05XX XXX XX XX (boşluklu/boşluksuz, +90 ile veya başında 0 olmadan) */
  phone: (v) => /^(\+?90)?0?5\d{9}$/.test(v.replace(/[\s()-]/g, '')),
  /** Instagram / TikTok kullanıcı adı: başında @ olabilir */
  handle: (v) => /^@?[a-zA-Z0-9._]{1,30}$/.test(v.trim()),
  adult: (v) => { const a = ageFrom(v); return a !== null && a >= 18; }
};

export function validateForm(form: HTMLElement) {
  let first: HTMLElement | null = null;
  form.querySelectorAll<HTMLInputElement>('[data-required],[data-rule]').forEach((inp) => {
    const field = inp.closest('.field');
    const value = String(inp.value || '').trim();
    let bad: boolean;
    if (inp.type === 'checkbox') bad = !inp.checked;
    else if (inp.dataset.group) bad = !form.querySelector(`input[name="${inp.dataset.group}"]:checked`);
    else bad = 'required' in inp.dataset && !value;
    if (inp.type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) bad = true;
    const rule = inp.dataset.rule && RULES[inp.dataset.rule];
    if (rule && value && !rule(value)) bad = true;
    field?.classList.toggle('has-error', bad);
    inp.setAttribute('aria-invalid', String(bad));
    if (bad && !first) first = inp;
  });
  if (first) {
    const inp = first as HTMLInputElement;
    const field = inp.closest<HTMLElement>('.field');
    // Gizli işaret alanları (seçim grupları, dosya) odak alamaz: alandaki ilk etkileşimli öğeye geç
    const target = inp.type === 'hidden' ? field?.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea,button') : inp;
    target?.focus({ preventScroll: true });
    (field || inp).scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  return !first;
}

/** Hata durumundaki alana yazılınca hatayı temizler (form onInput'una bağlanır) */
export function clearFieldError(e: { target: EventTarget }) {
  (e.target as HTMLElement).closest('.field.has-error')?.classList.remove('has-error');
}

export function formValues(form: HTMLFormElement) {
  const o: Record<string, string | string[]> = {};
  new FormData(form).forEach((v, k) => {
    if (typeof v !== 'string') return; // dosyalar kaydedilmez
    if (k in o) o[k] = ([] as string[]).concat(o[k], v); else o[k] = v;
  });
  return o;
}
export const asList = (v: string | string[] | undefined) => (v == null ? [] : ([] as string[]).concat(v));
export const asStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v || '');
