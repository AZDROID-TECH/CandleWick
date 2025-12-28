# 🕯️ CandleWick Kod Tabanı İnceleme Raporu

**Tarih:** 2025-12-15
**İnceleyen:** Antigravity Agent
**Konu:** Kod Standartları ve Yapı Analizi

---

## Yönetici Özeti
`CandleWick` projesi, Vite, React ve Firebase ile oluşturulmuş iyi yapılandırılmış bir Telegram Mini Uygulamasıdır. Proje, `CODE_STANDARTS.md` içinde tanımlanan mimari ve teknolojik gereksinimlerin çoğuna uymaktadır. Ancak, yorum satırlarının dili (Azerbaycanca yerine İngilizce/Karışık) ve katı tip güvenliği (`any` kullanımı) konusunda **kritik ihlaller** bulunmaktadır.

## 📊 Uyumluluk Denetimi

| Kategori | Gereksinim | Durum | Bulgular |
| :--- | :--- | :--- | :--- |
| **Dil** | Yorumlar Azerbaycanca olmalı | ❌ **BAŞARISIZ** | `gameSlice.ts`, `useAuth.ts`, `GameCanvas.tsx` içindeki çoğu yorum İngilizce veya Karışık. |
| **Dil** | Kod tanımlayıcıları İngilizce olmalı | ✅ **BAŞARILI** | Değişken/Fonksiyon isimleri tutarlı bir şekilde İngilizce. |
| **Teknoloji** | Vite + React 18 + TS + Redux | ✅ **BAŞARILI** | `package.json` doğru yığını doğruluyor. |
| **Yapı** | `src/features`, `firebase`, vb. | ✅ **BAŞARILI** | Klasör yapısı standarta uyuyor. |
| **Firebase** | DB'de `snake_case` | ✅ **BAŞARILI** | `firestore.ts` arayüzlerinde ve `setDoc` çağrılarında doğrulandı. |
| **Firebase** | `any` tipi yok (Katı Tipleme) | ❌ **BAŞARISIZ** | `src/hooks/useAuth.ts` içinde açıkça `any` kullanımı bulundu. |
| **Telegram UX** | Scroll Yok, Haptic Feedback | ✅ **BAŞARILI** | `overflow: hidden` (body üzerinde ima edilen), `HapticFeedback` kullanımı doğrulandı. |
| **i18n** | Kullanıcı Dilini Otomatik Algıla | ✅ **BAŞARILI** | `App.tsx` içinde `WebApp.initDataUnsafe` üzerinden uygulanmış. |

---

## 🚨 Kritik İhlaller

### 1. Yorum Dili (Kod tabanı geneli)
**Kural:** "Tüm yorum satırları (kod içi açıklamalar, TODO’lar) daima Azerbaycanca olmalıdır."
**İhlal:**
- `src/features/game/gameSlice.ts`: `// Redux state for daily tracking`
- `src/features/game/GameCanvas.tsx`: `// Safety Reset on Resume`, `// Precise Resume Logic`
- `src/hooks/useAuth.ts`: `// Sign in anonymously...`, `// Sync with Firestore...`
**Gereken İşlem:** Tüm yorumları Azerbaycanca diline çevirin.

### 2. Tip Güvenliği (`useAuth.ts`)
**Kural:** "Firestore'dan gelen veriler için `types/firestore.ts` altında mutlaka Interface tanımla (`any` yasak)."
**İhlal:**
- `src/hooks/useAuth.ts` (Satır 47): `const updateData: any = { ... }`
- `src/hooks/useAuth.ts` (Satır 30): `const data = userSnap.data();` (`FirestoreUser` olarak cast edilmemiş).
**Gereken İşlem:** `any` kaldırılmalı, `../types/firestore` üzerinden `FirestoreUser` import edilmeli ve veri cast edilmeli: `const data = userSnap.data() as FirestoreUser;`.

---

## 🔍 Yapısal ve Mantıksal Analiz

### Gereksizlik & Tekrar
Kod genellikle DRY (Kendini Tekrar Etme) prensibine uygundur.
- **Mantık Ayrımı:**
    - **State (Durum):** `gameSlice.ts` gerçeği yönetir (Skor, Coinler, Günlük Limitler).
    - **Görsel:** `GameCanvas.tsx` 60fps performansı için durumu yansıtır ancak kritik güncellemeler için Redux'a dispatch eder. Bu, Canvas performansı için **gerekli** bir tekrardır.
    - **Kalıcılık:** `useAuth.ts` başlangıç durumunu yükler, `useScoreSync.ts` güncellemeleri kaydeder. Bu temiz bir sorumluluk ayrımıdır.

### Kullanılmayan Kod / Potansiyel Temizlik
1. **`src/types/firestore.ts`**: `FirestoreUser` arayüzü mevcut ancak **yetersiz kullanılıyor**. En çok ihtiyaç duyulan `useAuth.ts` içinde import edilmemiş.
2. **`GameCanvas.tsx`**: `isBelowLimit` mantığı günlük limitleri yerel olarak yeniden hesaplıyor. Anında geri bildirim için iyi olsa da, `gameSlice`'ın katı `MAX_DAILY_LIMIT` değeriyle senkronize kaldığından emin olun.

---

## 🛠 Öneriler

1.  **`useAuth.ts` Refaktörü**:
    - `FirestoreUser`'ı import edin.
    - Veriyi `userSnap.data() as FirestoreUser` olarak alın.
    - `updateData` üzerinden `any` ifadesini kaldırın. Gerekirse `Partial<FirestoreUser>` tanımlayın.
2.  **Yorumları Çevirin**:
    - `src/` üzerinde bir geçiş yaparak tüm İngilizce yorumları Azerbaycanca diline çevirin.
3.  **Katı Mod (Strict Mode)**:
    - Bu sorunları otomatik olarak yakalamak için, eğer zaten katı değilse, `tsconfig.json` içinde `noImplicitAny` özelliğini etkinleştirmeyi düşünün.

