'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fmtDate, fmtDateTime, initials, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { openModal, toast } from '@/lib/store/ui-store';
import { useCrumbs } from '@/hooks/nav';
import { Icon } from '@/components/ui/Icon';
import { Badge, Callout, PageHead, Tabs } from '@/components/ui/primitives';
import { CouponModal, demoToast, PackageModal } from '@/components/admin/modals';

const TABS = [
  { key: 'paketler', label: 'Paketler & fiyatlar', href: '/admin/ayarlar' }, { key: 'kuponlar', label: 'Kuponlar', href: '/admin/ayarlar?tab=kuponlar' },
  { key: 'kurallar', label: 'Süreç kuralları', href: '/admin/ayarlar?tab=kurallar' }, { key: 'bildirim', label: 'Bildirimler', href: '/admin/ayarlar?tab=bildirim' },
  { key: 'ekip', label: 'Ekip & yetkiler', href: '/admin/ayarlar?tab=ekip' }, { key: 'log', label: 'İşlem geçmişi', href: '/admin/ayarlar?tab=log' }
];
const EVENTS = [['Ödeme onaylandı', 'Marka, Admin'], ['Yeni brief', 'Admin'], ['Yeni teklif', 'İçerik Üreticisi'], ['Teklif kabul/ret', 'Admin'], ['Proje kesinleşti', 'Marka, İçerik Üreticisi'], ['Video yüklendi', 'Admin'],
  ['Video incelemeye hazır', 'Marka'], ['Revize talebi', 'İçerik Üreticisi, Admin'], ['Teslim tarihi yaklaşıyor', 'İçerik Üreticisi'], ['Teslim gecikti', 'Admin'], ['Hak ediş ödendi', 'İçerik Üreticisi']];
const PRICE_PATH = '/fiyat-bilgisi/';

/** Özel fiyat bağlantısını yayınlanan adrese göre üretip panoya kopyalar */
async function copyPriceLink() {
  const url = window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH || '') + PRICE_PATH;
  try { await navigator.clipboard.writeText(url); toast('Bağlantı kopyalandı', 'success', url); }
  catch { toast('Bağlantı kopyalanamadı', 'error', url); }
}

const TEAM = [['Operasyon Ekibi', 'operasyon@cougc.demo', 'Süper admin'], ['Finans', 'finans@cougc.demo', 'Finans (ödeme, iade, hak ediş)'], ['İçerik Üreticisi İlişkileri', 'icerik@cougc.demo', 'Operasyon (içerik üreticisi, proje)']];

export default function SettingsPage() {
  useCrumbs([{ t: 'Ayarlar' }]);
  const db = useDb();
  const tab = useSearchParams().get('tab') || 'paketler';
  let body: React.ReactNode;
  if (tab === 'paketler') body = (
    <div className="card-body">
      <div className="grid-3">{db.packages.map((pk) => (
        <div key={pk.id} className="card card-pad stack-sm" style={{ borderRadius: 'var(--r-md)' }}>
          <div className="row between"><b className="strong">{pk.name}</b>{pk.active ? <Badge tone="green">Satışta</Badge> : <Badge>Kapalı</Badge>}</div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>{tl(pk.price)}</div>
          <div className="small muted">{pk.videos} video · video başına {pk.revisions} revize · {pk.delivery}</div>
          <button className="btn btn-ghost btn-sm mt-8" onClick={() => openModal(<PackageModal id={pk.id} />)}><Icon name="edit" size={14} />Düzenle</button>
        </div>
      ))}</div>
      <Callout className="mt-16">Fiyat değişiklikleri yalnızca <b>yeni siparişlere</b> uygulanır; mevcut siparişler satın alındığı andaki fiyat ve haklarla korunur. Tüm değişiklikler işlem geçmişine yazılır.</Callout>
      <div className="card card-pad stack-sm mt-16" style={{ borderRadius: 'var(--r-md)' }}>
        <b className="strong">Özel fiyat sayfası</b>
        <p className="small muted">Herkese açık sayfalarda ve standart marka akışında fiyat gösterilmez. Fiyat bilgisi isteyen markalara bu bağlantıyı gönderin; sayfa hiçbir menüde yer almaz.</p>
        <div className="row-sm row-wrap"><button className="btn btn-dark btn-sm" onClick={copyPriceLink}><Icon name="copy" size={14} />Bağlantıyı kopyala</button><Link className="btn btn-ghost btn-sm" href={PRICE_PATH}><Icon name="eye" size={14} />Önizle</Link></div>
        <Callout tone="amber" icon="alert" className="small mt-8">Bağlantı erişim güvenliği sağlamaz: adresi bilen herkes sayfayı açabilir. Gerçek yayında şifreli veya süreli erişim önerilir.</Callout>
        <div className="row between mt-8"><div><b className="strong small">Marka panelinde fiyatları göster</b><div className="xs muted">Kapalıyken marka “Paketler” ekranında fiyat yerine “Fiyat bilgisi iste” görünür. Satın alma ve hesaplama işlevleri korunur.</div></div>
          <label className="switch"><input type="checkbox" aria-label="Marka panelinde fiyatları göster" checked={db.settings.showPanelPrices} onChange={async (e) => { const v = e.target.checked; await api.setPanelPrices(v); toast(v ? 'Fiyatlar marka panelinde açıldı' : 'Fiyatlar marka panelinde kapatıldı', 'info'); }} /><span /></label></div>
      </div>
    </div>
  );
  else if (tab === 'kuponlar') body = (
    <>
      <div className="toolbar" style={{ justifyContent: 'flex-end' }}><button className="btn btn-dark btn-sm" onClick={() => openModal(<CouponModal />)}><Icon name="plus" size={14} />Kupon oluştur</button></div>
      <div className="table-wrap"><table className="table"><thead><tr><th>Kod</th><th>İndirim</th><th>Kullanım</th><th>Geçerlilik</th><th className="t-center">Aktif</th></tr></thead>
        <tbody>{db.coupons.map((c) => (
          <tr key={c.code}><td className="cell-main mono">{c.code}</td><td>{c.type === 'percent' ? '%' + c.value : tl(c.value)}</td><td>{c.uses} / {c.limit}</td><td>{fmtDate(c.until)}</td>
            <td className="t-center"><label className="switch"><input type="checkbox" checked={c.active} onChange={async () => { await api.toggleCoupon(c.code); toast('Kupon ' + (!c.active ? 'aktif' : 'pasif'), 'info'); }} /><span /></label></td></tr>
        ))}</tbody></table></div>
    </>
  );
  else if (tab === 'kurallar') body = (
    <div className="card-body stack">
      {[['Marka vitrini içerik üreticisi sayısı', db.settings.showcaseSize + ' içerik üreticisi', 'Markaya gösterilecek önerilen içerik üreticisi sayısı.'],
        ['İçerik üreticisi seçimi', 'Görüşme sonucunda', 'Marka tercih eder, COUGC değerlendirip önerir; nihai seçim görüşmede belirlenir.'],
        ['İçerik Üreticisi teklif yanıt süresi', '3 gün', 'Süre dolan teklif otomatik geri çekilir ve COUGC’ye bildirim gider.'],
        ['Marka onay süresi', db.settings.autoApproveDays + ' gün', 'Süre sonunda markaya hatırlatma yapılması öngörülür.'],
        ['Hak rezervasyonu', 'Brief gönderiminde', 'Kesinleşince kullanılır; ret/iptal durumunda markaya iade edilir.'],
        ['Video dosya limiti', 'MP4 / MOV · 2 GB', 'Tür ve boyut sunucu tarafında da doğrulanır.']].map((r) => (
        <div key={r[0]} className="row between" style={{ padding: '6px 0', borderBottom: '1px solid var(--line-2)' }}><div><b className="strong small">{r[0]}</b><div className="xs muted">{r[2]}</div></div><span className="tag">{r[1]}</span></div>
      ))}
      <p className="xs muted-2"><Icon name="info" size={12} /> Bu kurallar prototip için örnektir. Zamanlanmış hatırlatmalar, otomatik işlemler ve sunucu tarafı doğrulama prototipte çalışmaz.</p>
    </div>
  );
  else if (tab === 'bildirim') body = (
    <div className="table-wrap"><table className="table"><thead><tr><th>Olay</th><th>Alıcılar</th><th className="t-center">Uygulama içi</th><th className="t-center">E-posta</th></tr></thead>
      <tbody>{EVENTS.map((x) => <tr key={x[0]}><td className="cell-main">{x[0]}</td><td className="muted">{x[1]}</td>
        <td className="t-center"><label className="switch"><input type="checkbox" defaultChecked /><span /></label></td><td className="t-center"><label className="switch"><input type="checkbox" defaultChecked /><span /></label></td></tr>)}</tbody></table></div>
  );
  else if (tab === 'ekip') body = (
    <>
      {TEAM.map((u) => <div key={u[1]} className="list-row"><span className="avatar">{initials(u[0])}</span><div className="lr-main"><div className="lr-t">{u[0]}</div><div className="lr-s">{u[1]}</div></div><Badge dot={false}>{u[2]}</Badge></div>)}
      <div className="card-foot"><span className="xs muted"><Icon name="shield" size={12} /> Prototipte gerçek giriş ve iki adımlı doğrulama yoktur.</span><button className="btn btn-ghost btn-sm" onClick={() => demoToast('Ekip daveti simüle edildi')}>Üye davet et</button></div>
    </>
  );
  else body = (
    <div className="table-wrap"><table className="table responsive"><thead><tr><th>Zaman</th><th>Kullanıcı</th><th>İşlem</th><th>Kayıt</th></tr></thead>
      <tbody>{db.audit.map((a, i) => <tr key={i}><td data-l="Zaman" className="nowrap">{fmtDateTime(a.date)}</td><td data-l="Kullanıcı">{a.actor}<div className="cell-sub">{a.role}</div></td><td data-l="İşlem" className="td-main">{a.action}</td><td data-l="Kayıt" className="muted">{a.target}</td></tr>)}</tbody></table></div>
  );
  return (
    <div className="page">
      <PageHead title="Ayarlar" sub="Paketler, kurallar, bildirimler ve yetkiler" />
      <div className="card"><div style={{ padding: '0 12px' }}><Tabs items={TABS} active={tab} /></div>{body}</div>
    </div>
  );
}
