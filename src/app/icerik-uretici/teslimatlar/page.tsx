'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/primitives';

// Teslimatlar, "İşlerim" ekranındaki sekmede listelenir.
// Statik export'ta sunucu yönlendirmesi olmadığı için yönlendirme istemcide yapılır.
export default function CreatorDeliveries() {
  const router = useRouter();
  useEffect(() => { router.replace('/icerik-uretici/isler?tab=teslim'); }, [router]);
  return <Skeleton />;
}
