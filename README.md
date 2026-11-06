# COUGC — Frontend Prototipi

> **Bu bir prototiptir.** Gerçek ödeme, veritabanı, kimlik doğrulama, e-posta veya dosya yükleme yoktur.
> **Tüm marka, kişi, sipariş ve proje bilgileri kurgusaldır** (`.demo` uzantılı adresler gerçek değildir).
> Demo durumu yalnızca ziyaretçinin kendi tarayıcısında (`localStorage`) tutulur; ziyaretçiler birbirinin
> işlemlerini görmez. Site arama motorlarına kapalıdır (`noindex`).

Next.js (App Router) + React + TypeScript ile yazılmıştır ve **statik site** olarak derlenir; GitHub Pages
gibi sunucusuz barındırmalarda çalışır.

## Yerelde çalıştırma

Gereksinim: [Node.js](https://nodejs.org) 20.9 veya üzeri (24 LTS önerilir).

```bash
npm install
npm run dev        # geliştirme sunucusu → http://localhost:3000
```

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (yalnızca bu bilgisayardan erişilir) |
| `npm run build` | Statik derleme → `out/` klasörü |
| `npm run preview` | `out/` klasörünü GitHub Pages benzeri şekilde sunar → http://localhost:4173 |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript kontrolü |

Next.js'in anonim kullanım istatistiğini kapatmak için komutlardan önce `NEXT_TELEMETRY_DISABLED=1`
ortam değişkenini tanımlayabilirsiniz (GitHub Actions iş akışında tanımlıdır).

### GitHub Pages yolunu yerelde denemek

Proje sitesi `https://<kullanıcı-adı>.github.io/<repo-adı>/` alt dizininde yayınlanır. Aynı koşulu yerelde
denemek için (örnek repo adı: `cougc-prototip`):

```powershell
# PowerShell
$env:NEXT_PUBLIC_BASE_PATH = "/cougc-prototip"; npm run build
node scripts/serve-out.mjs --base /cougc-prototip   # → http://localhost:4173/cougc-prototip/
```

## GitHub Pages'e yayınlama

1. **Gizli e-posta (önerilir):** GitHub → Settings → Emails → *Keep my email addresses private* seçeneğini açın.
   Git'te bu `…@users.noreply.github.com` adresini kullanın; aksi halde e-postanız herkese açık commit'lerde görünür.
2. Yeni bir repo oluşturup bu klasörü push edin. `.gitignore`, `node_modules`, `.next` ve `out` klasörlerini dışarıda tutar.
3. Repo → **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
4. Repo → **Actions → "GitHub Pages'e yayınla" → Run workflow**.
   İş akışı (`.github/workflows/deploy-pages.yml`) kontrolleri çalıştırır, repo adını `basePath` olarak kullanıp
   statik derlemeyi yapar ve yayınlar. Güvenlik için **yalnızca elle tetiklenir**; her push'ta otomatik yayın
   istenirse dosyadaki `push` bloğunun yorumu kaldırılabilir.
5. Birkaç dakika sonra site `https://<kullanıcı-adı>.github.io/<repo-adı>/` adresinde açılır.

> Ücretsiz GitHub planında Pages için repo **herkese açık** olmalıdır; kaynak kod ve demo veriler
> herkes tarafından görülebilir. Projede gizli anahtar veya gerçek kişisel veri bulunmaz.

## Demo kullanımı

- Üstteki koyu **PROTOTİP** şeridinden panel seçin: **Site · Admin · Marka · İçerik Üreticisi**.
- **Sıfırla** düğmesi tüm demo verilerini başlangıç durumuna döndürür.
- Paneller aynı tarayıcıda **ayrı sekmelerde yan yana** açılabilir; bir sekmedeki işlem diğerine anında yansır.

### Önerilen sunum akışı (≈10 dk)

| # | Panel | Adım |
|---|-------|------|
| 1 | Site | Ana sayfa → Paketler (fiyatsız) → **Başvuru yap** (4 adımlı form) → Giriş ekranındaki demo hesaplar |
| 2 | Admin | Ayarlar → Paketler → **Özel fiyat sayfası** bağlantısını kopyala (`/fiyat-bilgisi/`) → sayfada paketi seç → 3D Secure simülasyonu |
| 3 | Marka | İçerik Üreticileri → profilleri incele → **Tercih Et** → 5 adımlı brief → Gönder (hak rezerve edilir) |
| 4 | Admin | **Marka tercihleri** → hangi marka kimi tercih etti → durum güncelle |
| 5 | Admin | Proje → **Öneri hazırla** → **Görüşme planla** → **Sonucu kaydet** → **Teklif gönder** (Zeynep K.) |
| 6 | İçerik Üreticisi | Teklifler → teklifi **kabul et** (veya gerekçeyle reddet) |
| 7 | Admin | Proje → **Kesinleştir** (teslim tarihi, hak kullanılır) |
| 8 | Marka | Proje → **Kargo bilgisi gir** |
| 9 | İçerik Üreticisi | İşlerim → **Teslim aldım** → **Video yükle** (seçilen dosya cihazdan çıkmaz) |
| 10 | Admin | Video ön kontrol → **Markaya gönder** veya notla geri gönder |
| 11 | Marka | Video önizleme → **Revize iste** veya **Onayla** → Teslimatlar |
| 12 | Admin | İçerik Üreticisi hak edişleri → **Ödendi işaretle** |

### İşleyiş kuralları

- **Tercih Et atama değildir.** Marka yalnızca tercih iletir; COUGC önerir, nihai seçim görüşmede belirlenir, teklif bundan sonra gider.
- **Fiyatlar** herkese açık sayfalarda ve standart marka akışında gösterilmez. Özel sayfa `/fiyat-bilgisi/` hiçbir menüde yoktur ama adresi bilen herkes açabilir (erişim güvenliği değildir). Fiyat verisi ve ödeme simülasyonu korunur; Admin → Ayarlar'dan marka panelinde yeniden açılabilir.
- **Başvuru formu** (`/basvuru/`) demodur: ağ isteği yapmaz, dosyalar cihazdan çıkmaz, yalnızca özet bu tarayıcıda tutulur.
- **Renk:** COUGC turuncusu `#F85608` yalnızca `src/styles/tokens.css` içinden yönetilir. Beyaz üzerinde 3,32:1 olduğundan küçük metinde `--orange-700`, turuncu zeminde `--on-orange` kullanılır.

## Mimari

```
src/
  app/                      Next.js App Router
    (site)/  (auth)/        Genel site · giriş, kayıt, şifre sıfırlama
    admin/  marka/  icerik-uretici/  Üç panel — PanelShell layout'u + arayüz düzeyinde rol koruması
      …/[id]/page.tsx       Statik export için önceden üretilecek kimlikler (generateStaticParams)
      …/[id]/view.tsx       Ekranın kendisi (istemci bileşeni)
  components/
    ui/                     Tasarım sistemi (Icon, Badge, Modal, Tabs, BarChart, AsyncButton…)
    layout/                 DemoBar, genel site üst/alt alanı, PanelShell
    shared/  admin/  brand/  creator/   Ortak ve panele özel bileşenler
  lib/
    types.ts                Alan modelleri (veritabanı tablolarına karşılık gelir)
    domain/                 Durum sözlükleri ve iş kuralları (hak rezervasyonu, revize limiti…)
    api/mock-api.ts         MOCK API — arayüzün çağırdığı TEK veri katmanı
    store/                  Demo durumu (zustand + localStorage) ve arayüz durumu
    mock/seed.ts            Kurgusal demo veri seti
    static-params.ts        Statik export için kimlik aralıkları
  styles/                   Tasarım tokenları ve bileşen stilleri
scripts/serve-out.mjs       Statik çıktı için yerel önizleme sunucusu
scripts/flatten-segments.mjs  Derleme sonrası ön yükleme dosyalarını düzenler (npm postbuild)
.github/workflows/          GitHub Pages yayın iş akışı
```

**Statik export sınırı:** Detay sayfaları derlemede üretilir. Demo sırasında oluşturulan yeni projeler
`p-2000…p-2099`, siparişler `o-1030…o-1129` aralığında karşılanır (`lib/static-params.ts`).

### Gerçek backend'e geçiş

- `lib/api/mock-api.ts` fonksiyonları aynı imzalarla sunucu uç noktalarına dönüştürülür; bileşenler değişmeden kalabilir.
- `lib/domain/rules.ts` kuralları sunucuda da uygulanmalıdır; prototipteki rol koruması güvenlik sağlamaz.
- Sunuculu bir barındırmaya geçildiğinde `next.config.ts` içindeki `output: 'export'` kaldırılabilir.

## Lisanslar

Kullanılan açık lisanslı varlıklar (Lucide ikonları, Inter ve Plus Jakarta Sans yazı tipleri) için
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) dosyasına bakın. CoUGC logosu ve marka varlıkları
Cogros / COUGC'ye aittir ve açık lisanslı değildir.
