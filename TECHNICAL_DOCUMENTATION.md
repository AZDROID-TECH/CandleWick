# 📚 CandleWick - Teknik Dokümantasyon

> **Proje Adı:** Candle Wick  
> **Versiyon:** 0.0.1  
> **Son Güncelleme:** 2026-02-08  
> **Tip:** Telegram Mini App (WebApp)

---

## 📋 İçindekiler

1. [Proje Genel Bakış](#-proje-genel-bakış)
2. [Teknoloji Yığını](#-teknoloji-yığını)
3. [Proje Yapısı](#-proje-yapısı)
4. [Konfigürasyon Dosyaları](#-konfigürasyon-dosyaları)
5. [Kaynak Kod Analizi](#-kaynak-kod-analizi)
   - [Giriş Noktaları](#giriş-noktaları)
   - [State Yönetimi](#state-yönetimi-redux)
   - [Firebase Entegrasyonu](#firebase-entegrasyonu)
   - [Custom Hooks](#custom-hooks)
   - [Oyun Mantığı](#oyun-mantığı-features-game)
   - [UI Bileşenleri](#ui-bileşenleri-features-ui)
   - [Yardımcı Modüller](#yardımcı-modüller-utils)
   - [Tipler](#tipler-types)
6. [Çoklu Dil Desteği](#-çoklu-dil-desteği-i18n)
7. [Veri Akışı](#-veri-akışı)
8. [Güvenlik ve Kurallar](#-güvenlik-ve-kurallar)

---

## 🎯 Proje Genel Bakış

**Candle Wick**, Telegram Mini App olarak geliştirilmiş bir **Flappy Bird tarzı clicker oyunudur**. Oyun, finansal grafik mumlarını (candlestick) tema olarak kullanır. Oyuncular yukarı/aşağı hareket eden bir "mum" karakterini kontrol ederek engelleri aşar ve **AZC (AZCash)** token'ları toplar.

### Ana Özellikler
- 🎮 Canvas tabanlı oyun motoru
- 💰 Günlük AZC kazanç limiti (1000 AZC/gün)
- 📊 Haftalık & Tüm Zamanların Liderlik Tabloları
- 📺 Reklam izleyerek devam etme ve 2x mükafat
- 👥 Arkadaş davet sistemi (Referral)
- 🌍 Çoklu dil desteği (İngilizce, Azerbaycanca)
- 📱 Telegram HapticFeedback entegrasyonu

---

## 🛠 Teknoloji Yığını

| Kategori | Teknoloji | Versiyon | Açıklama |
|:---------|:----------|:---------|:---------|
| **Core** | Vite | 5.1.4 | Build tool & dev server |
| **UI Framework** | React | 18.2.0 | Component tabanlı UI |
| **Language** | TypeScript | 5.2.2 | Tip güvenliği |
| **State Management** | Redux Toolkit | 2.2.1 | Global state yönetimi |
| **Styling** | TailwindCSS | 3.4.1 | Utility-first CSS |
| **Animations** | Framer Motion | 11.0.8 | React animasyonları |
| **Backend** | Firebase | 10.8.1 | Auth, Firestore |
| **i18n** | react-i18next | 14.1.0 | Çoklu dil |
| **Telegram SDK** | @twa-dev/sdk | 7.0.0 | Telegram WebApp API |
| **Icons** | Boxicons | 2.1.4 | SVG icon kütüphanesi |

### Bağımlılıklar

**Production:**
```json
{
  "@reduxjs/toolkit": "^2.2.1",
  "@twa-dev/sdk": "^7.0.0",
  "firebase": "^10.8.1",
  "framer-motion": "^11.0.8",
  "i18next": "^23.10.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-i18next": "^14.1.0",
  "react-redux": "^9.1.0"
}
```

**Development:**
```json
{
  "@types/react": "^18.2.64",
  "@types/react-dom": "^18.2.21",
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.18",
  "boxicons": "^2.1.4",
  "postcss": "^8.4.35",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.2.2",
  "vite": "^5.1.4"
}
```

---

## 📁 Proje Yapısı

```
CandleWick/
├── 📄 index.html              # HTML giriş noktası
├── 📄 package.json            # Proje meta verileri ve bağımlılıklar
├── 📄 vite.config.ts          # Vite yapılandırması
├── 📄 tsconfig.json           # TypeScript yapılandırması
├── 📄 tsconfig.node.json      # Node.js için TS yapılandırması
├── 📄 tailwind.config.js      # TailwindCSS yapılandırması
├── 📄 postcss.config.js       # PostCSS yapılandırması
├── 📄 CODE_STANDARTS.md       # Kodlama standartları
├── 📄 .env                    # Çevre değişkenleri (Firebase anahtarları)
├── 📄 .gitignore              # Git ignore kuralları
│
└── 📂 src/
    ├── 📄 main.tsx            # React giriş noktası
    ├── 📄 App.tsx             # Ana uygulama bileşeni
    ├── 📄 index.css           # Global stiller
    ├── 📄 i18n.ts             # Çoklu dil yapılandırması
    ├── 📄 vite-env.d.ts       # Vite tip tanımları
    │
    ├── 📂 app/                # Redux store yapılandırması
    │   ├── 📄 store.ts        # Store oluşturma
    │   └── 📄 hooks.ts        # Typed useDispatch/useSelector
    │
    ├── 📂 features/           # Feature bazlı modüller
    │   ├── 📂 game/           # Oyun mantığı
    │   │   ├── 📄 gameSlice.ts    # Redux slice (state/actions)
    │   │   ├── 📄 GameScreen.tsx  # Oyun ekranı wrapper
    │   │   └── 📄 GameCanvas.tsx  # Canvas tabanlı oyun motoru
    │   │
    │   └── 📂 ui/             # UI bileşenleri
    │       ├── 📄 Home.tsx            # Ana menü
    │       ├── 📄 GameOverModal.tsx   # Oyun sonu modalı
    │       ├── 📄 Leaderboard.tsx     # Liderlik tablosu
    │       ├── 📄 InviteModal.tsx     # Davet modalı
    │       ├── 📄 LoadingScreen.tsx   # Yükleme ekranı
    │       └── 📄 ResumeOverlay.tsx   # Devam et overlay
    │
    ├── 📂 firebase/           # Firebase yapılandırması
    │   ├── 📄 client.ts       # Firebase app başlatma
    │   ├── 📄 db.ts           # Firestore referansı
    │   └── 📄 auth.ts         # Firebase Auth referansı
    │
    ├── 📂 hooks/              # Custom React hooks
    │   ├── 📄 useAuth.ts      # Kimlik doğrulama hook'u
    │   └── 📄 useScoreSync.ts # Skor senkronizasyonu
    │
    ├── 📂 types/              # TypeScript tip tanımları
    │   └── 📄 firestore.ts    # Firestore veri modelleri
    │
    ├── 📂 utils/              # Yardımcı fonksiyonlar
    │   ├── 📄 dateUtils.ts    # Tarih/zaman fonksiyonları
    │   └── 📄 seedData.ts     # Test verisi oluşturma
    │
    └── 📂 assets/             # Statik dosyalar
        ├── 🖼️ AZCash.icon.png
        ├── 🖼️ AZCash.logo.png
        └── 📂 post_photo/
```

---

## ⚙️ Konfigürasyon Dosyaları

### 📄 `index.html`

HTML giriş noktası. Kritik özellikler:

```html
<!-- Mobil zoom engelleme (Telegram UX) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

<!-- Google Fonts: Ubuntu -->
<link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Boxicons CDN -->
<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

<!-- Reklam SDK'ları -->
<script src="https://sad.adsgram.ai/js/sad.min.js"></script>
<script src='//libtl.com/sdk.js' data-zone='10324597' data-sdk='show_10324597'></script>

<!-- Telegram WebApp SDK -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### 📄 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,    // Geliştirme portu
        host: true     // Network erişimi açık
    }
})
```

### 📄 `tsconfig.json`

```typescript
{
    "compilerOptions": {
        "target": "ES2020",        // Modern JS özellikleri
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "strict": true,            // Sıkı tip kontrolü
        "noUnusedLocals": true,    // Kullanılmayan değişken engeli
        "noUnusedParameters": true // Kullanılmayan parametre engeli
    },
    "include": ["src"]
}
```

### 📄 `tailwind.config.js`

```javascript
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Ubuntu', 'sans-serif'],  // Varsayılan font
            },
            colors: {
                wick: {
                    green: '#22c55e',  // Bullish (Yükseliş)
                    red: '#ef4444',    // Bearish (Düşüş)
                }
            }
        }
    }
}
```

---

## 💻 Kaynak Kod Analizi

---

### Giriş Noktaları

#### 📄 `src/main.tsx`

**Amaç:** React uygulamasının başlatılması

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'    // Global stiller
import './i18n'         // i18n başlatma
import WebApp from '@twa-dev/sdk'

// Telegram WebApp başlatma
WebApp.ready();   // WebApp hazır sinyali
WebApp.expand();  // Tam ekran mod

// Dil ayarı (Telegram kullanıcı dili)
if (WebApp.initDataUnsafe.user?.language_code === 'az') {
    // Varsayılan (İngilizce fallback)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
```

**Kritik Noktalar:**
- `WebApp.ready()`: Telegram'a uygulama hazır sinyali gönderir
- `WebApp.expand()`: Uygulamayı tam ekrana genişletir
- `initDataUnsafe.user`: Telegram kullanıcı bilgilerini içerir

---

#### 📄 `src/App.tsx`

**Amaç:** Ana uygulama bileşeni ve route yönetimi

**Yapı:**
```
App (Provider wrapper)
└── GameApp (Router logic)
    ├── LoadingScreen (isLoading)
    ├── Home (default)
    ├── GameScreen (isPlaying || isResuming || isGameOver)
    ├── ResumeOverlay (isResuming)
    └── GameOverModal (isGameOver)
```

**Kod:**
```typescript
const GameApp = () => {
    const { isPlaying, isGameOver, isLoading, isResuming } = useAppSelector(state => state.game);
    
    // Hooks başlatma
    useAuth();       // Firebase Auth + Firestore sync
    useScoreSync();  // Score senkronizasyonu

    if (isLoading) return <LoadingScreen />;

    return (
        <>
            {!isPlaying && !isGameOver && !isResuming && <Home />}
            {(isPlaying || isResuming || isGameOver) && <GameScreen />}
            {isResuming && <ResumeOverlay />}
            {isGameOver && <GameOverModal />}
        </>
    );
};

function App() {
    const { i18n } = useTranslation();

    useEffect(() => {
        // Telegram kullanıcı diline göre dil ayarla
        const userLang = WebApp.initDataUnsafe.user?.language_code;
        if (userLang && (userLang === 'en' || userLang === 'az')) {
            i18n.changeLanguage(userLang);
        } else {
            i18n.changeLanguage('en');
        }
        WebApp.expand();
    }, [i18n]);

    return (
        <Provider store={store}>
            <GameApp />
        </Provider>
    );
}
```

**Kritik Noktalar:**
- Redux `Provider` ile state sağlanır
- `useAuth` ve `useScoreSync` hooks'ları component mount'ta çalışır
- Koşullu render ile ekran yönetimi

---

#### 📄 `src/index.css`

**Amaç:** Global CSS stilleri ve Telegram UX optimizasyonları

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  line-height: 1.5;
  font-weight: 400;
  color-scheme: dark;  /* Dark mode */
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  inset: 0;
  overflow: hidden;           /* Scroll engelleme */
  overscroll-behavior: none;  /* Bounce efekti engelleme */
  touch-action: none;         /* Touch davranışları devre dışı */
}

body {
  font-family: 'Ubuntu', sans-serif;
  background-color: #0f172a;  /* Slate-900 */
  color: #ffffff;
  user-select: none;                      /* Metin seçimi engelleme */
  -webkit-user-select: none;
  -webkit-touch-callout: none;            /* iOS uzun basma menüsü engelleme */
  -webkit-tap-highlight-color: transparent; /* Tap highlight kaldırma */
}

* {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Telegram UX Kuralları Uyumu:**
- ✅ `overflow: hidden` - Scroll engellendi
- ✅ `touch-action: none` - Zoom engellendi
- ✅ `user-select: none` - Metin seçimi engellendi

---

### State Yönetimi (Redux)

#### 📄 `src/app/store.ts`

**Amaç:** Redux store yapılandırması

```typescript
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/game/gameSlice';

export const store = configureStore({
    reducer: {
        game: gameReducer,  // Tek reducer: game
    },
});

// TypeScript için tip tanımları
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
```

---

#### 📄 `src/app/hooks.ts`

**Amaç:** Typed Redux hooks

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Proje genelinde bu hook'lar kullanılmalı
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

#### 📄 `src/features/game/gameSlice.ts`

**Amaç:** Oyun state'i ve actions

**State Interface:**
```typescript
interface GameState {
    isPlaying: boolean;       // Oyun aktif mi?
    isGameOver: boolean;      // Oyun bitti mi?
    score: number;            // Mevcut skor
    highScore: number;        // En yüksek skor (tüm zamanlar)
    coins: number;            // Toplam AZC
    dailyEarnings: number;    // Günlük kazanç (max 1000)
    dailyHighScore: number;   // Günlük en yüksek skor
    weeklyHighScore: number;  // Haftalık en yüksek skor
    lastDailyReset: string;   // Son günlük sıfırlama (ISO)
    currentWeekId: string;    // Mevcut hafta ID (YYYY-Www)
    adWatchCount: number;     // İzlenen reklam sayısı (max 3)
    isLoading: boolean;       // Veri yükleniyor mu?
    sessionEarnings: number;  // Bu oturum kazancı
    isResuming: boolean;      // Devam etme modu?
    difficulty: number;       // Zorluk seviyesi (1-15)
    gameSessionId: number;    // Oturum ID (canvas reset için)
    friends: number[];        // Arkadaş ID listesi
}
```

**Actions:**

| Action | Açıklama |
|:-------|:---------|
| `startGame` | Yeni oyun başlatır, state sıfırlar |
| `endGame` | Oyunu bitirir, high score günceller |
| `incrementScore` | Skor artırır |
| `collectCoin` | AZC toplar (günlük limite tabi) |
| `claimDoubleReward` | 2x mükafat (reklam sonrası) |
| `resetGame` | Oyunu tamamen sıfırlar |
| `setHighScore` | High score ayarlar |
| `setUserData` | Firebase'den gelen veriyi yükler |
| `setDifficulty` | Zorluk seviyesi ayarlar |
| `continueGame` | Reklam sonrası devam modu |
| `resumeGame` | Devam modundan oyuna geçiş |

**Günlük Limit Mantığı:**
```typescript
collectCoin: (state, action: PayloadAction<number>) => {
    const amount = action.payload;
    const MAX_DAILY_LIMIT = 1000;

    if (state.dailyEarnings + amount <= MAX_DAILY_LIMIT) {
        state.coins += amount;
        state.dailyEarnings += amount;
        state.sessionEarnings += amount;
    } else {
        // Kısmi ekleme (limite kadar)
        const allowed = Math.max(0, MAX_DAILY_LIMIT - state.dailyEarnings);
        if (allowed > 0) {
            state.coins += allowed;
            state.dailyEarnings += allowed;
            state.sessionEarnings += allowed;
        }
    }
}
```

---

### Firebase Entegrasyonu

#### 📄 `src/firebase/client.ts`

**Amaç:** Firebase App başlatma

```typescript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
console.log("🔥 Firebase Initialized for Project:", firebaseConfig.projectId);

export default app;
```

**Çevre Değişkenleri (.env):**
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_DATABASE_URL=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_MEASUREMENT_ID=xxx
```

---

#### 📄 `src/firebase/db.ts`

**Amaç:** Firestore referansı

```typescript
import { initializeFirestore } from 'firebase/firestore';
import app from './client';

const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true  // undefined alanları görmezden gel
});

export default db;
```

---

#### 📄 `src/firebase/auth.ts`

**Amaç:** Firebase Auth referansı

```typescript
import { getAuth } from 'firebase/auth';
import app from './client';

const auth = getAuth(app);

export default auth;
```

---

### Custom Hooks

#### 📄 `src/hooks/useAuth.ts`

**Amaç:** Kimlik doğrulama ve Firestore veri senkronizasyonu

**Satır Sayısı:** 312 satır

**İş Akışı:**
```
1. Firebase Anonymous Auth
      ↓
2. Telegram User ID al
      ↓
3. Firestore'da kullanıcı var mı?
      ├── VAR → Veriyi oku, güncellemeleri kontrol et
      │         ├── Günlük sıfırlama gerekli mi?
      │         ├── Haftalık sıfırlama gerekli mi?
      │         ├── Ülke kodu eksik mi? (IPAPI)
      │         └── Referral işleme
      └── YOK → Yeni kullanıcı oluştur
                ├── IPAPI ile ülke kodu
                ├── Referral bağlantısı
                └── Varsayılan değerler
      ↓
4. Redux'a dispatch et (setUserData)
```

**Kritik Fonksiyonlar:**

1. **Günlük Sıfırlama:**
```typescript
const currentUSDate = getUSDateString();  // NY timezone
const shouldResetDaily = storedResetDate !== currentUSDate;

if (shouldResetDaily) {
    updateData.daily_earnings = 0;
    updateData.daily_high_score = 0;
    updateData.last_daily_reset = currentUSDate;
}
```

2. **Haftalık Sıfırlama:**
```typescript
const currentWeekId = getCurrentWeekId();  // YYYY-Www format
const shouldResetWeekly = storedWeekId !== currentWeekId;

if (shouldResetWeekly) {
    updateData.weekly_high_score = 0;
    updateData.current_week_id = currentWeekId;
}
```

3. **Referral (Arkadaş Ekleme):**
```typescript
const startParam = WebApp.initDataUnsafe.start_param;
if (startParam) {
    const referrerId = parseInt(startParam);
    // Karşılıklı arkadaş ekleme
    updateData.friends = [...currentFriends, referrerId];
    // Referrer'a da ekle (async)
    await updateDoc(referrerRef, { friends: [...refFriends, telegramUser.id] });
}
```

4. **Ülke Kodu (IPAPI):**
```typescript
const ipResponse = await fetch('https://ipapi.co/json/', {
    signal: controller.signal  // 2 saniye timeout
});
if (ipResponse.ok) {
    const ipData = await ipResponse.json();
    currentCountryCode = ipData.country_code;  // "AZ", "TR", etc.
}
```

---

#### 📄 `src/hooks/useScoreSync.ts`

**Amaç:** Skor ve veri senkronizasyonu

```typescript
export const useScoreSync = () => {
    const { highScore, coins, dailyEarnings, dailyHighScore, 
            weeklyHighScore, lastDailyReset, currentWeekId } = useAppSelector(state => state.game);
    const userId = WebApp.initDataUnsafe.user?.id;

    useEffect(() => {
        if (!userId || !currentWeekId) return;

        const syncScore = async () => {
            try {
                const userRef = doc(db, 'users', userId.toString());
                await updateDoc(userRef, {
                    high_score: highScore,
                    total_azc: coins,
                    daily_earnings: dailyEarnings,
                    daily_high_score: dailyHighScore,
                    weekly_high_score: weeklyHighScore,
                    last_daily_reset: lastDailyReset,
                    current_week_id: currentWeekId
                });
            } catch (error) {
                console.error("Score sync failed", error);
            }
        };

        if (highScore > 0) {
            syncScore();
        }
    }, [highScore, coins, dailyEarnings, dailyHighScore, 
        weeklyHighScore, lastDailyReset, currentWeekId, userId]);
};
```

**Tetikleme:** State değişikliklerinde (özellikle `highScore > 0` olduğunda)

---

### Oyun Mantığı (`features/game`)

#### 📄 `src/features/game/GameCanvas.tsx`

**Amaç:** Canvas tabanlı ana oyun motoru

**Satır Sayısı:** 578 satır

**Oyun Parametreleri:**
```typescript
const GRAVITY = 0.5;           // Düşme hızı
const LIFT = -0.8;             // Yükselme hızı (basılı tutarken)
const BASE_SCROLL_SPEED = 3;   // Temel engel hızı
const BASE_OBSTACLE_INTERVAL = 2000;  // Engel aralığı (ms)
const CANDLE_WIDTH = 20;       // Mum genişliği (px)
const CANDLE_HEIGHT = 40;      // Mum yüksekliği (px)
```

**Zorluk Sistemi:**
| Seviye | Hız | Engel Aralığı | Boşluk |
|:-------|:----|:--------------|:-------|
| 1 | 3.0 | 2000ms | 250px |
| 5 | 5.0 | 1520ms | 210px |
| 10 | 7.5 | 920ms | 160px |
| 15 | 10.0 | 900ms (min) | 130px (min) |

**Formüller:**
```typescript
// Sürət
const currentSpeed = BASE_SCROLL_SPEED + (difficulty - 1) * 0.5;

// Engel Aralığı (min 900ms)
const currentInterval = Math.max(BASE_OBSTACLE_INTERVAL - (difficulty - 1) * 120, 900);

// Boşluk Ölçüsü (min 130px)
const GAP_SIZE = Math.max(250 - (difficulty - 1) * 10, 130);
```

**Zorluk Artışı:**
```typescript
// Hər 20 maneə = 1 Səviyyə (maks 15)
const newDifficulty = Math.min(Math.floor(obstaclesPassed / 20) + 1, 15);
```

**Bonus Sistemi (AZC):**
```typescript
// Şans: %15, Garanti: 7 engeldan sonra
const isLucky = Math.random() < 0.15;
const isGuaranteed = obstaclesSinceLastCoin >= 7;

if (isBelowLimit && (isLucky || isGuaranteed)) {
    // AZC değeri (seviyeye göre)
    if (difficulty === 1) bonusValue = 5-10;
    else if (difficulty === 2) bonusValue = 11-20;
    else if (difficulty === 3) bonusValue = 21-30;
    else if (difficulty === 4) bonusValue = 31-40;
    else bonusValue = 41-50;
}
```

**Ölümsüzlük (Devam Etme):**
```typescript
// 5 saniye ölümsüzlük
gameStateRef.current.immortalUntil = Date.now() + 5000;

// Çarpışma kontrolünde
if (Date.now() < state.immortalUntil) {
    return; // Ölme, geç
}
```

**Trend Renkleri:**
```typescript
// Yuxarı hərəkət (Y kiçilir) => Bullish (Yaşıl)
// Aşağı hərəkət (Y böyüyür) => Bearish (Qırmızı)
if (topHeight < lastTop.height - 5) {
    trend = 'bull';  // #22c55e
} else if (topHeight > lastTop.height + 5) {
    trend = 'bear';  // #ef4444
}
```

---

#### 📄 `src/features/game/GameScreen.tsx`

**Amaç:** Oyun ekranı wrapper'ı

```typescript
const GameScreen: React.FC = () => {
    const { score, coins, dailyEarnings, difficulty, gameSessionId } = useAppSelector(state => state.game);
    const { t } = useTranslation();

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900">
            {/* Canvas - key ile reset */}
            <GameCanvas key={gameSessionId} />

            {/* Sol üst: Skor */}
            <div className="absolute top-4 left-4 z-10">
                <div className="text-4xl text-yellow-400">{Math.floor(score)}</div>
                <div className="text-xs text-slate-400">{t('score')}</div>
            </div>

            {/* Sağ üst: Level + Coins */}
            <div className="absolute top-4 right-4 z-10">
                <span className="bg-blue-600/80">LVL {difficulty}</span>
                <div className="flex items-center">
                    <img src={AZCashLogo} className="w-5 h-5" />
                    <span className="text-yellow-400">{coins}</span>
                </div>
                <div>{t('daily_stats', { current: dailyEarnings, max: 1000 })}</div>
            </div>
        </div>
    );
};
```

---

### UI Bileşenleri (`features/ui`)

#### 📄 `src/features/ui/Home.tsx`

**Amaç:** Ana menü ekranı (228 satır)

**Özellikler:**
- Dil değiştirici (EN/AZ)
- Kullanıcı bilgisi ve coin bakiyesi
- Günlük limit uyarısı
- Arkadaş davet butonu
- Oyunu başlat butonu
- Liderlik tablosu & Market butonları
- High score gösterimi
- NY timezone saati

**Limit Uyarısı:**
```typescript
const isLimitReached = dailyEarnings >= 1000;

{isLimitReached && (
    <div className="bg-yellow-500/10 border-yellow-500/30">
        <div>{t('score_only_mode')}</div>
        <div>{t('time_left')}: {timeLeft}</div>
    </div>
)}
```

---

#### 📄 `src/features/ui/GameOverModal.tsx`

**Amaç:** Oyun sonu ekranı (193 satır)

**Butonlar:**
1. **Yeniden Başla** - Hemen yeni oyun
2. **Reklam İzle (Devam Et)** - Monetag SDK (max 3x)
3. **Çıkış** - Ana menüye dön
4. **2x Mükafat** - Adsgram SDK

**Reklam Entegrasyonları:**

*Monetag (Devam Et):*
```typescript
const showMonetagAd = (onReward: () => void) => {
    const showAdFn = (window as any).show_10324597;
    showAdFn().then(() => {
        onReward();
    });
};
```

*Adsgram (2x Mükafat):*
```typescript
const showAdsgramAd = async (blockId: string, onReward: () => void) => {
    const AdController = (window as any).Adsgram.init({
        blockId: blockId,
        debug: false
    });

    const startTime = Date.now();
    AdController.show().then(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 15000) {
            // Reklam erken kapatıldı
            WebApp.showAlert(t('ad_warning_short'));
            return;
        }
        onReward();
    });
};
```

---

#### 📄 `src/features/ui/Leaderboard.tsx`

**Amaç:** Liderlik tablosu (277 satır)

**Tablar:**
- **Haftalık** - `weekly_high_score` sıralaması
- **Tüm Zamanlar** - `high_score` sıralaması
- **Arkadaşlar** - Redux `friends` listesi

**Firestore Sorguları:**

*Haftalık:*
```typescript
query(
    usersRef,
    where('current_week_id', '==', currentWeekId),
    orderBy('weekly_high_score', 'desc'),
    limit(100)
)
```

*Tüm Zamanlar:*
```typescript
query(usersRef, orderBy('high_score', 'desc'), limit(100))
```

*Arkadaşlar (Batch):*
```typescript
// Firestore IN limit: 10 per batch
for (const batch of friendBatches) {
    const batchQ = query(usersRef, where('user_id', 'in', batch));
    // Client-side sorting
}
```

**Bayrak Emoji Fonksiyonu:**
```typescript
const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return '🏳️';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};
// "AZ" → "🇦🇿"
```

---

#### 📄 `src/features/ui/InviteModal.tsx`

**Amaç:** Arkadaş davet modalı (162 satır)

**Paylaşım Platformları:**
- Telegram (`t.me/share/url`)
- WhatsApp (`wa.me`)
- Sistem paylaşımı (`navigator.share`)

**Clipboard Kopyalama (Fallback):**
```typescript
const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        // Fallback: textarea trick
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
};
```

---

#### 📄 `src/features/ui/LoadingScreen.tsx`

**Amaç:** Yükleme ekranı (33 satır)

**Özellikler:**
- AZCash logo animasyonu (bounce)
- Spinner
- "Loading Data..." mesajı

---

#### 📄 `src/features/ui/ResumeOverlay.tsx`

**Amaç:** Devam etme overlay'i (40 satır)

**Özellikler:**
- "HAZIRSAN?" başlığı
- Büyük "GO!" butonu
- Haptic feedback

---

### Yardımcı Modüller (`utils`)

#### 📄 `src/utils/dateUtils.ts`

**Amaç:** Tarih/zaman fonksiyonları (60 satır)

**Timezone:** America/New_York (NY)

**Fonksiyonlar:**

| Fonksiyon | Açıklama | Örnek Çıktı |
|:----------|:---------|:------------|
| `getNYDate()` | NY timezone Date objesi | Date object |
| `getUSDateString()` | NY tarih string'i | "02/08/2026" |
| `getCurrentWeekId()` | ISO hafta ID | "2026-W06" |
| `getTimeUntilWeeklyReset()` | Haftalık reset'e ms | 172800000 |
| `formatTimeRemaining(ms)` | Okunabilir format | "2d 10h 45m" |

---

#### 📄 `src/utils/seedData.ts`

**Amaç:** Test verisi oluşturma (49 satır)

```typescript
export const seedDatabase = async (count: number = 50) => {
    const NAMES = ["Ali", "Vali", "Aysel", ...];
    const COUNTRIES = ["AZ", "TR", "US", "RU", "GB", "DE"];

    for (let i = 0; i < count; i++) {
        const user: FirestoreUser = {
            user_id: 1000000 + i,
            first_name: randomName,
            high_score: Math.floor(Math.random() * 5000),
            // ... diğer alanlar
        };
        await setDoc(doc(db, 'users', id.toString()), user);
    }
};
```

---

### Tipler (`types`)

#### 📄 `src/types/firestore.ts`

**Amaç:** Firestore veri modeli

```typescript
export interface FirestoreUser {
    user_id: number;              // Telegram User ID
    username?: string;            // @username
    first_name: string;           // Görünen ad
    total_azc: number;            // Toplam AZC
    high_score: number;           // Tüm zamanların en yüksek skoru
    referrals: number[];          // Davet edilen kullanıcı ID'leri
    referred_by?: number;         // Davet eden kullanıcı ID
    friends: number[];            // Arkadaş listesi
    completed_tasks: string[];    // Tamamlanan görevler
    daily_earnings: number;       // Günlük kazanç
    daily_high_score?: number;    // Günlük en yüksek skor
    weekly_high_score?: number;   // Haftalık en yüksek skor
    last_daily_reset: string;     // Son günlük sıfırlama (ISO)
    current_week_id?: string;     // Mevcut hafta ID
    country_code?: string;        // Ülke kodu (ISO 2)
    created_at: string;           // Hesap oluşturma tarihi
    last_login: string;           // Son giriş tarihi
}
```

**Firestore Alan Adlandırma:**
- Veritabanı: `snake_case` (örn: `user_id`, `total_azc`)
- Kod içi: `camelCase` (örn: `userId`, `totalAzc`) - gerektiğinde dönüştürülür

---

## 🌍 Çoklu Dil Desteği (i18n)

#### 📄 `src/i18n.ts`

**Desteklenen Diller:**
- `en` - İngilizce (varsayılan)
- `az` - Azerbaycanca

**Toplam Anahtar:** 50

**Örnek Çeviriler:**
| Anahtar | EN | AZ |
|:--------|:---|:---|
| `start_game` | Start Game | Oyuna Başla |
| `game_over` | LIQUIDATED! | LİKVİDASİYON! |
| `daily_stats` | Daily: {{current}}/{{max}} | Günlük: {{current}}/{{max}} |

**Kullanım:**
```typescript
const { t } = useTranslation();
t('start_game');  // "Start Game" veya "Oyuna Başla"
t('daily_stats', { current: 500, max: 1000 });  // "Daily: 500/1000"
```

---

## 🔄 Veri Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│                          TELEGRAM                                │
│                     WebApp.initDataUnsafe                        │
│                      (user, language, startParam)                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       useAuth Hook                               │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│   │ Firebase    │───▶│ Firestore   │───▶│ Redux       │         │
│   │ Auth        │    │ Query       │    │ setUserData │         │
│   └─────────────┘    └─────────────┘    └─────────────┘         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Redux Store                               │
│   ┌───────────────────────────────────────────────────────┐     │
│   │                    game slice                          │     │
│   │  isPlaying, score, coins, dailyEarnings, highScore... │     │
│   └───────────────────────────────────────────────────────┘     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │   Home    │   │ GameScreen│   │Leaderboard│
        │   UI      │   │ + Canvas  │   │   UI      │
        └───────────┘   └───────────┘   └───────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     useScoreSync Hook                            │
│        Redux değişikliklerini Firestore'a yazar                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Güvenlik ve Kurallar

### Firestore Security Rules (Önerilen)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Okuma: Herkes (liderlik tablosu için)
      allow read: if true;
      
      // Yazma: Sadece kendi belgesi
      allow write: if request.auth != null 
                   && request.auth.uid != null;
      
      // Kritik alanlar için sınırlama
      allow update: if request.auth != null
                    && request.resource.data.total_azc <= resource.data.total_azc + 1000
                    && request.resource.data.daily_earnings <= 1000;
    }
  }
}
```

### Gerekli Firestore Indexleri

```
Collection: users
├── Index 1: current_week_id ASC, weekly_high_score DESC
├── Index 2: high_score DESC
└── Index 3: user_id IN (composite değil, basit)
```

---

## 📊 Özet

| Metrik | Değer |
|:-------|:------|
| **Toplam Dosya** | 24 |
| **Toplam Satır** | ~2,500 |
| **Component Sayısı** | 9 |
| **Hook Sayısı** | 4 |
| **Redux Actions** | 10 |
| **i18n Anahtarları** | 50 |
| **Desteklenen Dil** | 2 (EN, AZ) |

---

**Hazırlayan:** Antigravity AI  
**Tarih:** 2026-02-08
