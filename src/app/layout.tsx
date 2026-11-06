import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/tokens.css';
import '@/styles/app.css';

// Cogros sitesinin yazı tipleri; build sırasında indirilip yerel olarak sunulur
const inter = Inter({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], weight: ['500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'COUGC Prototip', template: '%s · COUGC Prototip' },
  description: 'COUGC UGC platformu — etkileşimli arayüz prototipi (demo).',
  robots: { index: false, follow: false },
  // Site simgesi yok: tarayıcının alan adı kökünden favicon.ico isteyip 404 almasını önler
  icons: { icon: 'data:,' }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0c1411' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
