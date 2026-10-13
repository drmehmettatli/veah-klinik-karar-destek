# Toksidrom Pusulası

Zehirlenmiş hastada yatak başı karar desteği: vitaller, vücut haritası üzerinde fizik muayene, EKG, laboratuvar hesaplayıcıları ve rehberli sorularla **toksidrom ayrımı**; antidot dozları ve yapay zekâ ikinci görüşü.

SBÜ Van Eğitim ve Araştırma Hastanesi Acil Tıp Kliniği eğitim aracıdır. Tek dosyalık web uygulamasıdır; kurulum gerektirmez.

## Kullanım

- Canlı adres: https://vanaciltip.me/veah-klinik-karar-destek/toksidrom/ (ya da `index.html` dosyasını çift tıklayın).
- Veriler yalnız kendi tarayıcınızda saklanır (localStorage). Vakayı JSON olarak kopyalayıp başka cihazda yapıştırabilirsiniz.
- **AI danışman**: Gemini API anahtarınızı girerseniz vaka özeti doğrudan Google'a gönderilir; anahtar yalnız tarayıcınızda kalır. Kimlik bilgisi girmeyin.

## Bölümler

| Sekme | İçerik |
|---|---|
| Hasta & öykü | Takma ad, yaş, kilo, ajan, süre, niyet; öykü etiketleri (serotonerjik ilaç, TSA, BB/KKB, organofosfat…) |
| Vitaller | Eşik dışı değerler otomatik bulguya dönüşür; GKS, şok indeksi; mental durum etiketleri |
| Fizik muayene | Ön / arka / yüz-pupil görünümleri, 35 bölge; her bulgu **Var / Yok** işaretlenir |
| EKG | QTc (Bazett, Fridericia, Framingham, Hodges), QRS ≥100/≥160 ms, aVR R ≥3 mm, Brugada, bidireksiyonel VT bayrakları |
| Lab & hesap | Anyon açığı (albümin düzeltmeli, delta oranı, Winter), ozmolar gap ve toksik alkol tahmini, Rumack-Matthew nomogramı, digoksin-Fab flakon hesabı, kilo bazlı dozlar |
| Rehberli ayrım | Sıralamanın tepesindeki toksidromları en iyi ayıran soruyu seçer |
| Değerlendirme | 24 toksidromun ağırlıklı puanı, lehine/aleyhine bulgular, yönetim özeti |
| Antidotlar | 30 antidot/tedavi, erişkin dozları, kilo bazlı hesap |
| AI danışman | Claude (claude.ai artifact içinde) veya Gemini API ile ikinci görüş |

## Geliştirme

Kaynak parçaları `src/` altındadır:

```
src/01-head.html   başlık, stil (CSS değişkenleri, açık/koyu tema)
src/04-body.html   arayüz gövdesi
src/02-data.js     bulgular, toksidromlar ve ağırlıklar, antidot tablosu
src/03-app.js      puanlama, hesaplayıcılar, vücut haritası, AI
build.sh           parçaları index.html ve toksidrom-artifact.html olarak birleştirir
```

Değişiklikten sonra:

```bash
bash build.sh
```

`index.html` doğrudan düzenlenmez; build ile üretilir.

## Kaynaklar

UpToDate (General approach to drug poisoning in adults; toksidrom tablosu; TSA, KKB/BB, digoksin, metemoglobinemi, serotonin sendromu, NMS, salisilat, toksik alkol, parasetamol konuları), Goldfrank's Toxicologic Emergencies 11e, Tintinalli 9e, Boyer & Shannon NEJM 2005 (Hunter kriterleri), Rumack-Matthew nomogramı, EXTRIP önerileri, ACMT/AACT bildirileri. Eşikler 13 Ekim 2026'da UpToDate Expert AI ile doğrulandı.

## Sınırlar

Puanlama uzlaşı tablolarından türetilmiş sezgisel ağırlıklardır; doğrulanmış bir klinik skor değildir. Karışık alımlar, kronik hastalıklar ve çocuk hastalarda bulgular klasik tablodan sapar. Tüm dozları kurum protokolü, ürün bilgisi ve Ulusal Zehir Danışma Merkezi (UZEM, 114) ile doğrulayın. Bu araç klinik yargının yerine geçmez.

## Lisans

Depo lisansı geçerlidir (bkz. üst dizindeki `LICENSE`). Vücut görselleri ve klinik logosu projeye özgüdür.
