'use client';
import { useEffect } from 'react';
import { STORAGE_KEY, useDemo } from '@/lib/store/demo-store';
import { ModalHost, Toaster } from '@/components/ui/interactive';

/**
 * Demo durumunu localStorage'dan yükler (sunucu ve ilk istemci render'ı seed ile aynı kalır).
 * Sekmeler arası senkron: bir sekmede yapılan işlem (ör. Admin teklif gönderdi) diğer sekmelere
 * (ör. İçerik Üreticisi paneli) anında yansır — sunumda paneller yan yana açılabilir.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useDemo.persist.rehydrate();
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) useDemo.persist.rehydrate(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return (
    <>
      {children}
      <ModalHost />
      <Toaster />
    </>
  );
}
