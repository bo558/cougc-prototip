'use client';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { Brief, Db, Package, Project } from '@/lib/types';
import * as R from '@/lib/domain/rules';
import { fileSize, fmtDate, tl } from '@/lib/format';
import { api } from '@/lib/api/mock-api';
import { useDb } from '@/lib/store/demo-store';
import { closeModal, toast } from '@/lib/store/ui-store';
import { Icon } from '@/components/ui/Icon';
import { Callout } from '@/components/ui/primitives';
import { Modal, useBusy } from '@/components/ui/interactive';

export function BriefDetails({ p, b }: { p: Project; b: Brief }) {
  return (
    <dl className="kv">
      <dt>Ürün</dt><dd>{p.product}<div className="xs muted">{b.productLink}</div></dd>
      <dt>Açıklama</dt><dd>{b.description}</dd>
      <dt>Öne çıkan özellikler</dt><dd>{b.features}</dd>
      <dt>Hedef kitle</dt><dd>{b.audience}</dd>
      <dt>Video hedefi</dt><dd>{b.goal} · {([] as string[]).concat(b.platforms).join(', ')}</dd>
      <dt>Format / süre</dt><dd>{b.format} · {b.duration}</dd>
      <dt>Üslup</dt><dd>{b.tone}</dd>
      <dt>Mutlaka vurgulansın</dt><dd>{b.highlights}</dd>
      <dt>Yasaklı ifadeler</dt><dd>{b.forbidden}</dd>
      <dt>Senaryo</dt><dd>{b.script}</dd>
      <dt>Referanslar</dt><dd>{b.references}</dd>
      <dt>Ekler</dt><dd>{b.attachments.length ? b.attachments.map((a) => (
        <div key={a.name} className="row-sm small" style={{ padding: '4px 0' }}><Icon name="paperclip" size={14} /><span className="strong">{a.name}</span><span className="muted">{fileSize(a.size)}</span></div>
      )) : <span className="muted-2">Ek yok</span>}</dd>
      <dt>Kargo / adres</dt><dd>{p.shipping.required ? 'Ürün gönderilecek · ' : 'Ürün gönderimi yok · '}{b.address}</dd>
      <dt>Web / sosyal</dt><dd>{b.website} · {b.social}</dd>
      <dt>Ek notlar</dt><dd>{b.notes}</dd>
    </dl>
  );
}

/** Marka hak hareketleri (satın alma, rezerv, iade) */
export function Ledger({ db, bid }: { db: Db; bid: string }) {
  const rows: { d: string; t: string; v: string; c: string }[] = [];
  db.orders.filter((o) => o.brandId === bid).forEach((o) => {
    if (o.status === 'paid' || o.status === 'refunded') rows.push({ d: o.date, t: o.no + ' · ' + R.pkgOf(db, o.packageId)!.name + ' satın alındı', v: '+' + o.videos, c: 'green' });
    if (o.status === 'refunded' && o.refund) rows.push({ d: o.refund.date + 'T12:00:00', t: o.no + ' iade edildi', v: '−' + o.videos, c: 'red' });
  });
  R.projectsOfBrand(db, bid).forEach((p) => {
    rows.push({ d: p.createdAt, t: p.no + ' brief gönderildi (rezerve)', v: '−' + p.videoCount, c: '' });
    if (p.status === 'iptal') rows.push({ d: p.events[p.events.length - 1].date, t: p.no + ' iptal — hak iadesi', v: '+' + p.videoCount, c: 'green' });
  });
  rows.sort((a, b) => b.d.localeCompare(a.d));
  return (
    <div className="table-wrap"><table className="table"><thead><tr><th>Tarih</th><th>Hareket</th><th className="t-right">Video</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}><td className="nowrap">{fmtDate(r.d)}</td><td>{r.t}</td><td className={'t-right strong ' + r.c}>{r.v}</td></tr>)}</tbody></table></div>
  );
}

/** Kargo bilgisi (marka ve admin ortak) */
export function ShipModal({ pid }: { pid: string }) {
  const db = useDb(); const p = R.projectOf(db, pid)!;
  const [busy, wrap] = useBusy();
  return (
    <Modal title="Kargo bilgisini girin" sub={`${p.product} · içerik üreticisi: ${R.creatorOf(db, p.creatorId)?.name}`}
      footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button><button className={'btn btn-primary' + (busy ? ' is-loading' : '')} disabled={busy} type="submit" form="shipForm">{busy ? <><span className="spinner" />Kaydediliyor…</> : 'Kaydet'}</button></>}>
      <form className="stack" id="shipForm" onSubmit={async (e) => {
        e.preventDefault(); const f = new FormData(e.currentTarget); const tracking = String(f.get('tracking') || '').trim();
        if (!tracking) { (e.currentTarget.elements.namedItem('tracking') as HTMLInputElement).focus(); return; }
        if (await wrap(() => api.brandShipped(pid, String(f.get('carrier')), tracking))) { closeModal(); toast('Kargo bilgisi kaydedildi', 'success', 'İçerik üreticisi ve COUGC bilgilendirildi.'); }
      }}>
        <Callout icon="pin"><b>Gönderim adresi</b><br />COUGC Operasyon · Demo Mah. Örnek Sok. No:1, Kadıköy / İstanbul<div className="xs muted mt-8">İçerik üreticisinin adres bilgisi markayla paylaşılmaz; ürün COUGC üzerinden iletilir.</div></Callout>
        <div className="grid-2">
          <div className="field"><label>Kargo firması</label><select className="input" name="carrier"><option>Demo Kargo</option><option>Diğer</option></select></div>
          <div className="field"><label>Takip numarası</label><input className="input" name="tracking" placeholder="Örn. DK1234567890" /></div>
        </div>
      </form>
    </Modal>
  );
}

/** Paket kartları. `showPrice={false}` herkese açık sayfalar ve standart marka akışı içindir; fiyat verisi korunur. */
export function PricingCards({ packages, cta, showPrice = true }: { packages: Package[]; showPrice?: boolean; cta: (pk: Package) => { href?: string; onClick?: () => void; label: string } }) {
  return (
    <div className="pricing">
      {packages.filter((p) => p.active).map((pk) => {
        const a = cta(pk);
        return (
          <div key={pk.id} className={'price-card ' + (pk.popular ? 'featured' : '')}>
            {pk.popular && <span className="pop badge no-dot" style={{ background: 'var(--orange)', color: 'var(--on-orange)' }}>En çok tercih edilen</span>}
            <h3>{pk.name}</h3><p className="desc">{pk.desc}</p>
            {showPrice ? <>
              <div className="amt">{tl(pk.price)}</div>
              <div className="per">{pk.videos} video · video başı {tl(Math.round(pk.price / pk.videos))}</div><div className="vat">KDV hariç</div>
            </> : <div className="amt amt-videos">{pk.videos} video</div>}
            <ul>
              {pk.features.map((f) => <li key={f}><Icon name="check" size={16} /><span>{f}</span></li>)}
              <li><Icon name="clock" size={16} /><span>Süre {pk.duration} · Teslim {pk.delivery}</span></li>
            </ul>
            {a.href
              ? <Link className={'btn ' + (pk.popular ? 'btn-primary' : 'btn-dark') + ' btn-lg btn-block'} href={a.href}>{a.label}</Link>
              : <button type="button" className={'btn ' + (pk.popular ? 'btn-primary' : 'btn-dark') + ' btn-lg btn-block'} onClick={a.onClick}>{a.label}</button>}
          </div>
        );
      })}
    </div>
  );
}

const checkMark = <Icon name="check" size={16} />;
const COMPARISON_ROWS: [string, (p: Package) => ReactNode][] = [
  ['Video adedi', (p) => p.videos],
  ['Video süresi', (p) => p.duration],
  ['Revize hakkı', (p) => 'Video başına ' + p.revisions],
  ['Teslim süresi', (p) => p.delivery],
  ['Format seçimi', () => '9:16 · 1:1 · 4:5'],
  ['COUGC kalite kontrolü', () => checkMark],
  ['İçerik Üreticisi tercihi', () => checkMark],
  ['Öncelikli değerlendirme', (p) => (p.videos >= 5 ? checkMark : <span className="muted-2">—</span>)]
];

/** Paket karşılaştırma tablosu; fiyat satırı yalnızca özel fiyat sayfasında açılır */
export function PackageComparison({ packages, showPrice }: { packages: Package[]; showPrice?: boolean }) {
  const pks = packages.filter((p) => p.active);
  return (
    <div className="card"><div className="table-wrap"><table className="table">
      <thead><tr><th />{pks.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
      <tbody>
        {showPrice && <tr><td className="cell-main">Fiyat (KDV hariç)</td>{pks.map((p) => <td key={p.id} className="strong">{tl(p.price)}</td>)}</tr>}
        {COMPARISON_ROWS.map(([k, fn]) => <tr key={k}><td className="muted">{k}</td>{pks.map((p) => <td key={p.id}>{fn(p)}</td>)}</tr>)}
      </tbody>
    </table></div></div>
  );
}

/** Fiyat bilgisi talebi (demo): talep Admin bildirimlerine düşer; ekip özel bağlantıyı markaya iletir. */
export function PriceRequestModal({ brandName }: { brandName?: string }) {
  const [busy, wrap] = useBusy();
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);
  if (sent) return (
    <Modal title="Talebiniz alındı" footer={<button className="btn btn-dark" onClick={closeModal}>Kapat</button>}>
      <Callout tone="green" icon="check-circle">COUGC ekibi fiyat bilgisini size özel bağlantıyla iletecek. <span className="muted">Demo: gerçek bir gönderim yapılmadı.</span></Callout>
    </Modal>
  );
  return (
    <Modal title="Fiyat bilgisi isteyin" sub="Paket fiyatlarını markanıza özel bağlantıyla paylaşıyoruz."
      footer={<><button className="btn btn-ghost" onClick={closeModal}>Vazgeç</button><button className={'btn btn-primary' + (busy ? ' is-loading' : '')} disabled={busy} type="submit" form="priceForm">{busy ? <><span className="spinner" />Gönderiliyor…</> : 'Talep gönder'}</button></>}>
      <form className="stack" id="priceForm" noValidate onSubmit={async (e) => {
        e.preventDefault();
        const name = brandName || String(new FormData(e.currentTarget).get('brand') || '').trim();
        if (!name) { setErr(true); return; }
        if (await wrap(() => api.requestPriceInfo(name))) setSent(true);
      }}>
        {brandName
          ? <p className="small muted"><b className="strong">{brandName}</b> adına fiyat bilgisi talebi COUGC ekibine iletilecek.</p>
          : <div className={'field' + (err ? ' has-error' : '')}><label htmlFor="pr-brand">Marka adı <span className="req">*</span></label><input id="pr-brand" className="input" name="brand" onInput={() => setErr(false)} autoComplete="organization" /><span className="err">Marka adını yazın.</span></div>}
        <p className="xs muted-2">Demo: Bilgi hiçbir sunucuya gönderilmez; yalnızca bu tarayıcıdaki Admin bildirimlerinde görünür.</p>
      </form>
    </Modal>
  );
}
