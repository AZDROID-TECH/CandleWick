# 🚀 AI CODING STANDARDS (Telegram Mini App - Firebase Edition)

## 🌐 Genel Dil ve Yorumlama Kuralları
### ✅ Proje Dili ve Yorumlar
- **Tüm yorum satırları (kod içi açıklamalar, TODO’lar) daima Azerbaycanca olmalıdır.**
- **Kodun kendisi (değişkenler, fonksiyonlar) daima İngilizce olmalıdır.**

### ✅ Çok Dilli (Multilanguage) Yapı
- **Varsayılan: İngilizce (en), İkinci: Azerbaycanca (az)**
- `react-i18next` zorunludur. Telegram kullanıcısının diline (`WebApp.initDataUnsafe.user.language_code`) göre otomatik dil seçimi yapılmalıdır.
 
---
 
## 🛠️ Kullanılan Teknolojiler (Zorunlu)

| Kategori | Teknoloji / Kütüphane | Açıklama |
| :--- | :--- | :--- |
| **Telegram SDK** | **@twa-dev/sdk** | Telegram WebApp entegrasyonu için zorunlu. |
| **Core** | **Vite + React 18 + TS** | Proje iskeleti. |
| **State** | **Redux Toolkit** | Oyun durumu (Score, Level) yönetimi. |
| **Styling** | **TailwindCSS + Framer Motion** | UI ve Animasyonlar (Click pop, transitions). |
| **Backend** | **Firebase** | Auth, Firestore (DB), Storage. |
| **Sunucu (Doğrulama)** | **Vercel Serverless Functions** | `initData` doğrulaması və server-authoritative skor yazımı üçün (`/api/*`). |
| **Reklam** | **Adsgram + Monetag** | `Adsgram` (rewarded/2x) və `Monetag` (`show_10324597`, davam etmə) fallback zənciri. |
| **Icons** | **Boxicons (self-hosted)** | `boxicons` npm paketindən import edilir. CDN (`unpkg`) istifadə edilməz — CSP/SRI üçün lokal host məcburidir. |

---

## 🧱 Kod ve Klasör Yapısı

src/
├── features/
│   ├── game/           # 🎮 OYUN MANTIĞI
│   │   ├── gameSlice.ts      # Redux State
│   │   ├── ClickerArea.tsx   # Tıklama alanı
│   │   └── upgrades/         # Yükseltme kartları
├── firebase/           # 🔥 Firebase Config
│   ├── client.ts       # App initialize
│   ├── db.ts           # Firestore referansları
│   └── auth.ts         # Auth metodları
├── hooks/              # useTelegram, useFirestore
├── types/              # TS Interface'leri
└── utils/              # Helperlar


-----

## 🔥 Firebase & Veri Kuralları (Kritik)

### ✅ Auth İşlemi (Telegram) — ZORUNLU AKIŞ

  - **`initData` sunucuda doğrulanmalıdır.** İstemci `WebApp.initData` (raw string) değerini bir Vercel Serverless endpoint'ine (`/api/session`) gönderir; sunucu bot token ile **HMAC-SHA256** doğrulaması yapar ve `auth_date` tazeliğini (≤ 24s) kontrol eder.
  - **`initDataUnsafe` yalnızca UI için** (ad/avatar gösterimi) kullanılabilir; **asla kimlik/yetki kararı için kullanılmaz.**
  - Sunucu doğrulama sonrası **Firebase Custom Token** üretir; `uid = Telegram user_id`. İstemci `signInWithCustomToken` ile giriş yapar. **Anonymous Auth kullanılmaz** (cihaz-bağımlı UID ilerleme kaybına yol açar).
  - `useAuth` hook'u ile oturum yönetilir.

### ✅ Firestore (NoSQL) Veri Yapısı

  - **Collection & Doc:** Veriler Koleksiyon/Döküman yapısında tutulur.
  - **Alan Adları (Field Names):** Veritabanındaki alan adları (keys) **`snake_case`** olmalıdır.
      - Örn: `{ user_id: 123, total_coins: 5000, last_login: "..." }`
  - **Kod İçi Kullanım:** Kod içinde bu veriler `camelCase`'e dönüştürülerek kullanılmalıdır veya interface'ler buna göre ayarlanmalıdır.

### ✅ Veri Güvenliği (Server-Authoritative)

  - **Kritik alanlar yalnızca sunucudan yazılır.** `total_azc`, `high_score`, `weekly_high_score`, `daily_earnings`, `friends`, `referred_by` gibi ekonomiyi/sıralamayı etkileyen alanlar **istemciden yazılamaz**. İstemci skoru `/api/submit-score`'a gönderir; sunucu (Firebase Admin SDK) sınırları (günlük 1000 limiti, makul artış) doğrulayıp yazar.
  - **Firestore Rules:** İstemci yazımı kritik alanlar için reddedilmeli; okuma yalnızca PII içermeyen sıralama alanlarıyla sınırlandırılmalı. Doküman ID = `Telegram user_id` ve `request.auth.uid == user_id` kuralı ile hesap gaspı engellenmeli.
  - **Sırlar:** Bot token ve Firebase service-account anahtarı **yalnızca sunucu env değişkenlerinde** tutulur; asla istemci bundle'ına (`VITE_*`) konmaz.

-----

## 📱 Telegram UX Kuralları

  - **Scroll Yok:** `overflow: hidden` ile sayfa kayması engellenmeli.
  - **Haptic Feedback:** Her tıklamada `WebApp.HapticFeedback.impactOccurred('light')` çalışmalı.
  - **Zoom Yok:** Meta etiketleri ile mobil zoom kapatılmalı.

## 🤖 AI Operasyon Kuralları

1.  **Mock First:** Firebase'i bağlamadan önce oyunu `mock` (sahte) verilerle çalışır hale getir.
2.  **Type Safety:** Firestore'dan gelen veriler için `types/firestore.ts` altında mutlaka Interface tanımla (`any` yasak). Dış sınırda (Firestore/`initData`/API yanıtı) veri **Zod** ile doğrulanmalı; doğrulanmamış `as` cast'i güvenilmez veri için yasaktır.
3.  **Plan:** Veri yapısını (Schema) değiştirmeden önce kullanıcıya JSON formatında planı sun ve onay al.

## 🧪 Test & Kalite

1.  **Birim testleri:** Saf yardımcılar (`utils/`), Redux reducer'ları ve doğrulama fonksiyonları için **Vitest** ile test yazılmalı.
2.  **Lint:** `react-hooks/exhaustive-deps` aktif olmalı; bağımlılık kasıtlı atlanıyorsa Azerbaycanca gerekçeli `// eslint-disable-next-line` yorumu eklenmeli.
3.  **CSP/SRI:** Üçüncü taraf script'ler (reklam, Telegram SDK) için Content-Security-Policy tanımlanmalı; kaçınılmaz harici script'lere SRI eklenmelidir.