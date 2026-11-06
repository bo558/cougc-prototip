'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/types';
import { api } from '@/lib/api/mock-api';
import { DEMO_USERS } from '@/lib/store/demo-store';
import { closeModal, openModal, toast } from '@/lib/store/ui-store';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/interactive';

/** Herkese açık demoda verilerin kurgusal olduğunu açıkça belirten uyarı */
export const DISCLAIMER = 'Tüm marka, kişi, sipariş ve proje bilgileri kurgusaldır · Gerçek ödeme, kayıt veya dosya yüklemesi yapılmaz.';

/** Üstteki koyu şerit: prototip uyarısı + panel geçişi + demo sıfırlama */
export function DemoBar({ panel }: { panel: 'public' | Role }) {
  const router = useRouter();
  const go = async (role: Role) => { await api.login(role); router.push(DEMO_USERS[role].home); };
  const item = (role: Role, label: string) => (
    <Link href={DEMO_USERS[role].home} className={panel === role ? 'on' : ''} onClick={(e) => { e.preventDefault(); go(role); }}>{label}</Link>
  );
  return (
    <div className="demobar" role="note" title={DISCLAIMER}>
      <span className="dot" /><b>PROTOTİP</b>
      <span className="demobar-text">{DISCLAIMER}</span>
      <span className="sep" />
      <nav aria-label="Demo paneller">
        <Link className={panel === 'public' ? 'on' : ''} href="/">Site</Link>
        {item('admin', 'Admin')}{item('brand', 'Marka')}{item('creator', 'İçerik Üreticisi')}
      </nav>
      <span className="sep" />
      <button onClick={() => openModal(<ResetModal />)} title="Tüm demo verilerini başlangıç durumuna döndür">
        <Icon name="refresh" size={12} /><span className="reset-label">Sıfırla</span>
      </button>
    </div>
  );
}

function ResetModal() {
  return (
    <Modal
      title="Demoyu sıfırla"
      sub="Prototipte yaptığınız tüm işlemler (satın alma, brief, onay, yükleme vb.) silinir ve demo veriler başlangıç durumuna döner."
      footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button>
        <button className="btn btn-dark" onClick={() => { api.reset(); closeModal(); toast('Demo veriler sıfırlandı'); }}>Sıfırla</button></>}
    />
  );
}
