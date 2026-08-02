# Klinik Karar Destek & Hasta Sunumu Merkezi

Acil serviste kullanılmak üzere geliştirilmiş, **tek dosyalık** klinik karar destek sistemi (CDSS). 42 validasyonlu klinik skorlama aracı ile yapılandırılmış hasta sunumu (SBPSAAPE) akışını bir arada sunar.

> **Van Eğitim ve Araştırma Hastanesi – Acil Tıp Kliniği | SBÜ**

### 🔗 [Uygulamayı aç →](http://vanaciltip.me/veah-klinik-karar-destek/)

Kurulum gerekmez, tarayıcıda doğrudan çalışır.
(`https://drmehmettatli.github.io/veah-klinik-karar-destek/` adresi de aynı sayfaya yönlenir.)

---

## ⚠️ Sorumluluk Reddi

**Bu araç yalnızca eğitim ve karar desteği amaçlıdır. Klinik muhakemenin, hasta başı değerlendirmenin veya kurumsal protokollerin yerine geçmez.**

- Hesaplanan skorlar tek başına tanı koydurmaz ve tedavi kararı vermez.
- Tüm sonuçlar hastayı gören hekim tarafından doğrulanmalıdır.
- Skorların dayandığı kılavuzlar zamanla güncellenir; kullanmadan önce güncel kaynakla teyit ediniz.
- Aşağıdaki **Klinik Doğruluk** bölümünü, özellikle *Kalan bilinen sınırlamalar* kısmını mutlaka okuyunuz.

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

**Hızlı Giriş**

Acil serviste yazma süresini kısaltmak için:

- **Tarih alanında "Bugün" butonu** — tek tıkla bugünün tarihini doldurur.
- **Kronik hastalık butonları** — Arka Plan adımında 14 sık kronik hastalık (HT, DM, KOAH, KAH, KKY, AF, KBH vb.) tek tıkla eklenir/çıkarılır; seçimler virgülle ayrılmış metne dönüşür.
- **"Yok" / "Doğal" / "Özellik yok" butonları** — ilaç, alerji, fizik muayene, konsültasyon gibi 15 alanda hazır yanıtlar. Aynı butona tekrar basmak alanı temizler.

---

## Kullanım

**Web üzerinden:** http://vanaciltip.me/veah-klinik-karar-destek/ adresinden doğrudan açabilirsiniz. Kurulum gerekmez.

**Yerel kullanım:** `index.html` dosyasını indirip çift tıklamanız yeterlidir. Ek bir sunucu veya bağımlılık kurulumu gerektirmez.

```bash
git clone https://github.com/drmehmettatli/veah-klinik-karar-destek.git
cd veah-klinik-karar-destek
# index.html dosyasını tarayıcıda açın
```

---

## Teknik Notlar

Tek bir `index.html` dosyasından oluşur; derleme adımı yoktur.

- **Tailwind CSS** ve **Chart.js** CDN üzerinden yüklenir. İnternet erişimi olmayan ortamlarda sayfa biçimlendirmesi ve grafikler çalışmaz — çevrimdışı kullanım gerekiyorsa bu iki kütüphanenin yerel kopyaları gömülmelidir.
- Form verileri tarayıcının `localStorage` alanında saklanır (`sbpsaape_data`, `veah_records`). **Şifrelenmez.** Ortak kullanılan bilgisayarlarda oturum sonunda "Sıfırla" ile temizleyiniz.
- Yayın adresi şu an **HTTPS değil, HTTP** üzerinden sunulmaktadır (`vanaciltip.me` için GitHub Pages sertifikası henüz oluşturulmamıştır). Tarayıcılar sayfayı "Güvenli değil" olarak işaretler. Hasta verisi girilecekse HTTPS etkinleştirilene kadar yerel kullanım tercih edilmelidir.
- "Kaydet" işlemi, yerel kayda ek olarak sunum özetini yapılandırılmış bir Google Forms adresine gönderir. Gönderim `mode: 'no-cors'` ile yapıldığından **başarısız olsa dahi arayüzde başarılı görünür**.

### Veri Mahremiyeti

Hasta kimliği için **TC Kimlik No yerine kurum içi "Hasta ID" / protokol numarası** alanı kullanılır. Doğrudan kimlik belirleyici veri girilmemesi önerilir. Uygulama herkese açık bir adreste yayınlandığında, forma dışarıdan da veri girilebileceği unutulmamalıdır.

Kayıt sırasında **sunumu yapan hekimin adı** sorulur ve kayda işlenir; bu ad tarayıcıda saklanır, sonraki kayıtlarda varsayılan olarak gelir.

**Kayıtlar ekranı bir şifre ile korunur.** Ancak bu şifre istemci tarafında, açık kaynak koduna gömülü olarak tutulur — yani bu depoya erişebilen herkes şifreyi okuyabilir. Amacı yalnızca **ortak kullanılan bir bilgisayarda kayıtların kazara veya meraktan açılmasını engellemektir**; şifrelenmiş bir koruma değildir. Gerçek erişim denetimi gereken ortamlarda uygulamanın sunucu tarafı kimlik doğrulaması olan bir sürümü kullanılmalıdır.

---

## Klinik Doğruluk

Skor kütüphanesi bağımsız bir klinik doğruluk denetiminden geçirilmiş, tespit edilen hatalar birincil kaynaklara başvurularak düzeltilmiştir. Düzeltmelerin tamamı 42 skorun otomatik testiyle doğrulanmıştır.

### Düzeltilen hatalar

**Hasta kararını değiştirebilecek olanlar**

- **PECARN** – Yüksek riskli (4 puan) ve ara riskli (2 puan) kriterler toplanıyordu; iki ara risk bulgusu 4 ederek hastayı hatalı biçimde "yüksek risk – BT endike" grubuna taşıyordu. Artık iki grup ayrı sayılıyor ve ara risk grubu "gözlem vs BT – ortak karar" olarak raporlanıyor. Yaş grubu seçilmediğinde uyarı veriyor (önceden sessizce ≥2 yaş kabul ediliyordu).
- **Canadian C-Spine** – *"Olay yerinde ambulans olabilir"* kriteri, orijinaldeki *"Ambulatory at any time"* ifadesinin hatalı çevirisiydi ve neredeyse her vakada işaretleniyordu. *"Hasta olaydan sonra herhangi bir zamanda yürüyebildi"* olarak düzeltildi.
- **NEWS2** – Toplam 1-4 için izlem aralığı 12 saatten 4-6 saate çekildi (12 saat yalnızca skor 0 için geçerlidir). RCP'nin *"tek parametrede 3 puan → orta risk, saatlik izlem"* kuralı eklendi; bu kural olmadan tek başına SpO₂ 91% olan hasta "düşük risk" görünüyordu.
- **GRACE** – Madde puanları 6 aylık taburculuk sonrası nomogramdan, eşikler ve "hastane içi mortalite" etiketi ise hastane içi nomogramdan alınmıştı; iki farklı skor karışmıştı. Tüm puanlar Granger 2003 hastane içi nomogramına çevrildi (yaş, kalp hızı, sistolik KB, kreatinin kategorileri ve Killip/arrest/ST/biyomarker puanları dahil). Maksimum 372 ile doğrulandı.
- **SOFA** – Skor 10 için "%15-20" mortalite gösteriliyordu; bu grup literatürde %40-50'dir. Bantlar yeniden düzenlendi ve 13-14 için ayrı bant eklendi.

**Kriter metni ve eşik hataları**

- **ABCD2** – *"Dizartri olmaksızın konuşma bozukluğu"* → *"Güçsüzlük olmaksızın konuşma bozukluğu"*
- **Alvarado** – *"Ağrının göbeğe göçü"* → *"Göbek çevresinden sağ alt kadrana göç"*
- **4T (HIT)** – *"≥%50 düşüş **veya** nadir >20×10⁹"* → *">%50 düşüş **VE** nadir ≥20×10⁹"*
- **TIMI** – Aspirin kriteri "son 24 saat" → "son 7 gün"
- **Wells (PTE)** – Düşük olasılık eşiği `≤1` → `<2`. Wells'te 1.5 puanlık kalemler bulunduğu için 1.5 skoru mümkündür ve düşük risk grubuna girer; eski eşik bu hastaları gereksiz yere orta riske atıyordu.
- **CHA₂DS₂-VASc** – Yıllık inme riski uydurma doğrusal bir formülle (`skor × 1.5`) hesaplanıyordu; Friberg 2012 kohort tablosu ile değiştirildi. Antikoagülasyon eşiği cinsiyete göre ayrıldı (erkek ≥2, kadın ≥3 için Sınıf I). Ayrıca *"Yaş ≥75"* ve *"Yaş 65-74"* aynı anda işaretlenebiliyor ve skor 10 çıkabiliyordu; gerçek maksimum 9'dur, kriterler artık birbirini dışlıyor.
- **PSI/PORT** – Eksik olan *"bakımevi/huzurevi sakini +10 puan"* maddesi eklendi. Sınıf V mortalitesi %27-31 olarak düzeltildi; yoğun bakım kararının PSI ile verilmemesi gerektiği notu eklendi.
- **NIHSS** – *"IV tPA genellikle endike değildir"* ifadesi kaldırıldı; belirleyicinin skor değil defisitin dizabilite yaratıp yaratmadığı olduğu açıklandı.
- **LRINEC** – Düşük skorun nekrotizan fasiiti dışlamadığı ve klinik şüphede cerrahi konsültasyonun ertelenmemesi gerektiği uyarısı eklendi.
- **ISS** – AIS ölçeğinde eksik olan 6 (sağkalımsız) seçeneği eklendi ve *"herhangi bir bölgede AIS 6 → ISS otomatik 75"* kuralı uygulandı. *"Major travma ISS ≥25"* yanlış tanımı ISS >15 olarak düzeltildi.
- **Canadian C-Spine** – Sonuç ekranında puan kutusu boş görünüyordu.

### Kalan bilinen sınırlamalar

Aşağıdaki maddeler denetimde daha düşük öncelikli bulunmuş olup henüz ele alınmamıştır:

- **GAP** – Mortalite oranları düşük veriliyor (11-18 grubu için ~%15, literatürde ~%33).
- **BISAP** ve **qCSI** – Bazı gruplarda mortalite/risk oranları kaynaklarla tam örtüşmüyor; doğrulanmalı.
- **Hunt-Hess** – Kullanılan mortalite serisi kaynaklar arasında belirgin farklılık gösteriyor.
- **Şok İndeksi** – Uyarı eşiği olarak ≤1.0 kullanılıyor; en sık atıf alan eşik ≥0.9'dur.
- **SIRS** – Ampirik antibiyotik önerisi "enfeksiyon şüphesi varsa" koşuluna bağlanmalı (SIRS enfeksiyona özgü değildir).
- **Glasgow-Blatchford** – Erkek ve kadın hemoglobin alanları aynı anda görünüyor; cinsiyet tek alanla sorulmalı.
- **Ranson** – Dal `≥7`de tetikleniyor, metin "≥8 kriter" diyor.
- **MELD** – Orijinal MELD uygulanmıştır; UNOS 2023'ten beri tahsis için MELD 3.0 kullanılmaktadır.
- **GCS** – Entübe hastada sözel bileşen için "T" seçeneği yok.
- **PECARN** – Ağır yaralanma mekanizması tanımındaki yaşa göre düşme yüksekliği farkı (<2 yaş 0.9 m, ≥2 yaş 1.5 m) arayüzde belirtilmiyor.

Katkı sağlamak isterseniz bu maddeler için pull request'ler memnuniyetle karşılanır.

## Katkı

Klinik içerik düzeltmeleri için lütfen **kaynak gösteriniz** (kılavuz adı, yıl, ilgili bölüm). Skor eşikleri ve madde puanları yalnızca birincil kaynak veya güncel kılavuzla gerekçelendirilerek değiştirilmelidir.

## Lisans

[MIT](LICENSE)
