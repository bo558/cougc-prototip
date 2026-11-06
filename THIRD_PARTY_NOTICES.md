# Üçüncü taraf bildirimleri

Bu prototipte aşağıdaki açık lisanslı varlıklar kullanılmaktadır. Lisans metinlerinin tam hâli
`public/licenses/` klasöründedir ve yayınlanan sitede `/licenses/` adresinden de erişilebilir.

## Lucide ikonları

- Kullanım: `src/components/ui/icon-paths.ts` içindeki SVG ikon yolları Lucide ikon setinden alınmıştır
  (bazıları birebir, bazıları sadeleştirilmiş).
- Lisans: **ISC License** — Copyright (c) Lucide Icons and Contributors
- Lucide'ın Feather projesinden türetilen ikonları için ek olarak: **MIT License** — Copyright (c) 2013-present Cole Bemis
- Kaynak: https://github.com/lucide-icons/lucide
- Tam metin: [`public/licenses/lucide-LICENSE.txt`](public/licenses/lucide-LICENSE.txt)

## Inter (yazı tipi)

- Kullanım: gövde metni. `next/font/google` ile derleme sırasında indirilir ve sitenin içinden sunulur.
- Lisans: **SIL Open Font License 1.1** — Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter)
- Tam metin: [`public/licenses/Inter-OFL.txt`](public/licenses/Inter-OFL.txt)

## Plus Jakarta Sans (yazı tipi)

- Kullanım: başlıklar. `next/font/google` ile derleme sırasında indirilir ve sitenin içinden sunulur.
- Lisans: **SIL Open Font License 1.1** — Copyright 2020 The Plus Jakarta Sans Project Authors (https://github.com/tokotype/PlusJakartaSans)
- Tam metin: [`public/licenses/PlusJakartaSans-OFL.txt`](public/licenses/PlusJakartaSans-OFL.txt)

## Diğer

- **CoUGC logosu** (`src/assets/logo/`): Cogros / COUGC'ye aittir; açık lisanslı değildir.
  Bu depo herkese açık olsa bile logonun izinsiz kullanımına izin verilmez.
- npm bağımlılıkları (Next.js, React, zustand vb.) kendi lisanslarıyla `package-lock.json` üzerinden kurulur
  ve depoya eklenmez; derlenmiş sitede yalnızca küçültülmüş çalışma kodları yer alır.
