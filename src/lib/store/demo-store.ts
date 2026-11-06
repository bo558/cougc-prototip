'use client';
/* ==========================================================================
   Demo durumu: tek kaynak (Db). Tarayıcının localStorage'ında saklanır;
   "Demoyu sıfırla" ile seed'e döner. Gerçek uygulamada yerini sunucu + veritabanı alır.
   ========================================================================== */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Db, Role } from '../types';
import { SEED, DEMO_USERS } from '../mock/seed';
import { shiftDemoDates } from '../mock/dates';
import { iso, now, TODAY, uid } from '../format';

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
/** Başlangıç verisi: tarihler ziyaret gününe kaydırılmış */
const freshDb = () => shiftDemoDates(clone(SEED), iso(TODAY));

interface DemoState { db: Db }
// github.io alan adı aynı kullanıcının tüm Pages projelerinde ortak localStorage kullanır → özgül anahtar
export const STORAGE_KEY = 'cougc-prototip-demo';

export const useDemo = create<DemoState>()(
  persist((): DemoState => ({ db: freshDb() }), {
    name: STORAGE_KEY,
    version: SEED.version,
    // Şema değiştiğinde eski demo durumu atılır ve başlangıç verisine dönülür
    migrate: () => ({ db: freshDb() }),
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
    // "hydrated" bayrağı kalıcı store'da DEĞİL: aksi halde her yüklemede veri depoya yeniden yazılır
    // ve aynı anda açık başka sekmelerin değişikliklerini ezebilirdi.
    onRehydrateStorage: () => (state) => {
      // Demo önceki bir gün açıldıysa veriler bozulmadan bugüne taşınır
      if (state && state.db.demoDay !== iso(TODAY)) useDemo.setState({ db: shiftDemoDates(clone(state.db), iso(TODAY)) });
      useHydration.setState({ hydrated: true });
    }
  })
);
const useHydration = create<{ hydrated: boolean }>(() => ({ hydrated: false }));

/** Db üzerinde değişiklik: kopya üzerinde çalışır, sonra tek seferde yazar (immutability) */
export function commit<T>(fn: (db: Db) => T): T {
  const db = clone(useDemo.getState().db);
  const r = fn(db);
  useDemo.setState({ db });
  return r;
}

export function resetDemo() {
  const role = useDemo.getState().db.session.role;
  const db = freshDb();
  db.session.role = role;
  useDemo.setState({ db });
}

/** Seçici kancası: bileşenler yalnızca ihtiyaç duyduğu veriye abone olur */
export const useDb = () => useDemo((s) => s.db);
export const useRole = () => useDemo((s) => s.db.session.role);
export const useHydrated = () => useHydration((s) => s.hydrated);

export const BRAND_ID = DEMO_USERS.brand.brandId;
export const CREATOR_ID = DEMO_USERS.creator.creatorId;
export { DEMO_USERS };

export function meKey(role: Role | null) {
  if (role === 'admin') return 'admin';
  if (role === 'brand') return 'brand:' + BRAND_ID;
  if (role === 'creator') return 'creator:' + CREATOR_ID;
  return null;
}

// --- Mutasyon yardımcıları (api katmanı kullanır) ---
export function notify(db: Db, to: string, text: string, link: string, strong?: string) {
  db.notifications.unshift({ id: uid('n'), to, strong, text: strong ? '{strong}' + text : text, link, date: now(), read: false });
}
export function audit(db: Db, action: string, target: string) {
  const role = db.session.role;
  const u = role ? DEMO_USERS[role] : null;
  const roleLabel = role ? { admin: 'Admin', brand: 'Marka', creator: 'İçerik Üreticisi' }[role] : 'Sistem';
  db.audit.unshift({ date: now(), actor: u ? u.name + (role === 'admin' ? ' (Admin)' : '') : 'Sistem', role: roleLabel, action, target });
}
