# Klinik Karar Destek & Hasta Sunumu Merkezi

Acil serviste kullanılmak üzere geliştirilmiş, **tek dosyalık** klinik karar destek sistemi (CDSS). 42 validasyonlu klinik skorlama aracı ile yapılandırılmış hasta sunumu (SBPSAAPE) akışını bir arada sunar.

> **Van Eğitim ve Araştırma Hastanesi – Acil Tıp Kliniği | SBÜ**

---

## ⚠️ Sorumluluk Reddi

**Bu araç yalnızca eğitim ve karar desteği amaçlıdır. Klinik muhakemenin, hasta başı değerlendirmenin veya kurumsal protokollerin yerine geçmez.**

- Hesaplanan skorlar tek başına tanı koydurmaz ve tedavi kararı vermez.
- Tüm sonuçlar hastayı gören hekim tarafından doğrulanmalıdır.
- Skorların dayandığı kılavuzlar zamanla güncellenir; kullanmadan önce güncel kaynakla teyit ediniz.
- Aşağıdaki **Bilinen Sorunlar** bölümünü mutlaka okuyunuz.

Geliştiriciler, bu aracın kullanımından doğabilecek klinik sonuçlardan sorumlu tutulamaz.

---

## Özellikler

**Klinik Skorlamalar (42 adet)**

Anatomik bölgeye göre gruplanmış, arama destekli skor kütüphanesi. Her skor için otomatik hesaplama, risk sınıflaması, yorum metni ve grafik gösterim.

| Bölge | Skor sayısı | Örnekler |
|---|---|---|
| Kafa / Nöroloji | 7 | GCS, NIHSS, Canadian CT Head, ABCD2, PECARN, ICH, Hunt-Hess |
| Göğüs / Kardiyo-Pulmoner | 10 | HEART, Wells (PTE/DVT), PERC, TIMI, GRACE, CURB-65, PSI, PESI, CHA₂DS₂-VASc |
| Karın / Gastrointestinal | 7 | Alvarado, Glasgow-Blatchford, Rockall, Ranson, BISAP, Child-Pugh, MELD |
| Ekstremite / Travma | 6 | NEXUS, Canadian C-Spine, Ottawa Ayak Bileği, Ottawa Diz, ISS, GAP |
| Sistemik / Sepsis | 12 | NEWS2, qSOFA, SOFA, SIRS, Şok İndeksi, qCSI, HAS-BLED, DIC, 4T, Centor, LRINEC, Padua |

**Hasta Sunumu (SBPSAAPE)**

Van EAH Acil Tıp Kliniği tarafından geliştirilmiş 8 adımlı yapılandırılmış sunum çerçevesi:

`Situation` → `Background` → `Physical Examination` → `Scorings` → `Assessment` → `Ask` → `Plan` → `Education`

Her adımda hatırlatıcı ipuçları, vital bulgu girişi, skorlama entegrasyonu, kayıt saklama ve yazdırılabilir önizleme.

---

## Kullanım

**Web üzerinden:** Yukarıdaki bağlantıdan doğrudan açabilirsiniz. Kurulum gerekmez.

**Yerel kullanım:** `index.html` dosyasını indirip çift tıklamanız yeterlidir. Ek bir sunucu veya bağımlılık kurulumu gerektirmez.

```bash
git clone https://github.com/<kullanici>/veah-cdss.git
cd veah-cdss
# index.html dosyasını tarayıcıda açın
```

---

## Teknik Notlar

Tek bir `index.html` dosyasından oluşur; derleme adımı yoktur.

- **Tailwind CSS** ve **Chart.js** CDN üzerinden yüklenir. İnternet erişimi olmayan ortamlarda sayfa biçimlendirmesi ve grafikler çalışmaz — çevrimdışı kullanım gerekiyorsa bu iki kütüphanenin yerel kopyaları gömülmelidir.
- Form verileri tarayıcının `localStorage` alanında saklanır (`sbpsaape_data`, `veah_records`). **Şifrelenmez.** Ortak kullanılan bilgisayarlarda oturum sonunda "Sıfırla" ile temizleyiniz.
- "Kaydet" işlemi, yerel kayda ek olarak sunum özetini yapılandırılmış bir Google Forms adresine gönderir. Gönderim `mode: 'no-cors'` ile yapıldığından **başarısız olsa dahi arayüzde başarılı görünür**.

### Veri Mahremiyeti

Hasta kimliği için **TC Kimlik No yerine kurum içi "Hasta ID" / protokol numarası** alanı kullanılır. Doğrudan kimlik belirleyici veri girilmemesi önerilir. Uygulama herkese açık bir adreste yayınlandığında, forma dışarıdan da veri girilebileceği unutulmamalıdır.

---

## Bilinen Sorunlar

Aşağıdaki maddeler bağımsız bir klinik doğruluk denetiminde tespit edilmiştir ve **henüz düzeltilmemiştir.** Bu skorları kullanırken sonucu kılavuzla teyit ediniz.

**Öncelikli (klinik karar değiştirebilir)**

- **PECARN** – Yüksek riskli maddelere 4, ara risklilere 2 puan verilip toplanıyor. İki ara risk bulgusu (ör. kusma + şiddetli baş ağrısı) toplamda 4 ederek hastayı hatalı biçimde "yüksek risk – BT endike" grubuna taşıyor. Doğrusu ara risk grubudur (gözlem ya da BT, aile ile ortak karar).
- **Canadian C-Spine** – Düşük risk kriteri *"Olay yerinde ambulans olabilir"* olarak yazılmış. Orijinal kriter *"Ambulatory at any time"*, yani **hastanın olaydan sonra yürüyebilmiş olmasıdır**. Mevcut haliyle kriter neredeyse her vakada işaretlenir.
- **NEWS2** – Toplam 1-4 için "12 saatte bir vital kontrol" öneriliyor; RCP protokolünde 12 saat yalnızca skor 0 içindir, 1-4 için 4-6 saattir. Ayrıca "tek parametrede 3 puan → saatlik izlem" kuralı uygulanmamıştır.
- **GRACE** – Alan puanları 6 aylık mortalite tablosundan, eşikler ve "hastane içi mortalite" etiketi ise hastane içi tablosundan alınmış; iki nomogram karışmıştır.
- **SOFA** – Skor 10 için "~%15-20" mortalite belirtiliyor; literatürde bu grup %40-50 aralığındadır.

**İkincil (kriter metni / eşik)**

- **ABCD2** – *"Dizartri olmaksızın konuşma bozukluğu"* → doğrusu *"güçsüzlük olmaksızın konuşma bozukluğu"*.
- **Alvarado** – *"Ağrının göbeğe göç etmesi"* → doğrusu *"göbek çevresinden sağ alt kadrana göç"*.
- **4T (HIT)** – *"≥%50 düşüş **veya** nadir >20×10⁹"* → orijinalde **VE** koşuludur; ayrıca `≥20` olmalıdır.
- **TIMI** – Aspirin kriteri "son 24 saat" yazılmış, doğrusu **son 7 gün**.
- **Wells (PTE)** – Düşük olasılık eşiği `≤1` alınmış; üç kademeli Wells'te sınır `<2`'dir.
- **NIHSS ≤4** – "IV tPA genellikle endike değildir" ifadesi fazla kesindir; dizabilite yaratan düşük skorlu tablolarda tromboliz önerilebilir.
- **LRINEC ≤5** – Düşük skor nekrotizan fasiiti **dışlamaz**; klinik şüphe varsa cerrahi konsültasyon ertelenmemelidir.
- **CHA₂DS₂-VASc** – Risk yüzdesi literatür tablosu yerine doğrusal bir formülle (`skor × 1.5`) hesaplanıyor; ayrıca antikoagülasyon eşiğinde cinsiyet ayrımı yapılmıyor.
- **PSI/PORT** – "Bakımevi/huzurevi sakini +10 puan" maddesi eksiktir.
- **ISS** – AIS 6 seçeneği ve "AIS 6 → ISS otomatik 75" kuralı uygulanmamıştır.

Katkı sağlamak isterseniz bu maddeler için pull request'ler memnuniyetle karşılanır.

---

## Katkı

Klinik içerik düzeltmeleri için lütfen **kaynak gösteriniz** (kılavuz adı, yıl, ilgili bölüm). Skor eşikleri ve madde puanları yalnızca birincil kaynak veya güncel kılavuzla gerekçelendirilerek değiştirilmelidir.

## Lisans

[MIT](LICENSE)
