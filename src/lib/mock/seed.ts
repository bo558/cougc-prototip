/* ==========================================================================
   Demo veri seti — tüm kişi, marka ve iletişim bilgileri KURGUSALDIR (.demo alan adları).
   Video hakları (kredi) siparişler ve projelerden HESAPLANIR; ayrı tutulmaz (bkz. domain/rules.ts).
   Bildirim metinlerinde {strong} işareti, kalın gösterilen öznenin yerini belirtir.
   ========================================================================== */
import type { Db } from '../types';

export const SEED: Db = {
  "version": 3,
  "demoDay": "2026-11-02",
  "settings": {
    "vatRate": 0.2,
    "showcaseSize": 10,
    "autoApproveDays": 5,
    "showPanelPrices": false
  },
  "packages": [
    {
      "id": "pk-1",
      "name": "Başlangıç",
      "videos": 1,
      "price": 7500,
      "revisions": 1,
      "duration": "15–30 sn",
      "delivery": "7–10 iş günü",
      "active": true,
      "desc": "Bir ürünü UGC ile test etmek isteyen markalar için.",
      "features": [
        "1 adet dikey UGC video",
        "Video başına 1 revize hakkı",
        "Görüşmede belirlenen içerik üreticisiyle çekim",
        "COUGC kalite kontrolü",
        "Organik + reklam kullanım hakkı (6 ay)"
      ]
    },
    {
      "id": "pk-3",
      "name": "Büyüme",
      "videos": 3,
      "price": 19500,
      "revisions": 1,
      "popular": true,
      "duration": "15–45 sn",
      "delivery": "10–14 iş günü",
      "active": true,
      "desc": "Farklı açılarla test edilecek reklam kreatifleri için.",
      "features": [
        "3 adet UGC video",
        "Video başına 1 revize hakkı",
        "Farklı içerik üreticileriyle kullanılabilir",
        "Format seçimi: 9:16 · 1:1 · 4:5",
        "Organik + reklam kullanım hakkı (12 ay)"
      ]
    },
    {
      "id": "pk-5",
      "name": "Kampanya",
      "videos": 5,
      "price": 29900,
      "revisions": 2,
      "duration": "15–60 sn",
      "delivery": "14–21 iş günü",
      "active": true,
      "desc": "Lansman ve kampanya dönemleri için tam set.",
      "features": [
        "5 adet UGC video",
        "Video başına 2 revize hakkı",
        "Öncelikli içerik üreticisi değerlendirmesi",
        "Hook varyasyonu önerisi",
        "Organik + reklam kullanım hakkı (12 ay)"
      ]
    }
  ],
  "coupons": [
    {
      "code": "HOSGELDIN10",
      "type": "percent",
      "value": 10,
      "uses": 12,
      "limit": 100,
      "active": true,
      "until": "2026-12-31"
    },
    {
      "code": "EKIM1500",
      "type": "amount",
      "value": 1500,
      "uses": 7,
      "limit": 20,
      "active": false,
      "until": "2026-10-31"
    }
  ],
  "categories": [
    "Güzellik",
    "Cilt bakımı",
    "Moda",
    "Yaşam tarzı",
    "Yemek & İçecek",
    "Spor & Fitness",
    "Teknoloji",
    "Oyun",
    "Ev & Yaşam",
    "Anne & Bebek",
    "Evcil hayvan",
    "Seyahat",
    "Otomotiv"
  ],
  "brands": [
    {
      "id": "b-nova",
      "name": "Nova Kozmetik",
      "mark": "N",
      "tone": 0,
      "sector": "Kozmetik",
      "city": "İstanbul",
      "status": "active",
      "createdAt": "2026-08-30",
      "website": "novakozmetik.demo",
      "instagram": "@novakozmetik.demo",
      "contact": {
        "name": "Elif Aydın",
        "title": "Pazarlama Müdürü",
        "email": "elif@novakozmetik.demo",
        "phone": "+90 5XX XXX 12 34"
      },
      "billing": {
        "title": "Nova Kozmetik San. ve Tic. A.Ş.",
        "taxOffice": "Kozyatağı",
        "taxNo": "000 000 0001",
        "address": "Ataşehir, İstanbul"
      },
      "users": [
        {
          "name": "Elif Aydın",
          "email": "elif@novakozmetik.demo",
          "role": "Hesap sahibi"
        },
        {
          "name": "Can Demir",
          "email": "can@novakozmetik.demo",
          "role": "Üye"
        }
      ]
    },
    {
      "id": "b-kahve",
      "name": "Kahve Durağı",
      "mark": "KD",
      "tone": 1,
      "sector": "Yiyecek & İçecek",
      "city": "İzmir",
      "status": "active",
      "createdAt": "2026-09-05",
      "website": "kahveduragi.demo",
      "instagram": "@kahveduragi.demo",
      "contact": {
        "name": "Murat Şen",
        "title": "Kurucu",
        "email": "murat@kahveduragi.demo",
        "phone": "+90 5XX XXX 45 67"
      },
      "billing": {
        "title": "Kahve Durağı Gıda Ltd. Şti.",
        "taxOffice": "Konak",
        "taxNo": "000 000 0002",
        "address": "Alsancak, İzmir"
      },
      "users": [
        {
          "name": "Murat Şen",
          "email": "murat@kahveduragi.demo",
          "role": "Hesap sahibi"
        }
      ]
    },
    {
      "id": "b-evim",
      "name": "Evim Dekor",
      "mark": "ED",
      "tone": 2,
      "sector": "Ev & Yaşam",
      "city": "İstanbul",
      "status": "active",
      "createdAt": "2026-08-25",
      "website": "evimdekor.demo",
      "instagram": "@evimdekor.demo",
      "contact": {
        "name": "Sena Kara",
        "title": "E-ticaret Sorumlusu",
        "email": "sena@evimdekor.demo",
        "phone": "+90 5XX XXX 78 90"
      },
      "billing": {
        "title": "Evim Dekor Ev Tekstili Ltd. Şti.",
        "taxOffice": "Kadıköy",
        "taxNo": "000 000 0003",
        "address": "Kadıköy, İstanbul"
      },
      "users": [
        {
          "name": "Sena Kara",
          "email": "sena@evimdekor.demo",
          "role": "Hesap sahibi"
        }
      ]
    },
    {
      "id": "b-ritim",
      "name": "Ritim Spor",
      "mark": "R",
      "tone": 3,
      "sector": "Spor giyim",
      "city": "Ankara",
      "status": "active",
      "createdAt": "2026-08-18",
      "website": "ritimspor.demo",
      "instagram": "@ritimspor.demo",
      "contact": {
        "name": "Okan Yıldız",
        "title": "Marka Müdürü",
        "email": "okan@ritimspor.demo",
        "phone": "+90 5XX XXX 23 45"
      },
      "billing": {
        "title": "Ritim Spor Malz. A.Ş.",
        "taxOffice": "Çankaya",
        "taxNo": "000 000 0004",
        "address": "Çankaya, Ankara"
      },
      "users": [
        {
          "name": "Okan Yıldız",
          "email": "okan@ritimspor.demo",
          "role": "Hesap sahibi"
        }
      ]
    },
    {
      "id": "b-pati",
      "name": "Pati Store",
      "mark": "PS",
      "tone": 4,
      "sector": "Evcil hayvan",
      "city": "Bursa",
      "status": "active",
      "createdAt": "2026-09-24",
      "website": "patistore.demo",
      "instagram": "@patistore.demo",
      "contact": {
        "name": "Gizem Ak",
        "title": "Sosyal Medya Uzmanı",
        "email": "gizem@patistore.demo",
        "phone": "+90 5XX XXX 56 78"
      },
      "billing": {
        "title": "Pati Store Pet Ürünleri Ltd. Şti.",
        "taxOffice": "Nilüfer",
        "taxNo": "000 000 0005",
        "address": "Nilüfer, Bursa"
      },
      "users": [
        {
          "name": "Gizem Ak",
          "email": "gizem@patistore.demo",
          "role": "Hesap sahibi"
        }
      ]
    },
    {
      "id": "b-lumi",
      "name": "Lumi Teknoloji",
      "mark": "L",
      "tone": 5,
      "sector": "Elektronik",
      "city": "İstanbul",
      "status": "active",
      "createdAt": "2026-10-28",
      "website": "lumitek.demo",
      "instagram": "@lumitek.demo",
      "contact": {
        "name": "Barış Tan",
        "title": "Growth Lead",
        "email": "baris@lumitek.demo",
        "phone": "+90 5XX XXX 89 01"
      },
      "billing": {
        "title": "Lumi Teknoloji A.Ş.",
        "taxOffice": "Maslak",
        "taxNo": "000 000 0006",
        "address": "Sarıyer, İstanbul"
      },
      "users": [
        {
          "name": "Barış Tan",
          "email": "baris@lumitek.demo",
          "role": "Hesap sahibi"
        }
      ]
    },
    {
      "id": "b-mavi",
      "name": "Mavi Bahçe Organik",
      "mark": "MB",
      "tone": 6,
      "sector": "Organik gıda",
      "city": "Antalya",
      "status": "passive",
      "createdAt": "2026-08-12",
      "website": "mavibahce.demo",
      "instagram": "@mavibahce.demo",
      "contact": {
        "name": "Deniz Aksoy",
        "title": "Kurucu Ortak",
        "email": "deniz@mavibahce.demo",
        "phone": "+90 5XX XXX 34 56"
      },
      "billing": {
        "title": "Mavi Bahçe Tarım Ltd. Şti.",
        "taxOffice": "Muratpaşa",
        "taxNo": "000 000 0007",
        "address": "Muratpaşa, Antalya"
      },
      "users": [
        {
          "name": "Deniz Aksoy",
          "email": "deniz@mavibahce.demo",
          "role": "Hesap sahibi"
        }
      ]
    }
  ],
  "creators": [
    {
      "id": "c-zeynep",
      "name": "Zeynep K.",
      "gender": "K",
      "city": "İstanbul",
      "age": "25–34",
      "cats": [
        "Güzellik",
        "Yaşam tarzı"
      ],
      "tone": 0,
      "bio": "Doğal ışıkta, samimi ve hızlı kurgulu cilt bakımı ve yaşam tarzı içerikleri.",
      "rating": 4.9,
      "done": 14,
      "onTime": 96,
      "fee": 2250,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-03-14",
      "ig": "@zeynep.ugc.demo",
      "tt": "@zeynepugc.demo",
      "followers": "18,4B",
      "email": "zeynep@uretici.demo",
      "phone": "+90 5XX XXX 11 22",
      "iban": "TR•• •••• •••• •••• •••• 4821",
      "samples": [
        "Serum rutini",
        "Unboxing — kahve seti",
        "Gece bakımı"
      ]
    },
    {
      "id": "c-mert",
      "name": "Mert A.",
      "gender": "E",
      "city": "Ankara",
      "age": "25–34",
      "cats": [
        "Teknoloji",
        "Spor & Fitness"
      ],
      "tone": 3,
      "bio": "Teknoloji incelemeleri ve aktif yaşam ürünlerinde net, güven veren anlatım.",
      "rating": 4.7,
      "done": 9,
      "onTime": 92,
      "fee": 2000,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-04-02",
      "ig": "@mert.tech.demo",
      "tt": "@merttech.demo",
      "followers": "9,2B",
      "email": "mert@uretici.demo",
      "phone": "+90 5XX XXX 22 33",
      "iban": "TR•• •••• •••• •••• •••• 1190",
      "samples": [
        "Kulaklık inceleme",
        "Akıllı saat kurulumu",
        "Spor çanta"
      ]
    },
    {
      "id": "c-deniz",
      "name": "Deniz Y.",
      "gender": "K",
      "city": "İzmir",
      "age": "18–24",
      "cats": [
        "Yemek & İçecek",
        "Yaşam tarzı"
      ],
      "tone": 1,
      "bio": "Mutfak, kahve ve kafe kültürü üzerine sıcak, gündelik çekimler.",
      "rating": 4.8,
      "done": 11,
      "onTime": 94,
      "fee": 1900,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-02-20",
      "ig": "@deniz.mutfakta.demo",
      "tt": "@denizmutfak.demo",
      "followers": "24,1B",
      "email": "deniz@uretici.demo",
      "phone": "+90 5XX XXX 33 44",
      "iban": "TR•• •••• •••• •••• •••• 7733",
      "samples": [
        "Soğuk kahve tarifi",
        "Kahvaltı sofrası",
        "Granola tanıtımı"
      ]
    },
    {
      "id": "c-can",
      "name": "Can T.",
      "gender": "E",
      "city": "İstanbul",
      "age": "25–34",
      "cats": [
        "Spor & Fitness"
      ],
      "tone": 4,
      "bio": "Antrenman, koşu ekipmanı ve sporcu beslenmesi içerikleri.",
      "rating": 4.6,
      "done": 8,
      "onTime": 88,
      "fee": 2100,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Yoğun",
      "joined": "2026-05-11",
      "ig": "@can.kosuyor.demo",
      "tt": "@cankosu.demo",
      "followers": "12,7B",
      "email": "can@uretici.demo",
      "phone": "+90 5XX XXX 44 55",
      "iban": "TR•• •••• •••• •••• •••• 5512",
      "samples": [
        "Koşu ayakkabısı",
        "Protein shake",
        "Ev antrenmanı"
      ]
    },
    {
      "id": "c-selin",
      "name": "Selin B.",
      "gender": "K",
      "city": "İstanbul",
      "age": "18–24",
      "cats": [
        "Moda",
        "Güzellik"
      ],
      "tone": 5,
      "bio": "Kombin, makyaj ve “get ready with me” formatında yüksek etkileşimli videolar.",
      "rating": 4.9,
      "done": 16,
      "onTime": 97,
      "fee": 2300,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-01-28",
      "ig": "@selin.style.demo",
      "tt": "@selinstyle.demo",
      "followers": "31,5B",
      "email": "selin@uretici.demo",
      "phone": "+90 5XX XXX 55 66",
      "iban": "TR•• •••• •••• •••• •••• 3307",
      "samples": [
        "GRWM — yaz makyajı",
        "Kombin önerisi",
        "Güneş kremi testi"
      ]
    },
    {
      "id": "c-ece",
      "name": "Ece D.",
      "gender": "K",
      "city": "Bursa",
      "age": "35–44",
      "cats": [
        "Anne & Bebek",
        "Ev & Yaşam"
      ],
      "tone": 2,
      "bio": "Anne gözünden ürün deneyimleri; güvenilir ve sakin bir anlatım.",
      "rating": 4.8,
      "done": 7,
      "onTime": 100,
      "fee": 2000,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-06-03",
      "ig": "@ece.evde.demo",
      "tt": "@eceevde.demo",
      "followers": "7,8B",
      "email": "ece@uretici.demo",
      "phone": "+90 5XX XXX 66 77",
      "iban": "TR•• •••• •••• •••• •••• 9054",
      "samples": [
        "Bebek bakım çantası",
        "Ev düzeni",
        "Organik atıştırmalık"
      ]
    },
    {
      "id": "c-burak",
      "name": "Burak Ö.",
      "gender": "E",
      "city": "İzmir",
      "age": "18–24",
      "cats": [
        "Teknoloji",
        "Oyun"
      ],
      "tone": 6,
      "bio": "Oyun ekipmanları ve gadget’larda hızlı tempolu, genç dil.",
      "rating": 4.5,
      "done": 5,
      "onTime": 90,
      "fee": 1800,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-07-19",
      "ig": "@burak.setup.demo",
      "tt": "@buraksetup.demo",
      "followers": "15,3B",
      "email": "burak@uretici.demo",
      "phone": "+90 5XX XXX 77 88",
      "iban": "TR•• •••• •••• •••• •••• 2216",
      "samples": [
        "Oyuncu klavyesi",
        "Masa düzeni",
        "Powerbank testi"
      ]
    },
    {
      "id": "c-ayse",
      "name": "Ayşe G.",
      "gender": "K",
      "city": "Antalya",
      "age": "35–44",
      "cats": [
        "Ev & Yaşam",
        "Yemek & İçecek"
      ],
      "tone": 7,
      "bio": "Ev dekorasyonu, mutfak ve düzenleme üzerine estetik çekimler.",
      "rating": 4.7,
      "done": 10,
      "onTime": 95,
      "fee": 1900,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-04-22",
      "ig": "@ayse.evim.demo",
      "tt": "@ayseevim.demo",
      "followers": "11,0B",
      "email": "ayse@uretici.demo",
      "phone": "+90 5XX XXX 88 99",
      "iban": "TR•• •••• •••• •••• •••• 6640",
      "samples": [
        "Mum dekorasyonu",
        "Mutfak düzeni",
        "Keten masa örtüsü"
      ]
    },
    {
      "id": "c-emre",
      "name": "Emre S.",
      "gender": "E",
      "city": "Ankara",
      "age": "25–34",
      "cats": [
        "Evcil hayvan",
        "Yaşam tarzı"
      ],
      "tone": 1,
      "bio": "İki kedisiyle birlikte eğlenceli ve doğal evcil hayvan içerikleri.",
      "rating": 4.8,
      "done": 6,
      "onTime": 100,
      "fee": 1800,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Müsait",
      "joined": "2026-06-15",
      "ig": "@emre.vekediler.demo",
      "tt": "@emrekedi.demo",
      "followers": "20,6B",
      "email": "emre@uretici.demo",
      "phone": "+90 5XX XXX 99 00",
      "iban": "TR•• •••• •••• •••• •••• 8125",
      "samples": [
        "Kedi oyuncağı",
        "Mama geçişi",
        "Tırmalama tahtası"
      ]
    },
    {
      "id": "c-nil",
      "name": "Nil Ç.",
      "gender": "K",
      "city": "İstanbul",
      "age": "25–34",
      "cats": [
        "Güzellik",
        "Cilt bakımı"
      ],
      "tone": 3,
      "bio": "Dermokozmetik ve cilt bakımında içerik odaklı, öğretici videolar.",
      "rating": 5,
      "done": 19,
      "onTime": 98,
      "fee": 2400,
      "visible": true,
      "showcase": true,
      "status": "active",
      "avail": "Yoğun",
      "joined": "2026-01-09",
      "ig": "@nil.skincare.demo",
      "tt": "@nilskin.demo",
      "followers": "27,9B",
      "email": "nil@uretici.demo",
      "phone": "+90 5XX XXX 10 20",
      "iban": "TR•• •••• •••• •••• •••• 4402",
      "samples": [
        "Dudak bakımı",
        "Sabah rutini",
        "Nemlendirici karşılaştırma"
      ]
    },
    {
      "id": "c-kaan",
      "name": "Kaan E.",
      "gender": "E",
      "city": "Eskişehir",
      "age": "25–34",
      "cats": [
        "Yemek & İçecek"
      ],
      "tone": 5,
      "bio": "Sokak lezzetleri ve pratik tarifler.",
      "rating": 4.4,
      "done": 3,
      "onTime": 85,
      "fee": 1700,
      "visible": false,
      "showcase": false,
      "status": "active",
      "avail": "Uygun değil",
      "joined": "2026-08-01",
      "ig": "@kaan.lezzet.demo",
      "tt": "@kaanlezzet.demo",
      "followers": "5,1B",
      "email": "kaan@uretici.demo",
      "phone": "+90 5XX XXX 20 30",
      "iban": "TR•• •••• •••• •••• •••• 7781",
      "samples": [
        "Tost tarifi",
        "Sos tanıtımı",
        "Kahvaltılık"
      ]
    },
    {
      "id": "c-melis",
      "name": "Melis A.",
      "gender": "K",
      "city": "İstanbul",
      "age": "18–24",
      "cats": [
        "Moda",
        "Seyahat"
      ],
      "tone": 6,
      "bio": "Seyahat kombinleri ve valiz hazırlığı içerikleri üretmek istiyorum.",
      "rating": 0,
      "done": 0,
      "onTime": 0,
      "fee": 0,
      "visible": false,
      "showcase": false,
      "status": "pending",
      "avail": "Müsait",
      "joined": "2026-10-30",
      "ig": "@melis.yolda.demo",
      "tt": "@melisyolda.demo",
      "followers": "8,3B",
      "email": "melis@uretici.demo",
      "phone": "+90 5XX XXX 30 40",
      "iban": "",
      "samples": [
        "Valiz hazırlığı",
        "Şehir kombini"
      ]
    },
    {
      "id": "c-onur",
      "name": "Onur K.",
      "gender": "E",
      "city": "İzmir",
      "age": "25–34",
      "cats": [
        "Teknoloji",
        "Otomotiv"
      ],
      "tone": 2,
      "bio": "Araç içi aksesuarlar ve teknoloji ürünleri için pratik kullanım videoları.",
      "rating": 0,
      "done": 0,
      "onTime": 0,
      "fee": 0,
      "visible": false,
      "showcase": false,
      "status": "pending",
      "avail": "Müsait",
      "joined": "2026-11-01",
      "ig": "@onur.garaj.demo",
      "tt": "@onurgaraj.demo",
      "followers": "4,6B",
      "email": "onur@uretici.demo",
      "phone": "+90 5XX XXX 40 50",
      "iban": "",
      "samples": [
        "Araç tutucu",
        "Kablosuz şarj"
      ]
    }
  ],
  "orders": [
    {
      "id": "o-1035",
      "no": "CG-1035",
      "brandId": "b-ritim",
      "packageId": "pk-1",
      "videos": 1,
      "net": 7500,
      "discount": 0,
      "status": "refunded",
      "date": "2026-08-20T11:24:00",
      "card": "•••• 4242",
      "invoice": "CGA2026001035",
      "refund": {
        "date": "2026-08-24",
        "amount": 9000,
        "reason": "Kampanya takvimi iptal edildi; hak kullanılmadan iade."
      }
    },
    {
      "id": "o-1036",
      "no": "CG-1036",
      "brandId": "b-evim",
      "packageId": "pk-3",
      "videos": 3,
      "net": 19500,
      "discount": 0,
      "status": "paid",
      "date": "2026-08-28T15:02:00",
      "card": "•••• 1881",
      "invoice": "CGA2026001036"
    },
    {
      "id": "o-1037",
      "no": "CG-1037",
      "brandId": "b-nova",
      "packageId": "pk-1",
      "videos": 1,
      "net": 7500,
      "discount": 0,
      "status": "paid",
      "date": "2026-09-02T10:41:00",
      "card": "•••• 5310",
      "invoice": "CGA2026001037"
    },
    {
      "id": "o-1038",
      "no": "CG-1038",
      "brandId": "b-kahve",
      "packageId": "pk-5",
      "videos": 5,
      "net": 29900,
      "discount": 0,
      "status": "paid",
      "date": "2026-09-08T09:15:00",
      "card": "•••• 7764",
      "invoice": "CGA2026001038"
    },
    {
      "id": "o-1039",
      "no": "CG-1039",
      "brandId": "b-ritim",
      "packageId": "pk-3",
      "videos": 3,
      "net": 19500,
      "discount": 1950,
      "coupon": "HOSGELDIN10",
      "status": "paid",
      "date": "2026-09-15T16:48:00",
      "card": "•••• 4242",
      "invoice": "CGA2026001039"
    },
    {
      "id": "o-1040",
      "no": "CG-1040",
      "brandId": "b-pati",
      "packageId": "pk-1",
      "videos": 1,
      "net": 7500,
      "discount": 0,
      "status": "paid",
      "date": "2026-09-26T13:30:00",
      "card": "•••• 9012",
      "invoice": "CGA2026001040"
    },
    {
      "id": "o-1041",
      "no": "CG-1041",
      "brandId": "b-nova",
      "packageId": "pk-5",
      "videos": 5,
      "net": 29900,
      "discount": 0,
      "status": "paid",
      "date": "2026-10-12T14:05:00",
      "card": "•••• 5310",
      "invoice": "CGA2026001041"
    },
    {
      "id": "o-1042",
      "no": "CG-1042",
      "brandId": "b-lumi",
      "packageId": "pk-3",
      "videos": 3,
      "net": 19500,
      "discount": 0,
      "status": "failed",
      "date": "2026-10-29T17:22:00",
      "card": "•••• 0088",
      "failReason": "Banka 3D doğrulamayı reddetti (demo)."
    }
  ],
  "history": [
    {
      "m": "2026-06",
      "sales": 41200,
      "count": 4
    },
    {
      "m": "2026-07",
      "sales": 52600,
      "count": 5
    }
  ],
  "projects": [
    {
      "id": "p-2009",
      "no": "PRJ-2009",
      "brandId": "b-evim",
      "orderId": "o-1036",
      "title": "Kokulu mum serisi — tanıtım",
      "product": "Lavanta & Sedir Kokulu Mum",
      "videoCount": 1,
      "status": "tamamlandi",
      "creatorId": "c-zeynep",
      "preferred": [
        "c-zeynep"
      ],
      "fee": 2250,
      "createdAt": "2026-09-01T10:00:00",
      "requestedDeadline": "2026-09-22",
      "deadline": "2026-09-20",
      "completedAt": "2026-09-18T16:00:00",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK1029384756"
      },
      "payout": {
        "status": "odendi",
        "date": "2026-09-30"
      },
      "offers": [
        {
          "creatorId": "c-zeynep",
          "status": "accepted",
          "fee": 2250,
          "date": "2026-09-02",
          "answeredAt": "2026-09-02"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "onaylandi",
          "format": "9:16",
          "versions": [
            {
              "v": 1,
              "date": "2026-09-15T12:00:00",
              "size": 182000000,
              "dur": "0:28"
            },
            {
              "v": 2,
              "date": "2026-09-17T11:00:00",
              "size": 176000000,
              "dur": "0:27"
            }
          ],
          "revisions": [
            {
              "date": "2026-09-16T09:30:00",
              "reason": "Ürün etiketinin ilk saniyelerde daha net görünmesini istiyoruz.",
              "by": "brand"
            }
          ],
          "approvedAt": "2026-09-18T16:00:00"
        }
      ],
      "events": [
        {
          "date": "2026-09-01T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        },
        {
          "date": "2026-09-02T09:00:00",
          "type": "offer",
          "text": "Zeynep K. teklifi kabul etti."
        },
        {
          "date": "2026-09-02T11:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 20 Eyl."
        },
        {
          "date": "2026-09-18T16:00:00",
          "type": "done",
          "text": "Video onaylandı, proje tamamlandı."
        }
      ]
    },
    {
      "id": "p-2015",
      "no": "PRJ-2015",
      "brandId": "b-kahve",
      "orderId": "o-1038",
      "title": "Soğuk demleme tanıtımı",
      "product": "Cold Brew Konsantre 500 ml",
      "videoCount": 1,
      "status": "tamamlandi",
      "creatorId": "c-zeynep",
      "preferred": [
        "c-zeynep",
        "c-deniz"
      ],
      "fee": 2250,
      "createdAt": "2026-09-10T10:00:00",
      "requestedDeadline": "2026-10-01",
      "deadline": "2026-10-03",
      "completedAt": "2026-10-02T15:00:00",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK5528193047"
      },
      "payout": {
        "status": "odendi",
        "date": "2026-10-15"
      },
      "offers": [
        {
          "creatorId": "c-zeynep",
          "status": "accepted",
          "fee": 2250,
          "date": "2026-09-11",
          "answeredAt": "2026-09-11"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "onaylandi",
          "format": "9:16",
          "versions": [
            {
              "v": 1,
              "date": "2026-10-01T10:00:00",
              "size": 158000000,
              "dur": "0:31"
            }
          ],
          "revisions": [],
          "approvedAt": "2026-10-02T15:00:00"
        }
      ],
      "events": [
        {
          "date": "2026-09-10T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi."
        },
        {
          "date": "2026-09-11T12:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 3 Eki."
        },
        {
          "date": "2026-10-02T15:00:00",
          "type": "done",
          "text": "Video onaylandı, proje tamamlandı."
        }
      ]
    },
    {
      "id": "p-2018",
      "no": "PRJ-2018",
      "brandId": "b-nova",
      "orderId": "o-1037",
      "title": "Dudak balmı tanıtımı",
      "product": "Nova Lip Care Balm",
      "videoCount": 1,
      "status": "tamamlandi",
      "creatorId": "c-nil",
      "preferred": [
        "c-nil"
      ],
      "fee": 2400,
      "createdAt": "2026-09-04T10:00:00",
      "requestedDeadline": "2026-09-30",
      "deadline": "2026-09-30",
      "completedAt": "2026-09-29T11:00:00",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK3301928374"
      },
      "payout": {
        "status": "odenecek"
      },
      "offers": [
        {
          "creatorId": "c-nil",
          "status": "accepted",
          "fee": 2400,
          "date": "2026-09-05",
          "answeredAt": "2026-09-05"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "onaylandi",
          "format": "9:16",
          "versions": [
            {
              "v": 1,
              "date": "2026-09-27T10:00:00",
              "size": 201000000,
              "dur": "0:24"
            }
          ],
          "revisions": [],
          "approvedAt": "2026-09-29T11:00:00"
        }
      ],
      "events": [
        {
          "date": "2026-09-04T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi."
        },
        {
          "date": "2026-09-05T15:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 30 Eyl."
        },
        {
          "date": "2026-09-29T11:00:00",
          "type": "done",
          "text": "Video onaylandı, proje tamamlandı."
        }
      ]
    },
    {
      "id": "p-2024",
      "no": "PRJ-2024",
      "brandId": "b-pati",
      "orderId": "o-1040",
      "title": "Kedi maması ilk izlenim",
      "product": "Tahılsız Kedi Maması 1,5 kg",
      "videoCount": 1,
      "status": "kargo",
      "creatorId": "c-emre",
      "preferred": [
        "c-emre"
      ],
      "fee": 1800,
      "createdAt": "2026-10-20T10:00:00",
      "requestedDeadline": "2026-11-12",
      "deadline": "2026-11-14",
      "shipping": {
        "required": true,
        "status": "kargoda",
        "carrier": "Demo Kargo",
        "tracking": "DK8812736450"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-emre",
          "status": "accepted",
          "fee": 1800,
          "date": "2026-10-21",
          "answeredAt": "2026-10-22"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-20T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        },
        {
          "date": "2026-10-22T09:30:00",
          "type": "offer",
          "text": "Emre S. teklifi kabul etti."
        },
        {
          "date": "2026-10-23T10:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 14 Kas."
        },
        {
          "date": "2026-10-31T14:00:00",
          "type": "ship",
          "text": "Marka ürünü kargoya verdi (DK8812736450)."
        }
      ]
    },
    {
      "id": "p-2027",
      "no": "PRJ-2027",
      "brandId": "b-ritim",
      "orderId": "o-1039",
      "title": "Koşu taytı dayanıklılık testi",
      "product": "Ritim Pro Koşu Taytı",
      "videoCount": 2,
      "status": "uretimde",
      "creatorId": "c-can",
      "preferred": [
        "c-can"
      ],
      "fee": 2100,
      "createdAt": "2026-10-05T10:00:00",
      "requestedDeadline": "2026-10-28",
      "deadline": "2026-10-31",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK6610293847"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-can",
          "status": "accepted",
          "fee": 2100,
          "date": "2026-10-06",
          "answeredAt": "2026-10-06"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        },
        {
          "no": 2,
          "status": "bekleniyor",
          "format": "4:5",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-05T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 2 video hakkı rezerve edildi."
        },
        {
          "date": "2026-10-07T10:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 31 Eki."
        },
        {
          "date": "2026-10-15T12:00:00",
          "type": "ship",
          "text": "İçerik üreticisi ürünü teslim aldı, çekim başladı."
        }
      ]
    },
    {
      "id": "p-2029",
      "no": "PRJ-2029",
      "brandId": "b-kahve",
      "orderId": "o-1038",
      "title": "Ofiste kahve molası",
      "product": "Filtre Kahve Seti",
      "videoCount": 1,
      "status": "teslim",
      "creatorId": "c-deniz",
      "preferred": [
        "c-deniz"
      ],
      "fee": 1900,
      "createdAt": "2026-10-14T10:00:00",
      "requestedDeadline": "2026-11-06",
      "deadline": "2026-11-06",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK4401928374"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-deniz",
          "status": "accepted",
          "fee": 1900,
          "date": "2026-10-15",
          "answeredAt": "2026-10-15"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "admin_kontrol",
          "format": "9:16",
          "versions": [
            {
              "v": 1,
              "date": "2026-11-01T18:20:00",
              "size": 214000000,
              "dur": "0:34"
            }
          ],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-14T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi."
        },
        {
          "date": "2026-10-16T10:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 6 Kas."
        },
        {
          "date": "2026-11-01T18:20:00",
          "type": "upload",
          "text": "Deniz Y. 1. videonun v1 sürümünü yükledi."
        }
      ]
    },
    {
      "id": "p-2031",
      "no": "PRJ-2031",
      "brandId": "b-nova",
      "orderId": "o-1041",
      "title": "Hydra Serum lansmanı",
      "product": "Nova Hydra Serum 30 ml",
      "videoCount": 2,
      "status": "teslim",
      "creatorId": "c-zeynep",
      "preferred": [
        "c-zeynep",
        "c-nil"
      ],
      "fee": 2250,
      "createdAt": "2026-10-13T10:00:00",
      "requestedDeadline": "2026-11-07",
      "deadline": "2026-11-08",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK2209384712"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-zeynep",
          "status": "accepted",
          "fee": 2250,
          "date": "2026-10-14",
          "answeredAt": "2026-10-14"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "marka_inceleme",
          "format": "9:16",
          "versions": [
            {
              "v": 1,
              "date": "2026-10-30T16:40:00",
              "size": 196000000,
              "dur": "0:29",
              "note": "Sabah rutini kurgusu; serum damlası yakın plan 0:06’da."
            }
          ],
          "revisions": []
        },
        {
          "no": 2,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-13T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 2 video hakkı rezerve edildi."
        },
        {
          "date": "2026-10-14T11:00:00",
          "type": "offer",
          "text": "Zeynep K. teklifi kabul etti."
        },
        {
          "date": "2026-10-14T15:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 8 Kas."
        },
        {
          "date": "2026-10-20T10:00:00",
          "type": "ship",
          "text": "İçerik üreticisi ürünü teslim aldı."
        },
        {
          "date": "2026-10-30T16:40:00",
          "type": "upload",
          "text": "Zeynep K. 1. videoyu yükledi."
        },
        {
          "date": "2026-10-31T10:15:00",
          "type": "check",
          "text": "COUGC ön kontrolü tamamladı, video marka incelemesine gönderildi."
        }
      ]
    },
    {
      "id": "p-2033",
      "no": "PRJ-2033",
      "brandId": "b-kahve",
      "orderId": "o-1038",
      "title": "Sabah rutini",
      "product": "Espresso Çekirdek Kahve 250 g",
      "videoCount": 1,
      "status": "teslim",
      "creatorId": "c-zeynep",
      "preferred": [
        "c-zeynep"
      ],
      "fee": 2250,
      "createdAt": "2026-10-16T10:00:00",
      "requestedDeadline": "2026-11-05",
      "deadline": "2026-11-05",
      "shipping": {
        "required": true,
        "status": "teslim_alindi",
        "carrier": "Demo Kargo",
        "tracking": "DK7719283746"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-zeynep",
          "status": "accepted",
          "fee": 2250,
          "date": "2026-10-17",
          "answeredAt": "2026-10-17"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "revize",
          "format": "9:16",
          "versions": [
            {
              "v": 1,
              "date": "2026-10-27T13:00:00",
              "size": 188000000,
              "dur": "0:32"
            }
          ],
          "revisions": [
            {
              "date": "2026-10-30T11:20:00",
              "reason": "Ürün ambalajı ilk 3 saniyede görünmeli. Sesli anlatıma “şeker ilavesiz” vurgusu eklenebilir mi?",
              "by": "brand"
            }
          ]
        }
      ],
      "events": [
        {
          "date": "2026-10-16T10:00:00",
          "type": "brief",
          "text": "Brief gönderildi."
        },
        {
          "date": "2026-10-17T14:00:00",
          "type": "confirm",
          "text": "Proje kesinleşti. Teslim tarihi: 5 Kas."
        },
        {
          "date": "2026-10-27T13:00:00",
          "type": "upload",
          "text": "Zeynep K. videoyu yükledi."
        },
        {
          "date": "2026-10-28T09:00:00",
          "type": "check",
          "text": "COUGC ön kontrolü tamamladı."
        },
        {
          "date": "2026-10-30T11:20:00",
          "type": "revise",
          "text": "Marka revize talep etti (1/2)."
        }
      ]
    },
    {
      "id": "p-2036",
      "no": "PRJ-2036",
      "brandId": "b-nova",
      "orderId": "o-1041",
      "title": "Güneş kremi yaz kampanyası",
      "product": "Nova Sun SPF 50+",
      "videoCount": 1,
      "status": "admin_incelemesi",
      "creatorId": null,
      "preferred": [
        "c-selin",
        "c-nil"
      ],
      "fee": 0,
      "createdAt": "2026-11-01T14:30:00",
      "requestedDeadline": "2026-11-20",
      "deadline": null,
      "shipping": {
        "required": true,
        "status": "bekleniyor"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-11-01T14:30:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        }
      ]
    },
    {
      "id": "p-2038",
      "no": "PRJ-2038",
      "brandId": "b-ritim",
      "orderId": "o-1039",
      "title": "Spor çanta kullanım videosu",
      "product": "Ritim Gym Bag 35 L",
      "videoCount": 1,
      "status": "admin_incelemesi",
      "creatorId": null,
      "preferred": [
        "c-can",
        "c-mert"
      ],
      "fee": 0,
      "createdAt": "2026-10-29T09:00:00",
      "requestedDeadline": "2026-11-19",
      "deadline": null,
      "shipping": {
        "required": true,
        "status": "bekleniyor"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-can",
          "status": "rejected",
          "fee": 2100,
          "date": "2026-10-30",
          "answeredAt": "2026-10-31",
          "reason": "Bu tarihlerde yoğun çekim takvimim var, zamanında teslim edemem."
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-29T09:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        },
        {
          "date": "2026-10-30T10:00:00",
          "type": "offer",
          "text": "Can T. adlı içerik üreticisine teklif gönderildi."
        },
        {
          "date": "2026-10-31T16:00:00",
          "type": "reject",
          "text": "Can T. teklifi reddetti — alternatif içerik üreticisi bekleniyor. Video hakkı korunuyor."
        }
      ]
    },
    {
      "id": "p-2039",
      "no": "PRJ-2039",
      "brandId": "b-evim",
      "orderId": "o-1036",
      "title": "Keten yastık kılıfları",
      "product": "Keten Yastık Kılıfı 45×45",
      "videoCount": 1,
      "status": "kesinlestirme",
      "creatorId": "c-ayse",
      "preferred": [
        "c-ayse"
      ],
      "fee": 1900,
      "createdAt": "2026-10-30T11:00:00",
      "requestedDeadline": "2026-11-15",
      "deadline": null,
      "shipping": {
        "required": true,
        "status": "bekleniyor"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-ayse",
          "status": "accepted",
          "fee": 1900,
          "date": "2026-10-31",
          "answeredAt": "2026-11-01"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "4:5",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-30T11:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        },
        {
          "date": "2026-10-31T09:30:00",
          "type": "offer",
          "text": "Ayşe G. adlı içerik üreticisine teklif gönderildi."
        },
        {
          "date": "2026-11-01T12:10:00",
          "type": "accept",
          "text": "Ayşe G. teklifi kabul etti. Kesinleştirme bekleniyor."
        }
      ]
    },
    {
      "id": "p-2040",
      "no": "PRJ-2040",
      "brandId": "b-kahve",
      "orderId": "o-1038",
      "title": "Evde soğuk kahve ritüeli",
      "product": "Cold Brew Konsantre 1 L",
      "videoCount": 1,
      "status": "teklif_gonderildi",
      "creatorId": null,
      "preferred": [
        "c-zeynep",
        "c-deniz"
      ],
      "fee": 2250,
      "createdAt": "2026-10-31T15:00:00",
      "requestedDeadline": "2026-11-18",
      "deadline": null,
      "shipping": {
        "required": true,
        "status": "bekleniyor"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-zeynep",
          "status": "pending",
          "fee": 2250,
          "date": "2026-11-01T10:00:00",
          "expires": "2026-11-04"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-10-31T15:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        },
        {
          "date": "2026-11-01T10:00:00",
          "type": "offer",
          "text": "Zeynep K. adlı içerik üreticisine teklif gönderildi."
        }
      ]
    },
    {
      "id": "p-2044",
      "no": "PRJ-2044",
      "brandId": "b-evim",
      "orderId": "o-1036",
      "title": "Kokulu mum — sonbahar serisi",
      "product": "Tarçın & Elma Kokulu Mum",
      "videoCount": 1,
      "status": "teklif_gonderildi",
      "creatorId": null,
      "preferred": [
        "c-zeynep",
        "c-ayse"
      ],
      "fee": 2250,
      "createdAt": "2026-11-01T09:00:00",
      "requestedDeadline": "2026-11-21",
      "deadline": null,
      "shipping": {
        "required": true,
        "status": "bekleniyor"
      },
      "payout": {
        "status": "olusmadi"
      },
      "offers": [
        {
          "creatorId": "c-zeynep",
          "status": "pending",
          "fee": 2250,
          "date": "2026-11-02T09:00:00",
          "expires": "2026-11-05"
        }
      ],
      "videos": [
        {
          "no": 1,
          "status": "bekleniyor",
          "format": "9:16",
          "versions": [],
          "revisions": []
        }
      ],
      "events": [
        {
          "date": "2026-11-01T09:00:00",
          "type": "brief",
          "text": "Brief gönderildi, 1 video hakkı rezerve edildi."
        },
        {
          "date": "2026-11-02T09:00:00",
          "type": "offer",
          "text": "Zeynep K. adlı içerik üreticisine teklif gönderildi."
        }
      ]
    }
  ],
  "briefs": {
    "p-2031": {
      "website": "novakozmetik.demo",
      "social": "@novakozmetik.demo",
      "productLink": "novakozmetik.demo/hydra-serum",
      "description": "Hyaluronik asit ve niasinamid içeren, hafif dokulu nemlendirici serum. Lansman dönemi için Instagram Reels ve TikTok reklamlarında kullanılacak.",
      "features": "Hızlı emilim · Yapışkanlık bırakmaz · Parfümsüz · Dermatolojik olarak test edildi",
      "audience": "22–35 yaş, cilt bakımına ilgili, ilk kez serum deneyecek kadınlar",
      "goal": "Reklam (dönüşüm)",
      "platforms": [
        "Instagram Reels",
        "TikTok"
      ],
      "format": "9:16",
      "duration": "20–30 sn",
      "tone": "Samimi, doğal ışık, “sabah rutinim” hissi",
      "highlights": "Serumun dokusu yakın planda görünsün; “yapışkanlık bırakmıyor” cümlesi mutlaka geçsin.",
      "forbidden": "“Kırışıklığı yok eder”, “tedavi eder” gibi tıbbi iddialar kullanılmamalı.",
      "script": "Hook: “Serum kullanmaya üşenenler buraya.” → Ürünü tanıt → Uygulama → Sonuç hissi → CTA",
      "references": "Rakip analizinde paylaştığımız 2 örnek (ek dosyada).",
      "attachments": [
        {
          "name": "Nova_Hydra_marka_rehberi.pdf",
          "size": 2400000
        },
        {
          "name": "referans_videolar.zip",
          "size": 48000000
        }
      ],
      "address": "Ürünler COUGC ofisi üzerinden içerik üreticisine ulaştırılacak.",
      "notes": "İkinci videoda akşam rutini kurgusu tercih ederiz."
    },
    "p-2036": {
      "website": "novakozmetik.demo",
      "social": "@novakozmetik.demo",
      "productLink": "novakozmetik.demo/sun-spf50",
      "description": "Yüksek korumalı, beyaz iz bırakmayan güneş kremi. Yaz öncesi erken kampanya için.",
      "features": "SPF 50+ · Beyaz iz bırakmaz · Suya dayanıklı · Makyaj altına uygun",
      "audience": "20–40 yaş, şehirde yaşayan, her gün güneş kremi kullanmak isteyen kadınlar",
      "goal": "Reklam (dönüşüm)",
      "platforms": [
        "Instagram Reels",
        "TikTok"
      ],
      "format": "9:16",
      "duration": "15–25 sn",
      "tone": "Enerjik, dış mekân, gün ışığı",
      "highlights": "Beyaz iz bırakmadığı yakın planda gösterilsin.",
      "forbidden": "Güneşte yanmayı “tamamen önler” ifadesi kullanılmasın.",
      "script": "Serbest — içerik üreticisi önerisine açığız.",
      "references": "—",
      "attachments": [
        {
          "name": "Nova_Sun_urun_gorselleri.zip",
          "size": 31000000
        }
      ],
      "address": "Ürünler COUGC ofisi üzerinden içerik üreticisine ulaştırılacak.",
      "notes": "Mümkünse Selin B. ile çalışmak istiyoruz."
    }
  },
  "notifications": [
    {
      "id": "n0",
      "to": "admin",
      "text": "{strong} Ece D. adlı içerik üreticisini tercih etti",
      "link": "/admin/marka-tercihleri",
      "date": "2026-11-02T09:05:00",
      "read": false,
      "strong": "Lumi Teknoloji"
    },
    {
      "id": "n1",
      "to": "admin",
      "text": "{strong} yeni brief gönderdi: Güneş kremi yaz kampanyası",
      "link": "/admin/projeler/p-2036",
      "date": "2026-11-01T14:30:00",
      "read": false,
      "strong": "Nova Kozmetik"
    },
    {
      "id": "n2",
      "to": "admin",
      "text": "{strong} PRJ-2039 teklifini kabul etti — kesinleştirme bekliyor",
      "link": "/admin/projeler/p-2039",
      "date": "2026-11-01T12:10:00",
      "read": false,
      "strong": "Ayşe G."
    },
    {
      "id": "n3",
      "to": "admin",
      "text": "{strong} PRJ-2029 için video yükledi — ön kontrol bekliyor",
      "link": "/admin/projeler/p-2029",
      "date": "2026-11-01T18:20:00",
      "read": false,
      "strong": "Deniz Y."
    },
    {
      "id": "n4",
      "to": "admin",
      "text": "{strong} PRJ-2038 teklifini reddetti",
      "link": "/admin/projeler/p-2038",
      "date": "2026-10-31T16:00:00",
      "read": true,
      "strong": "Can T."
    },
    {
      "id": "n5",
      "to": "admin",
      "text": "PRJ-2027 teslim tarihi geçti (31 Eki)",
      "link": "/admin/projeler/p-2027",
      "date": "2026-11-01T09:00:00",
      "read": true
    },
    {
      "id": "n6",
      "to": "admin",
      "text": "{strong} ödemesi başarısız oldu (CG-1042)",
      "link": "/admin/odemeler",
      "date": "2026-10-29T17:22:00",
      "read": true,
      "strong": "Lumi Teknoloji"
    },
    {
      "id": "n7",
      "to": "brand:b-nova",
      "text": "Hydra Serum lansmanı · {strong} incelemenize hazır",
      "link": "/marka/projeler/p-2031",
      "date": "2026-10-31T10:15:00",
      "read": false,
      "strong": "1. video"
    },
    {
      "id": "n8",
      "to": "brand:b-nova",
      "text": "Güneş kremi yaz kampanyası briefiniz alındı, COUGC inceliyor",
      "link": "/marka/projeler/p-2036",
      "date": "2026-11-01T14:31:00",
      "read": true
    },
    {
      "id": "n9",
      "to": "brand:b-nova",
      "text": "CG-1041 ödemeniz onaylandı · 5 video hakkı tanımlandı",
      "link": "/marka/odemeler",
      "date": "2026-10-12T14:06:00",
      "read": true
    },
    {
      "id": "n10",
      "to": "creator:c-zeynep",
      "text": "{strong} için yeni teklif: Kokulu mum — sonbahar serisi",
      "link": "/icerik-uretici/teklifler/p-2044",
      "date": "2026-11-02T09:00:00",
      "read": false,
      "strong": "Evim Dekor"
    },
    {
      "id": "n11",
      "to": "creator:c-zeynep",
      "text": "{strong} için yeni teklif: Evde soğuk kahve ritüeli",
      "link": "/icerik-uretici/teklifler/p-2040",
      "date": "2026-11-01T10:00:00",
      "read": false,
      "strong": "Kahve Durağı"
    },
    {
      "id": "n12",
      "to": "creator:c-zeynep",
      "text": "PRJ-2033 için {strong} var",
      "link": "/icerik-uretici/isler/p-2033",
      "date": "2026-10-30T11:20:00",
      "read": true,
      "strong": "revize talebi"
    },
    {
      "id": "n13",
      "to": "creator:c-zeynep",
      "text": "PRJ-2015 hak edişiniz ödendi: ₺2.250",
      "link": "/icerik-uretici/kazanclar",
      "date": "2026-10-15T10:00:00",
      "read": true
    }
  ],
  "audit": [
    {
      "date": "2026-11-01T12:10:00",
      "actor": "Ayşe G.",
      "role": "İçerik Üreticisi",
      "action": "Teklif kabul edildi",
      "target": "PRJ-2039"
    },
    {
      "date": "2026-10-31T16:00:00",
      "actor": "Can T.",
      "role": "İçerik Üreticisi",
      "action": "Teklif reddedildi",
      "target": "PRJ-2038"
    },
    {
      "date": "2026-10-31T10:15:00",
      "actor": "Operasyon (Admin)",
      "role": "Admin",
      "action": "Video ön kontrolden geçti",
      "target": "PRJ-2031 · Video 1"
    },
    {
      "date": "2026-10-30T10:00:00",
      "actor": "Operasyon (Admin)",
      "role": "Admin",
      "action": "Teklif gönderildi (₺2.100/video)",
      "target": "PRJ-2038 → Can T."
    },
    {
      "date": "2026-10-28T11:00:00",
      "actor": "Operasyon (Admin)",
      "role": "Admin",
      "action": "Paket fiyatı güncellendi: Kampanya ₺29.900",
      "target": "Paket: Kampanya"
    },
    {
      "date": "2026-10-15T10:00:00",
      "actor": "Operasyon (Admin)",
      "role": "Admin",
      "action": "Hak ediş ödendi olarak işaretlendi",
      "target": "PRJ-2015 · Zeynep K."
    }
  ],
  "session": {
    "role": null
  },
  "drafts": {},
  "preferences": [
    { "id": "pr-1", "brandId": "b-lumi", "creatorId": "c-ece", "date": "2026-11-02T09:05:00", "status": "yeni" },
    { "id": "pr-2", "brandId": "b-nova", "creatorId": "c-selin", "date": "2026-11-01T14:12:00", "status": "yeni", "projectId": "p-2036" },
    { "id": "pr-3", "brandId": "b-nova", "creatorId": "c-nil", "date": "2026-11-01T14:10:00", "status": "yeni", "projectId": "p-2036" },
    { "id": "pr-4", "brandId": "b-kahve", "creatorId": "c-deniz", "date": "2026-10-31T11:20:00", "status": "onerildi" },
    { "id": "pr-5", "brandId": "b-ritim", "creatorId": "c-mert", "date": "2026-10-29T08:50:00", "status": "inceleniyor", "projectId": "p-2038" },
    { "id": "pr-6", "brandId": "b-ritim", "creatorId": "c-can", "date": "2026-10-29T08:48:00", "status": "uygun_degil", "projectId": "p-2038" }
  ],
  "applications": []
};

export const DEMO_USERS = {
  "admin": {
    "name": "Operasyon Ekibi",
    "sub": "COUGC Admin",
    "email": "operasyon@cougc.demo",
    "home": "/admin"
  },
  "brand": {
    "name": "Elif Aydın",
    "sub": "Nova Kozmetik",
    "email": "elif@novakozmetik.demo",
    "brandId": "b-nova",
    "home": "/marka"
  },
  "creator": {
    "name": "Zeynep K.",
    "sub": "İçerik Üreticisi",
    "email": "zeynep@uretici.demo",
    "creatorId": "c-zeynep",
    "home": "/icerik-uretici"
  }
} as const;
