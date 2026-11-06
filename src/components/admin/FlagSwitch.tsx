'use client';
import type { Creator } from '@/lib/types';
import { api } from '@/lib/api/mock-api';
import { errorMessage } from '@/lib/api/errors';
import { toast } from '@/lib/store/ui-store';

/** Görünür / vitrin anahtarı — liste ve detay sayfası ortak kullanır */
export function FlagSwitch({ c, flag, title }: { c: Creator; flag: 'visible' | 'showcase'; title: string }) {
  return (
    <label className="switch" title={title} onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={c[flag]} onChange={async (e) => {
        try { await api.setCreatorFlag(c.id, flag, e.target.checked); toast((flag === 'visible' ? 'Görünürlük' : 'Vitrin') + ' güncellendi', 'success', c.name); }
        catch (err) { toast(errorMessage(err), 'error'); }
      }} /><span />
    </label>
  );
}
