# Candle Wick Gelir Modeli

## 1) Gelir Katmanları

### A) Reklam Geliri
- Mevcut reklam altyapısı korunur.
- Amaç: reklam sayısını artırmak değil, yüksek niyet anlarında gösterim yapmak.
- Takip metrikleri:
  - `ad_impression_per_session`
  - `ad_completion_rate`
  - `ecpm_net`

### B) Telegram Stars ile Dijital Ürünler
- Continue Token
- Sezon Bileti
- Kozmetik Paketler
- Clan Rozeti
- Replay Pack
- Takip metrikleri:
  - `purchase_conversion_rate`
  - `arppu_stars`
  - `repeat_purchase_30d`

### C) Affiliate / Creator Geliri
- Klasik referral yerine performans bazlı creator ödül sistemi.
- Takip metrikleri:
  - `affiliate_active_count`
  - `referred_payer_ratio`
  - `stars_revenue_from_referrals`

## 2) Sıradışı Büyüme Mekanikleri

### Chat-context Raid
- 3 dakikalık grup raid etkinliği.
- Grup toplam puanı yarışır, bireysel değil.

### Inline Oynanabilir Skor Kartı
- Run sonunda statik paylaşım yerine aynı seed ile açılan challenge kartı.

### Creator Bounty
- Davet başına değil, retention kalitesine göre ödül.

### Asimetrik Davet
- “Arkadaşını çağır” yerine “rakibini çağır” akışı.

### Spectator Döngüsü
- En iyi run’lar izlenebilir.
- İzleyici etkileşimi drops/boost ile gelir döngüsüne bağlanır.

### Micro-Season ve Anomaly
- 72 saatlik kısa sezonlar.
- Her sezonda farklı fizik/meta.

## 3) Finansal Formül

`Aylık Gelir = Ad Geliri + Stars Geliri + Affiliate Geliri`

`Ad Geliri = DAU × Günlük Oturum × Reklam Gösterim × eCPM / 1000`

`Stars Geliri = DAU × Dönüşüm Oranı × ARPPU`

`Affiliate Geliri = Referanslı Stars Satın Alım × Komisyon`

## 4) 90 Günlük Uygulama Sırası

### Gün 1-20
- Reklam event tracking düzeni
- Stars SKU planı
- Temel funnel ölçümü

### Gün 21-45
- Chat raid
- Inline challenge kartı
- Creator bounty MVP

### Gün 46-70
- Sezon motoru
- Anomaly scheduler
- Spectator etkileşimleri

### Gün 71-90
- A/B testleri
- Creator tier optimizasyonu
- Gelir-funnel dengelemesi

