import type { NextConfig } from 'next';

/**
 * Statik export (GitHub Pages).
 * - Proje sitesi alt dizinde yayınlanır: https://<kullanıcı>.github.io/<repo>/
 *   Bu nedenle NEXT_PUBLIC_BASE_PATH="/<repo>" ile derlenir (GitHub Actions bunu otomatik verir).
 *   Yerelde boş bırakılır → http://localhost:3000/
 * - Sunucu gerektiren özellikler (headers, rewrites, image optimization, server actions) kullanılmaz.
 * - Arama motoru engeli: X-Robots-Tag başlığı statik barındırmada verilemediği için
 *   her sayfada <meta name="robots" content="noindex, nofollow"> kullanılır (app/layout.tsx).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  // /admin → /admin/index.html: sayfa yenilemede statik sunucu doğru dosyayı bulur
  trailingSlash: true,
  // Statik barındırmada görsel optimizasyon sunucusu yok
  images: { unoptimized: true },
  reactStrictMode: true,
  // Sunumda sol alttaki Next.js geliştirme rozeti görünmesin
  devIndicators: false
};

export default nextConfig;
