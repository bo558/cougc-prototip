'use client';
import * as R from '@/lib/domain/rules';
import { initials } from '@/lib/format';
import { formValues } from '@/lib/forms';
import { api } from '@/lib/api/mock-api';
import { BRAND_ID, useDb } from '@/lib/store/demo-store';
import { toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { BrandLogo } from '@/components/ui/media';
import { Badge, PageHead } from '@/components/ui/primitives';
import { useBusy } from '@/components/ui/interactive';
import { demoToast } from '@/components/admin/modals';

export default function BrandProfile() {
  useCrumbs([{ t: 'Firma profili' }]);
  const db = useDb(); const b = R.brandOf(db, BRAND_ID);
  const [busy, wrap] = useBusy();
  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <PageHead title="Firma profili" sub="Şirket, fatura ve kullanıcı bilgileri" />
      <form className="stack-lg" onSubmit={async (e) => {
        e.preventDefault(); const v = formValues(e.currentTarget) as Record<string, string>;
        if (await wrap(() => api.updateBrandProfile(v))) toast('Firma bilgileri güncellendi');
      }}>
        <div className="card"><div className="card-head"><h3>Şirket</h3></div><div className="card-body stack">
          <div className="row"><BrandLogo b={b} size="lg" /><div><b className="strong">{b.name}</b><div className="small muted">{b.sector} · {b.city}</div></div>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => demoToast('Logo yükleme simüle edildi')}>Logo yükle</button></div>
          <div className="grid-2"><div className="field"><label>Web sitesi</label><input className="input" name="website" defaultValue={b.website} /></div><div className="field"><label>Instagram</label><input className="input" name="instagram" defaultValue={b.instagram} /></div></div>
          <div className="grid-2"><div className="field"><label>Yetkili</label><input className="input" name="contactName" defaultValue={b.contact.name} /></div><div className="field"><label>Telefon</label><input className="input" name="phone" defaultValue={b.contact.phone} /></div></div>
        </div></div>
        <div className="card"><div className="card-head"><h3>Fatura bilgileri</h3></div><div className="card-body stack">
          <div className="field"><label>Ünvan</label><input className="input" name="billingTitle" defaultValue={b.billing.title} /></div>
          <div className="grid-2"><div className="field"><label>Vergi dairesi</label><input className="input" name="taxOffice" defaultValue={b.billing.taxOffice} /></div><div className="field"><label>Vergi numarası</label><input className="input" name="taxNo" defaultValue={b.billing.taxNo} /></div></div>
          <div className="field"><label>Adres</label><input className="input" name="address" defaultValue={b.billing.address} /></div>
        </div>
          <div className="card-foot"><span className="xs muted">Değişiklikler yeni faturalara uygulanır.</span>
            <button className={'btn btn-dark' + (busy ? ' is-loading' : '')} type="submit" disabled={busy}>{busy ? <><span className="spinner" />Kaydediliyor…</> : 'Kaydet'}</button></div></div>
      </form>
      <div className="card mt-24"><div className="card-head"><h3>Kullanıcılar</h3><button className="btn btn-ghost btn-sm" onClick={() => demoToast('Kullanıcı daveti simüle edildi')}><Icon name="plus" size={14} />Kullanıcı davet et</button></div>
        {b.users.map((u) => <div key={u.email} className="list-row"><span className="avatar">{initials(u.name)}</span><div className="lr-main"><div className="lr-t">{u.name}</div><div className="lr-s">{u.email}</div></div><Badge dot={false}>{u.role}</Badge></div>)}</div>
      <div className="card mt-24"><div className="card-head"><h3>Gizlilik ve veriler</h3></div><div className="card-body row row-wrap between">
        <p className="small muted" style={{ maxWidth: 520 }}>KVKK kapsamındaki haklarınız için verilerinizin bir kopyasını isteyebilir veya hesabınızın silinmesini talep edebilirsiniz. Yasal saklama yükümlülükleri saklıdır.</p>
        <div className="row-sm"><button className="btn btn-ghost btn-sm" onClick={() => demoToast('Veri dışa aktarma talebi simüle edildi')}>Verilerimi indir</button><button className="btn btn-danger-ghost btn-sm" onClick={() => demoToast('Hesap silme talebi simüle edildi')}>Hesap silme talebi</button></div>
      </div></div>
    </div>
  );
}
