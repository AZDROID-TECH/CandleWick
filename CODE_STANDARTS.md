# 🚀 AI CODING STANDARDS (Telegram Mini App - Firebase Edition)

## 🌐 Genel Dil ve Yorumlama Kuralları
### ✅ Proje Dili ve Yorumlar
- **Tüm yorum satırları (kod içi açıklamalar, TODO’lar) daima Azerbaycanca olmalıdır.**
- **Kodun kendisi (değişkenler, fonksiyonlar) daima İngilizce olmalıdır.**

### ✅ Çok Dilli (Multilanguage) Yapı
- **Varsayılan: Azerbaycanca (az), İkinci: İngilizce (en)**
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
| **Icons** | **Boxicons** | SVG ikonlar. |

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

### ✅ Auth İşlemi (Telegram)

  - Kullanıcı Telegram `initData` ile doğrulanmalı ve Firebase Custom Token veya Anonymous Auth ile giriş yapmalıdır.
  - `useAuth` hook'u ile kullanıcı oturumu yönetilmelidir.

### ✅ Firestore (NoSQL) Veri Yapısı

  - **Collection & Doc:** Veriler Koleksiyon/Döküman yapısında tutulur.
  - **Alan Adları (Field Names):** Veritabanındaki alan adları (keys) **`snake_case`** olmalıdır.
      - Örn: `{ user_id: 123, total_coins: 5000, last_login: "..." }`
  - **Kod İçi Kullanım:** Kod içinde bu veriler `camelCase`'e dönüştürülerek kullanılmalıdır veya interface'ler buna göre ayarlanmalıdır.

### ✅ Veri Güvenliği

  - **Kritik İşlemler:** Puan ekleme gibi kritik işlemler mümkün olduğunca güvenli yapılmalı (Firestore Rules ile yazma izinleri kontrol edilmeli).

-----

## 📱 Telegram UX Kuralları

  - **Scroll Yok:** `overflow: hidden` ile sayfa kayması engellenmeli.
  - **Haptic Feedback:** Her tıklamada `WebApp.HapticFeedback.impactOccurred('light')` çalışmalı.
  - **Zoom Yok:** Meta etiketleri ile mobil zoom kapatılmalı.

## 🤖 AI Operasyon Kuralları

1.  **Mock First:** Firebase'i bağlamadan önce oyunu `mock` (sahte) verilerle çalışır hale getir.
2.  **Type Safety:** Firestore'dan gelen veriler için `types/firestore.ts` altında mutlaka Interface tanımla (`any` yasak).
3.  **Plan:** Veri yapısını (Schema) değiştirmeden önce kullanıcıya JSON formatında planı sun ve onay al.