import Link from 'next/link';
import { PublicChrome } from '@/components/layout/PublicChrome';
import { EmptyState } from '@/components/ui/primitives';

export default function NotFound() {
  return (
    <PublicChrome>
      <section className="sec"><div className="container">
        <EmptyState icon="search" title="Sayfa bulunamadı" text="Aradığınız sayfa taşınmış veya hiç var olmamış olabilir." action={<Link className="btn btn-dark" href="/">Ana sayfaya dön</Link>} />
      </div></section>
    </PublicChrome>
  );
}
