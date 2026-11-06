/* Durum sözlükleri: etiket + renk tonu (brand = marka paneline özel etiket) */
import type { OfferStatus, OrderStatus, PayoutStatus, PreferenceStatus, ProjectStatus, ShippingStatus, StatusDef, VideoStatus } from '../types';

export const PROJECT_STATUS: Record<ProjectStatus, StatusDef> = {
  taslak:            { label: 'Taslak', tone: 'gray', brand: 'Taslak' },
  admin_incelemesi:  { label: 'COUGC incelemesinde', tone: 'amber', brand: 'İnceleniyor' },
  teklif_gonderildi: { label: 'İçerik Üreticisi yanıtı bekleniyor', tone: 'blue', brand: 'İçerik Üreticisi seçimi' },
  kesinlestirme:     { label: 'Kesinleştirme bekliyor', tone: 'amber', brand: 'İçerik Üreticisi seçimi' },
  kargo:             { label: 'Ürün bekleniyor', tone: 'blue', brand: 'Ürün bekleniyor' },
  uretimde:          { label: 'Çekimde', tone: 'violet', brand: 'Çekimde' },
  teslim:            { label: 'Teslim sürecinde', tone: 'orange', brand: 'Teslim sürecinde' },
  tamamlandi:        { label: 'Tamamlandı', tone: 'green', brand: 'Tamamlandı' },
  iptal:             { label: 'İptal edildi', tone: 'red', brand: 'İptal edildi' }
};

export const VIDEO_STATUS: Record<VideoStatus, StatusDef> = {
  bekleniyor:     { label: 'Yükleme bekleniyor', tone: 'gray', brand: 'Hazırlanıyor' },
  admin_kontrol:  { label: 'COUGC kontrolünde', tone: 'amber', brand: 'Kalite kontrolünde' },
  marka_inceleme: { label: 'Marka incelemesinde', tone: 'blue', brand: 'Onayınızı bekliyor' },
  revize:         { label: 'Revize istendi', tone: 'orange', brand: 'Revize ediliyor' },
  onaylandi:      { label: 'Onaylandı', tone: 'green', brand: 'Onaylandı' }
};

export const ORDER_STATUS: Record<OrderStatus, StatusDef> = {
  paid:     { label: 'Ödendi', tone: 'green' },
  pending:  { label: 'Ödeme bekleniyor', tone: 'amber' },
  failed:   { label: 'Başarısız', tone: 'red' },
  refunded: { label: 'İade edildi', tone: 'gray' }
};

export const PAYOUT_STATUS: Record<PayoutStatus, StatusDef> = {
  olusmadi: { label: 'Proje sürüyor', tone: 'gray' },
  odenecek: { label: 'Ödenecek', tone: 'amber' },
  odendi:   { label: 'Ödendi', tone: 'green' }
};

export const OFFER_STATUS: Record<OfferStatus, StatusDef> = {
  pending:   { label: 'Yanıt bekleniyor', tone: 'blue' },
  accepted:  { label: 'Kabul edildi', tone: 'green' },
  rejected:  { label: 'Reddedildi', tone: 'red' },
  withdrawn: { label: 'Geri çekildi', tone: 'gray' }
};

export const SHIPPING_STATUS: Record<ShippingStatus, StatusDef> = {
  bekleniyor:    { label: 'Kargo bekleniyor', tone: 'gray' },
  kargoda:       { label: 'Kargoda', tone: 'blue' },
  teslim_alindi: { label: 'İçerik üreticisi teslim aldı', tone: 'green' },
  gerekmiyor:    { label: 'Kargo gerekmiyor', tone: 'gray' }
};

/** Marka tercihi durumları. Tercih bir atama değildir; nihai seçim görüşmede belirlenir. */
export const PREFERENCE_STATUS: Record<PreferenceStatus, StatusDef> = {
  yeni:        { label: 'Yeni tercih', tone: 'orange', brand: 'COUGC’ye iletildi' },
  inceleniyor: { label: 'Değerlendiriliyor', tone: 'amber', brand: 'Değerlendiriliyor' },
  onerildi:    { label: 'Markaya önerildi', tone: 'blue', brand: 'COUGC önerdi' },
  gorusme:     { label: 'Görüşmede', tone: 'violet', brand: 'Görüşmede ele alınacak' },
  secildi:     { label: 'Görüşmede seçildi', tone: 'green', brand: 'Görüşmede seçildi' },
  uygun_degil: { label: 'Uygun değil', tone: 'gray', brand: 'Bu proje için uygun değil' }
};

/** Hak rezervasyonu: brief gönderilince rezerve, kesinleşince tüketilir, iptal/ret'te serbest kalır. */
export const RESERVED: ProjectStatus[] = ['admin_incelemesi', 'teklif_gonderildi', 'kesinlestirme'];
export const CONSUMED: ProjectStatus[] = ['kargo', 'uretimde', 'teslim', 'tamamlandi'];
export const ACTIVE_STATUSES: ProjectStatus[] = ['admin_incelemesi', 'teklif_gonderildi', 'kesinlestirme', 'kargo', 'uretimde', 'teslim'];
export const isActive = (s: ProjectStatus) => ACTIVE_STATUSES.includes(s);
