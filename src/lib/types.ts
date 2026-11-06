/* ==========================================================================
   Alan modelleri. Gerçek uygulamada veritabanı tablolarına karşılık gelir
   (brands, creators, packages, orders, projects, deliverables, payouts, notifications, audit_logs).
   ========================================================================== */

export type Role = 'admin' | 'brand' | 'creator';

export type ProjectStatus =
  | 'taslak' | 'admin_incelemesi' | 'teklif_gonderildi' | 'kesinlestirme'
  | 'kargo' | 'uretimde' | 'teslim' | 'tamamlandi' | 'iptal';
export type VideoStatus = 'bekleniyor' | 'admin_kontrol' | 'marka_inceleme' | 'revize' | 'onaylandi';
export type OrderStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PayoutStatus = 'olusmadi' | 'odenecek' | 'odendi';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ShippingStatus = 'bekleniyor' | 'kargoda' | 'teslim_alindi' | 'gerekmiyor';
export type VideoFormat = '9:16' | '1:1' | '4:5';
export type Availability = 'Müsait' | 'Yoğun' | 'Uygun değil';
export type EventType = 'brief' | 'offer' | 'accept' | 'reject' | 'confirm' | 'ship' | 'upload' | 'check' | 'revise' | 'approve' | 'done' | 'cancel';
/** Marka tercihi: atama veya kesin onay DEĞİLDİR; COUGC ekibinin değerlendirme kaydıdır. */
export type PreferenceStatus = 'yeni' | 'inceleniyor' | 'onerildi' | 'gorusme' | 'secildi' | 'uygun_degil';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Package {
  id: string; name: string; videos: number; price: number; revisions: number;
  duration: string; delivery: string; active: boolean; popular?: boolean;
  desc: string; features: string[];
}

export interface Coupon { code: string; type: 'percent' | 'amount'; value: number; uses: number; limit: number; active: boolean; until: string }

export interface Brand {
  id: string; name: string; mark: string; tone: number; sector: string; city: string;
  status: 'active' | 'passive'; createdAt: string; website: string; instagram: string;
  contact: { name: string; title: string; email: string; phone: string };
  billing: { title: string; taxOffice: string; taxNo: string; address: string };
  users: { name: string; email: string; role: string }[];
}

export interface Creator {
  id: string; name: string; gender: 'K' | 'E'; city: string; age: string; cats: string[]; tone: number;
  bio: string; rating: number; done: number; onTime: number; fee: number;
  visible: boolean; showcase: boolean; status: 'active' | 'pending' | 'rejected'; avail: Availability;
  joined: string; ig: string; tt: string; followers: string; email: string; phone: string; iban: string;
  samples: string[];
}

export interface Order {
  id: string; no: string; brandId: string; packageId: string; videos: number; net: number; discount: number;
  coupon?: string; status: OrderStatus; date: string; card: string; invoice?: string; failReason?: string;
  refund?: { date: string; amount: number; reason: string };
}

export interface VideoVersion { v: number; date: string; size: number; dur: string; note?: string; name?: string }
export interface Revision { date: string; reason: string; by: 'brand' | 'admin' }
export interface Video {
  no: number; status: VideoStatus; format: VideoFormat; versions: VideoVersion[]; revisions: Revision[];
  approvedAt?: string; adminNote?: string | null;
}
export interface Offer {
  creatorId: string; status: OfferStatus; fee: number; date: string;
  answeredAt?: string; expires?: string; reason?: string; note?: string;
}
export interface ProjectEvent { date: string; type: EventType; text: string }

export interface Project {
  id: string; no: string; brandId: string; orderId: string; title: string; product: string;
  videoCount: number; status: ProjectStatus; creatorId: string | null; preferred: string[]; fee: number;
  createdAt: string; requestedDeadline: string; deadline: string | null; completedAt?: string;
  shipping: { required: boolean; status: ShippingStatus; carrier?: string; tracking?: string };
  payout: { status: PayoutStatus; date?: string };
  offers: Offer[]; videos: Video[]; events: ProjectEvent[]; extraRevisions?: number;
  selection?: ProjectSelection;
}

/** Nihai içerik üreticisi seçimi: COUGC önerir, görüşme yapılır, sonuç kaydedilir; ardından teklif gönderilir. */
export interface ProjectSelection {
  recommended: string[]; recommendedAt?: string;
  meetingAt?: string; meetingNote?: string;
  finalCreatorId?: string | null;
}

export interface CreatorPreference {
  id: string; brandId: string; creatorId: string; date: string; status: PreferenceStatus; projectId?: string;
}

/** Web sitesi başvuru formundan gelen kayıt (demo: yalnızca bu tarayıcıda tutulur; dosyaların yalnızca adı ve boyutu saklanır). */
export interface CreatorApplication {
  id: string; date: string; status: ApplicationStatus; creatorId?: string;
  name: string; age: number; city: string; district: string; phone: string; email: string;
  instagram: string; tiktok?: string; shootExperience: string; cameraFeeling: string;
  contentExperience: string; portfolio?: string; contentTypes: string[]; availability: string[]; travel: string;
  photo: Attachment; video: Attachment & { duration?: number }; notes?: string; futureContact: boolean;
}

export interface Attachment { name: string; size: number }
export interface Brief {
  website: string; social: string; productLink: string; description: string; features: string; audience: string;
  goal: string; platforms: string[]; format: string; duration: string; tone: string; highlights: string;
  forbidden: string; script: string; references: string; attachments: Attachment[]; address: string; notes: string;
}

/** Markanın yarım kalan brief'i (içerik üreticisi tercihleri de burada tutulur) */
export interface Draft extends Partial<Omit<Brief, 'platforms' | 'attachments'>> {
  creators: string[]; step: number; videoCount: number; letCougc?: boolean;
  title?: string; productName?: string; deadline?: string; shipping?: 'evet' | 'hayir';
  platforms?: string[]; attachments?: Attachment[];
}

/** Bildirim: kalın gösterilen özne + metin (HTML saklanmaz) */
export interface Notification { id: string; to: string; strong?: string; text: string; link: string; date: string; read: boolean }
export interface AuditEntry { date: string; actor: string; role: string; action: string; target: string }

export interface Db {
  version: number;
  /** Demo tarihlerinin en son kaydırıldığı gün (YYYY-AA-GG) */
  demoDay: string;
  settings: { vatRate: number; showcaseSize: number; autoApproveDays: number; showPanelPrices: boolean };
  packages: Package[]; coupons: Coupon[]; categories: string[];
  brands: Brand[]; creators: Creator[]; orders: Order[];
  history: { m: string; sales: number; count: number }[];
  projects: Project[]; briefs: Record<string, Partial<Brief>>;
  notifications: Notification[]; audit: AuditEntry[];
  drafts: Record<string, Draft>;
  preferences: CreatorPreference[];
  applications: CreatorApplication[];
  session: { role: Role | null };
}

export interface StatusDef { label: string; tone: Tone; brand?: string }
export type Tone = 'gray' | 'orange' | 'green' | 'amber' | 'blue' | 'red' | 'violet' | 'dark';
