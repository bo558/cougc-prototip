import { Suspense } from 'react';
import { PublicChrome } from '@/components/layout/PublicChrome';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PublicChrome><Suspense>{children}</Suspense></PublicChrome>;
}
