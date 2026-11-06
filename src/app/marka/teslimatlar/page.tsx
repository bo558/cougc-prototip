'use client';
import * as R from '@/lib/domain/rules';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHead } from '@/components/ui/primitives';
import { DeliveryItem } from '@/components/brand/parts';
import { downloadToast } from '@/components/shared/video';

export default function Deliveries() {
  useCrumbs([{ t: 'Teslimatlar' }]);
  const db = useDb();
  const items = R.projectsOfBrand(db, BRAND_ID).flatMap((p) => p.videos.filter((v) => v.status === 'onaylandi').map((v) => ({ p, v })))
    .sort((a, b) => (b.v.approvedAt || '').localeCompare(a.v.approvedAt || ''));
  return (
    <div className="page">
      <PageHead title="Teslimatlar" sub={items.length + ' onaylanmış final video'} actions={items.length > 0 && <button className="btn btn-dark" onClick={downloadToast}><Icon name="download" size={15} />Tümünü indir (ZIP)</button>} />
      {items.length ? <div className="dl-grid">{items.map(({ p, v }) => <DeliveryItem key={p.id + v.no} db={db} p={p} v={v} />)}</div>
        : <div className="card"><EmptyState icon="download" title="Henüz teslim edilmiş video yok" text="Onayladığınız videoların final dosyaları burada listelenir." /></div>}
      <p className="xs muted-2 mt-24"><Icon name="lock" size={12} /> Dosyalar yalnızca şirketinizin yetkili kullanıcılarına, kısa süreli güvenli bağlantılarla sunulur.</p>
    </div>
  );
}
