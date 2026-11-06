'use client';
/* Marka tercihleri: markanın "Tercih Et" ile ilettiği içerik üreticileri.
   Tercih bir atama değildir; durum alanı yalnızca COUGC ekibinin değerlendirme kaydıdır. */
import Link from 'next/link';
import type { CreatorPreference, Db, PreferenceStatus } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { PREFERENCE_STATUS } from '@/lib/domain/status';
import { ago } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { openModal, toast } from '@/lib/store/ui-store';
import { Avatar, BrandLogo } from '@/components/ui/media';
import { Badge } from '@/components/ui/primitives';
import { availTone, CreatorProfileModal } from '@/components/shared/creator';

const ORDER: PreferenceStatus[] = ['yeni', 'inceleniyor', 'onerildi', 'gorusme', 'secildi', 'uygun_degil'];

export function PreferenceStatusSelect({ x, label }: { x: CreatorPreference; label: string }) {
  return (
    <select className="input input-sm pref-status" aria-label={label} value={x.status} onChange={async (e) => {
      const next = e.target.value as PreferenceStatus;
      await api.setPreferenceStatus(x.id, next);
      toast('Tercih durumu güncellendi', 'success', next === 'onerildi' ? 'Marka bilgilendirildi. Nihai seçim görüşmede belirlenir.' : PREFERENCE_STATUS[next].label);
    }}>
      {/* Nihai seçim yalnızca proje ekranından kaydedilir (öneri → görüşme → sonuç akışı atlanmasın diye) */}
      {ORDER.filter((s) => s !== 'secildi' || x.status === 'secildi').map((s) => <option key={s} value={s}>{PREFERENCE_STATUS[s].label}</option>)}
    </select>
  );
}

export function PreferenceTable({ db, list }: { db: Db; list: CreatorPreference[] }) {
  return (
    <div className="table-wrap"><table className="table responsive">
      <thead><tr><th>Marka</th><th>Tercih edilen içerik üreticisi</th><th>Tercih zamanı</th><th>Proje</th><th>Değerlendirme durumu</th><th /></tr></thead>
      <tbody>{list.map((x) => {
        const b = R.brandOf(db, x.brandId); const c = R.creatorOf(db, x.creatorId)!; const p = x.projectId ? R.projectOf(db, x.projectId) : undefined;
        return (
          <tr key={x.id}>
            <td className="td-main"><div className="row-sm"><BrandLogo b={b} size="sm" /><span className="cell-main">{b.name}</span></div></td>
            <td data-l="İçerik Üreticisi"><div className="row-sm"><Avatar c={c} size="sm" /><div><div className="strong small">{c.name}</div><div className="cell-sub">{c.city} · <Badge tone={availTone(c.avail)} dot={false}>{c.avail}</Badge></div></div></div></td>
            <td data-l="Tercih zamanı" className="nowrap">{ago(x.date)}</td>
            <td data-l="Proje">{p ? <Link className="btn-link small" href={'/admin/projeler/' + p.id}>{p.no}</Link> : <span className="muted-2 small">Henüz brief yok</span>}</td>
            <td data-l="Durum"><PreferenceStatusSelect x={x} label={b.name + ' → ' + c.name + ' değerlendirme durumu'} /></td>
            <td className="t-right"><button className="btn btn-ghost btn-sm" onClick={() => openModal(<CreatorProfileModal id={c.id} role="admin" />)}>Profil</button></td>
          </tr>
        );
      })}</tbody>
    </table></div>
  );
}
