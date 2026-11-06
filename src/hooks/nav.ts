'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useUI } from '@/lib/store/ui-store';

/** Mevcut sorgu parametrelerini koruyarak bir/birkaç parametreyi değiştiren link üretir */
export function useQueryHref() {
  const pathname = usePathname();
  const sp = useSearchParams();
  return (patch: Record<string, string | number | null | undefined>) => {
    const q = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => { if (v == null || v === '') q.delete(k); else q.set(k, String(v)); });
    const s = q.toString();
    return pathname + (s ? '?' + s : '');
  };
}

export function useQuery() {
  const sp = useSearchParams();
  return (k: string) => sp.get(k) || '';
}

export interface Crumb { t: string; h?: string }
/** Sayfa, panel üst çubuğundaki breadcrumb'ı bu kancayla bildirir */
export function useCrumbs(crumbs: Crumb[]) {
  const key = JSON.stringify(crumbs);
  useEffect(() => {
    const list: Crumb[] = JSON.parse(key);
    useUI.setState({ crumbs: list });
    if (list.length) document.title = list[list.length - 1].t + ' · COUGC Prototip';
  }, [key]);
}

/** Genel site sayfaları için sekme başlığı */
export function useTitle(title: string) {
  useEffect(() => { document.title = title + ' · COUGC Prototip'; }, [title]);
}

export { useRouter, usePathname };
