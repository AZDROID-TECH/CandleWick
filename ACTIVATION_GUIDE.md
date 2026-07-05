# 🚀 Candle Wick — Backend Aktivasyon Rehberi

Bu rehber, yeni yazılan güvenli backend'i (initData doğrulama + sunucu-otoriter skor) **canlı oyunu bozmadan**, kademeli olarak devreye almak içindir.

> **Mevcut durum:** Tüm kod yazıldı ve `VITE_USE_BACKEND=0` (kapalı) olduğu için oyun **şu an aynen eskisi gibi** (anonim auth + doğrudan Firestore) çalışıyor. Aşağıdaki adımlar backend'i açar.

---

## 0) Bağımlılıkları kur (bir kez)
```bash
npm install
```
Eklenenler: `firebase-admin`, `@vercel/node`, `zod`, `vitest`, `boxicons` (artık dependency).

Doğrulama:
```bash
npm run build   # temiz derlenmeli
npm test        # 16 test geçmeli
```

---

## 1) Sırları hazırla (senin yapman gereken)

**a) Telegram bot token** — BotFather → botun → *API Token*. (Örn: `123456:ABC...`)

**b) Firebase service-account anahtarı:**
Firebase Console → ⚙️ Project Settings → **Service accounts** → **Generate new private key** → inen JSON dosyası.

> ⚠️ Bu iki sır **ASLA** koda veya `VITE_*` değişkenine konmaz. Yalnızca Vercel sunucu env'ine.

---

## 2) Vercel'e sunucu env değişkenlerini gir

Vercel → Proje → **Settings → Environment Variables** (Production + Preview):

| Değişken | Değer |
|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather token'ı |
| `FIREBASE_SERVICE_ACCOUNT` | Service-account JSON'unun **tamamı tek satır string** olarak |

> `FIREBASE_SERVICE_ACCOUNT` için: JSON dosyasının içeriğini olduğu gibi yapıştır. `private_key` içindeki `\n`'ler korunmalı — Vercel panelinden yapıştırırsan sorun olmaz; kod her iki formatı da (`\n` literal veya gerçek satır) tolere eder.

---

## 3) Deploy et (backend hâlâ ATIL)

```bash
git add -A && git commit -m "feat: güvenli backend (session + submit-score) — atıl"
git push
```
Vercel otomatik `/api/session` ve `/api/submit-score` fonksiyonlarını yayınlar. **`VITE_USE_BACKEND` hâlâ 0 olduğu için istemci bunları kullanmaz — oyun değişmez.**

İstersen endpoint'i elle test et (401 dönmesi normaldir, imza yok):
```bash
curl -X POST https://<PROJEN>.vercel.app/api/session -H "Content-Type: application/json" -d '{"initData":""}'
# {"error":"missing_init_data_or_token"} veya {"error":"unauthorized"} → çalışıyor demektir
```

---

## 4) Backend'i AÇ (kademeli geçiş)

Vercel env'ine ekle ve **yeniden deploy et**:
```
VITE_USE_BACKEND = 1
```
(Yerelde denemek için `.env`'de de `VITE_USE_BACKEND=1` yapıp `npm run build`.)

Artık istemci:
- Girişte `/api/session`'a initData gönderir → **Firebase Custom Token** (uid = telegram_id) ile giriş yapar. Token alınamazsa **otomatik anonim moda düşer** (oyun bozulmaz).
- Skoru `/api/submit-score`'a gönderir → sunucu günlük 1000 limitini ve makul artışı **sunucu tarafında** doğrulayıp yazar.

**Telegram'da test et:** oyna, coin kazan, günlük limiti dene, liderlik tablosunu ve davet/referral akışını kontrol et.

---

## 5) CSP'yi izle (opsiyonel sıkılaştırma)

`vercel.json` şu an CSP'yi **Report-Only** (engellemeyen) modda ekliyor — reklamları/Telegram'ı bozmaz.
Tarayıcı konsolunda CSP ihlallerini izle. Meşru bir domain bloklanıyorsa `vercel.json`'daki allowlist'e ekle.
Hiç meşru ihlal kalmayınca `Content-Security-Policy-Report-Only` → `Content-Security-Policy` yaparak **enforce**'a çevir.

---

## 6) Firestore rules'u sıkılaştır (EN SON — skorlar backend'den çalıştığı DOĞRULANDIKTAN sonra)

Yalnızca 4. adım tam çalıştıktan sonra:
```bash
cp firestore.rules.hardened firestore.rules
firebase deploy --only firestore:rules
```
Bu, kritik/ekonomi alanlarını (`total_azc`, `high_score`, `daily_earnings`, `friends` vb.) **yalnızca sunucu (Admin SDK)** yazabilecek şekilde kilitler; istemci tampering'i engellenir.

Sonra Telegram'da tekrar test et (skor kaydı, liderlik, referral hâlâ çalışmalı).

---

## 🔙 Geri alma (rollback)
Herhangi bir adımda sorun olursa:
- `VITE_USE_BACKEND = 0` yap + redeploy → anında eski (anonim + doğrudan Firestore) moda döner.
- Rules'u sıkılaştırdıysan, eski `firestore.rules`'u geri deploy et.

---

## 📌 Not: ESLint kuralı (küçük, opsiyonel)
`react-hooks/exhaustive-deps` kuralı `eslint.config.js`'e eklenmek istendi ama `config-protection` hook'u engelledi. Kod zaten uyumlu (gerekçeli `eslint-disable` yorumları eklendi). Kalıcı etkinleştirmek için hook'u geçici kapatıp `eslint.config.js`'in `rules` bloğuna şunu ekle:
```js
'react-hooks/exhaustive-deps': 'warn',
```
