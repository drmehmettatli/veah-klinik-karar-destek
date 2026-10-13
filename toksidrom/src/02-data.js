/* =====================================================================
   KLİNİK VERİ MODELİ
   Bulgular (FINDINGS), toksidromlar (TOXIDROMES) ve ağırlıklar.
   Ağırlık: +4 kardinal, +3 güçlü, +2 destekleyici, +1 zayıf; negatif = aleyhine.
   Kaynaklar: UpToDate (General approach to drug poisoning in adults; toxidrome
   tabloları), Goldfrank's Toxicologic Emergencies 11e, Tintinalli 9e, Boyer &
   Shannon NEJM 2005 (serotonin sendromu), Hunter kriterleri, ACMT/AACT bildirileri.
   ===================================================================== */

const REGIONS = {
  front: {
    img: "gorseller/vucut-on.jpg", w: 1045, h: 1400,
    spots: [
      { id:"eyes",   x:50, y:11.5, label:"Gözler / pupiller" },
      { id:"mouth",  x:50, y:16.2, label:"Ağız / mukoza / koku" },
      { id:"neck",   x:50, y:20.5, label:"Boyun" },
      { id:"lungR",  x:41, y:30,   label:"Sağ akciğer" },
      { id:"lungL",  x:59, y:30,   label:"Sol akciğer" },
      { id:"heart",  x:53.5, y:34, label:"Kalp" },
      { id:"skin",   x:35, y:44,   label:"Cilt (gövde)" },
      { id:"abd",    x:50, y:42,   label:"Karın / bağırsak" },
      { id:"bladder",x:50, y:49,   label:"Suprapubik / mesane" },
      { id:"armR",   x:30, y:40,   label:"Sağ kol" },
      { id:"armL",   x:70, y:40,   label:"Sol kol" },
      { id:"handR",  x:28, y:55.5, label:"Sağ el" },
      { id:"handL",  x:72, y:55.5, label:"Sol el" },
      { id:"legR",   x:43.5, y:72, label:"Sağ bacak / diz" },
      { id:"legL",   x:57,  y:72,  label:"Sol bacak / diz" },
      { id:"footR",  x:41, y:93,   label:"Sağ ayak / bilek" },
      { id:"footL",  x:60, y:93,   label:"Sol ayak / bilek" }
    ]
  },
  back: {
    img: "gorseller/vucut-arka.jpg", w: 1045, h: 1400,
    spots: [
      { id:"occiput", x:50, y:10,  label:"Oksiput / kafa travması" },
      { id:"nape",    x:50, y:19,  label:"Ense / boyun" },
      { id:"back",    x:50, y:33,  label:"Sırt / paravertebral" },
      { id:"lumbar",  x:50, y:45,  label:"Bel / böbrek lojları" },
      { id:"gluteal", x:50, y:56,  label:"Gluteal / bası" },
      { id:"armRb",   x:70, y:40,  label:"Sağ kol (arka)" },
      { id:"armLb",   x:30, y:40,  label:"Sol kol (arka)" },
      { id:"hamR",    x:57, y:70,  label:"Sağ uyluk arkası" },
      { id:"hamL",    x:43, y:70,  label:"Sol uyluk arkası" },
      { id:"calfR",   x:58, y:84,  label:"Sağ baldır / aşil" },
      { id:"calfL",   x:42, y:84,  label:"Sol baldır / aşil" }
    ]
  },
  face: {
    img: "gorseller/yuz.jpg", w: 746, h: 1000,
    spots: [
      { id:"eyeR",  x:35, y:32,  label:"Sağ göz" },
      { id:"eyeL",  x:66, y:32,  label:"Sol göz" },
      { id:"nose",  x:50, y:47,  label:"Burun" },
      { id:"lips",  x:50, y:60,  label:"Dudaklar / ağız" },
      { id:"cheek", x:22, y:50,  label:"Yüz cildi" },
      { id:"jaw",   x:50, y:76,  label:"Çene / masseter" },
      { id:"neckF", x:50, y:90,  label:"Boyun" }
    ]
  }
};

// Bölge -> hangi bulgu grupları listelenir
const REGION_GROUPS = {
  eyes:["pupil","eye"], eyeR:["pupil","eye"], eyeL:["pupil","eye"],
  mouth:["mucosa","odor","airway"], lips:["mucosa","odor","airway"], nose:["nose"],
  cheek:["skin","face"], skin:["skin"], jaw:["jaw"],
  neck:["neck"], neckF:["neck"], nape:["neck","tone"],
  lungR:["lung"], lungL:["lung"], heart:["cardiac"],
  abd:["gi"], bladder:["gu"],
  armR:["skin","motor","arm"], armL:["skin","motor","arm"], armRb:["skin","motor","arm"], armLb:["skin","motor","arm"],
  handR:["hand","motor"], handL:["hand","motor"],
  legR:["leg","motor","reflex"], legL:["leg","motor","reflex"],
  footR:["foot","reflex"], footL:["foot","reflex"],
  occiput:["head"], back:["tone","skin"], lumbar:["lumbar"], gluteal:["pressure","skin"],
  hamR:["leg","motor"], hamL:["leg","motor"], calfR:["foot","reflex"], calfL:["foot","reflex"]
};

/* Bulgular. group: anatomik grup; cat: özet kategorisi; q: soru formu (ayrım motoru). */
const FINDINGS = [
  // --- vitallerden otomatik türetilenler (cat:"vital") ---
  { id:"tachy",      cat:"vital", label:"Taşikardi", q:"Nabız >100/dk mı?" },
  { id:"brady",      cat:"vital", label:"Bradikardi", q:"Nabız <60/dk mı?" },
  { id:"htn",        cat:"vital", label:"Hipertansiyon", q:"Sistolik TA >140 mmHg mi?" },
  { id:"hypot",      cat:"vital", label:"Hipotansiyon", q:"Sistolik TA <90 mmHg mi?" },
  { id:"tachypnea",  cat:"vital", label:"Takipne / hiperpne", q:"Solunum sayısı >20/dk veya derin hiperpne var mı?" },
  { id:"bradypnea",  cat:"vital", label:"Bradipne / hipoventilasyon", q:"Solunum sayısı <12/dk veya yüzeyel solunum var mı?" },
  { id:"hyperth",    cat:"vital", label:"Hipertermi", q:"Vücut ısısı >38 °C mi?" },
  { id:"hypoth",     cat:"vital", label:"Hipotermi", q:"Vücut ısısı <35 °C mi?" },
  { id:"hypoxia",    cat:"vital", label:"Hipoksi (SpO₂ <94)", q:"SpO₂ <%94 mü?" },
  { id:"hypogly",    cat:"vital", label:"Hipoglisemi", q:"Kan şekeri <70 mg/dL mi?" },
  { id:"hypergly",   cat:"vital", label:"Hiperglisemi", q:"Kan şekeri >200 mg/dL mi?" },
  { id:"hypercap",   cat:"vital", label:"Hiperkapni (EtCO₂ >50)", q:"EtCO₂ >50 mmHg mi?" },

  // --- pupil / göz ---
  { id:"miosis",     group:"pupil", cat:"pupil", label:"Miyozis (toplu iğne başı)", q:"Pupiller miyotik mi (≤2 mm)?" },
  { id:"mydriasis",  group:"pupil", cat:"pupil", label:"Midriyazis", q:"Pupiller dilate mi (≥5 mm)?" },
  { id:"nystagmus",  group:"eye",   cat:"pupil", label:"Nistagmus (horizontal)", q:"Horizontal nistagmus var mı?" },
  { id:"nystagmusV", group:"eye",   cat:"pupil", label:"Vertikal / rotatuar nistagmus", q:"Vertikal veya rotatuar nistagmus var mı?" },
  { id:"ocularclonus",group:"eye",  cat:"neuro", label:"Oküler klonus", q:"Oküler klonus (gözlerde ritmik salınım) var mı?" },
  { id:"lacrim",     group:"eye",   cat:"secr",  label:"Lakrimasyon", q:"Belirgin lakrimasyon var mı?" },
  { id:"visual",     group:"eye",   cat:"sx",    label:"Görme bozukluğu (bulanık, 'kar fırtınası')", q:"Bulanık görme / 'kar fırtınası' tarifliyor mu?" },
  { id:"xanthopsia", group:"eye",   cat:"sx",    label:"Sarı-yeşil görme (ksantopsi)", q:"Sarı-yeşil haleler / renk görme bozukluğu var mı?" },
  { id:"conjinj",    group:"eye",   cat:"eye",   label:"Konjonktival hiperemi", q:"Konjonktivalar hiperemik mi?" },
  { id:"oculogyric", group:"eye",   cat:"neuro", label:"Okülojirik kriz", q:"Okülojirik kriz (gözlerin yukarı sabit deviasyonu) var mı?" },

  // --- ağız / mukoza / koku / havayolu ---
  { id:"drymucosa",  group:"mucosa", cat:"skin", label:"Kuru mukoza / kuru dil", q:"Ağız mukozası kuru mu?" },
  { id:"saliv",      group:"mucosa", cat:"secr", label:"Hipersalivasyon", q:"Belirgin tükürük artışı var mı?" },
  { id:"tonguebite", group:"mucosa", cat:"neuro",label:"Dil ısırığı", q:"Dilde ısırık izi var mı?" },
  { id:"cyanlips",   group:"mucosa", cat:"skin", label:"Dudak / tırnak siyanozu", q:"Dudaklarda veya tırnak yataklarında siyanoz var mı?" },
  { id:"trismus",    group:"jaw",    cat:"neuro",label:"Trismus / masseter spazmı", q:"Trismus veya masseter rijiditesi var mı?" },
  { id:"odor_almond",group:"odor", cat:"odor", label:"Acı badem kokusu", q:"Nefeste acı badem kokusu var mı?" },
  { id:"odor_garlic",group:"odor", cat:"odor", label:"Sarımsak kokusu", q:"Sarımsak kokusu var mı (organofosfat, arsenik, fosfor)?" },
  { id:"odor_etoh",  group:"odor", cat:"odor", label:"Alkol kokusu", q:"Nefeste alkol kokusu var mı?" },
  { id:"odor_acetone",group:"odor",cat:"odor", label:"Aseton / meyvemsi koku", q:"Aseton benzeri meyvemsi koku var mı?" },
  { id:"odor_egg",   group:"odor", cat:"odor", label:"Çürük yumurta kokusu", q:"Çürük yumurta kokusu var mı (H₂S)?" },
  { id:"odor_hc",    group:"odor", cat:"odor", label:"Hidrokarbon / nafta kokusu", q:"Petrol / nafta kokusu var mı?" },
  { id:"rhinorrhea", group:"nose", cat:"secr", label:"Rinore", q:"Rinore var mı?" },
  { id:"yawning",    group:"nose", cat:"sx",   label:"Esneme", q:"Sık esneme var mı?" },
  { id:"septum",     group:"nose", cat:"skin", label:"Nazal septum hasarı / insüflasyon izi", q:"Nazal septum hasarı veya burun içinde toz kalıntısı var mı?" },

  // --- boyun ---
  { id:"torticollis",group:"neck", cat:"neuro", label:"Tortikolis / servikal distoni", q:"Tortikolis var mı?" },
  { id:"neckrigid",  group:"neck", cat:"neuro", label:"Ense sertliği / opistotonus", q:"Ense sertliği veya opistotonus var mı?" },
  { id:"jvd",        group:"neck", cat:"cardiac", label:"Juguler venöz dolgunluk", q:"Juguler venöz dolgunluk var mı?" },

  // --- cilt ---
  { id:"dryskin",    group:"skin", cat:"skin", label:"Kuru, sıcak cilt", q:"Cilt kuru ve sıcak mı?" },
  { id:"diaph",      group:"skin", cat:"skin", label:"Terli (diyaforetik) cilt", q:"Cilt terli mi?" },
  { id:"flushed",    group:"skin", cat:"skin", label:"Kızarık (flushing)", q:"Cilt kızarık mı?" },
  { id:"pale",       group:"skin", cat:"skin", label:"Soluk / soğuk cilt", q:"Cilt soluk ve soğuk mu?" },
  { id:"cyanosis",   group:"skin", cat:"skin", label:"Santral siyanoz", q:"Santral siyanoz var mı?" },
  { id:"cherry",     group:"skin", cat:"skin", label:"Kiraz kırmızısı cilt", q:"Kiraz kırmızısı cilt rengi var mı (nadir, geç bulgu)?" },
  { id:"jaundice",   group:"skin", cat:"skin", label:"Sarılık", q:"Sarılık var mı?" },
  { id:"piloer",     group:"skin", cat:"skin", label:"Piloereksiyon", q:"Piloereksiyon (tüylerin dikenleşmesi) var mı?" },
  { id:"bullae",     group:"skin", cat:"skin", label:"Bası bülleri (koma blisterleri)", q:"Bası noktalarında büller var mı?" },
  { id:"tracks",     group:"skin", cat:"skin", label:"İğne izleri", q:"Enjeksiyon / iğne izleri var mı?" },
  { id:"patch",      group:"skin", cat:"skin", label:"Transdermal bant (fentanil, klonidin, nikotin)", q:"Ciltte transdermal bant var mı?" },
  { id:"ecchym",     group:"skin", cat:"skin", label:"Ekimoz / travma izi", q:"Ekimoz veya travma izi var mı?" },
  { id:"urticaria",  group:"skin", cat:"skin", label:"Ürtiker / anjiyoödem", q:"Ürtiker veya anjiyoödem var mı?" },

  // --- akciğer ---
  { id:"bronchorr",  group:"lung", cat:"secr", label:"Bronkore / yaygın ral", q:"Bronkore (yoğun bronşiyal sekresyon) var mı?" },
  { id:"wheeze",     group:"lung", cat:"resp", label:"Wheezing / bronkospazm", q:"Wheezing var mı?" },
  { id:"pulmedema",  group:"lung", cat:"resp", label:"Pulmoner ödem bulguları", q:"Pulmoner ödem bulguları (bilateral ral, köpüklü balgam) var mı?" },
  { id:"kussmaul",   group:"lung", cat:"resp", label:"Kussmaul solunumu", q:"Derin ve hızlı Kussmaul solunumu var mı?" },
  { id:"shallow",    group:"lung", cat:"resp", label:"Yüzeyel / yetersiz solunum", q:"Solunum yüzeyel ve yetersiz mi?" },
  { id:"stridor",    group:"airway", cat:"resp", label:"Stridor / üst havayolu ödemi", q:"Stridor var mı?" },

  // --- kalp ---
  { id:"irregular",  group:"cardiac", cat:"cardiac", label:"Düzensiz ritim", q:"Nabız düzensiz mi?" },
  { id:"weakpulse",  group:"cardiac", cat:"cardiac", label:"Zayıf periferik nabız / hipoperfüzyon", q:"Periferik nabızlar zayıf, kapiller dolum uzamış mı?" },
  { id:"chestpain",  group:"cardiac", cat:"sx", label:"Göğüs ağrısı", q:"Göğüs ağrısı var mı?" },

  // --- karın ---
  { id:"bs_down",    group:"gi", cat:"gi", label:"Bağırsak sesleri azalmış / yok", q:"Bağırsak sesleri azalmış veya yok mu?" },
  { id:"bs_up",      group:"gi", cat:"gi", label:"Bağırsak sesleri artmış (hiperaktif)", q:"Bağırsak sesleri hiperaktif mi?" },
  { id:"vomit",      group:"gi", cat:"gi", label:"Bulantı / kusma", q:"Bulantı-kusma var mı?" },
  { id:"diarrhea",   group:"gi", cat:"gi", label:"İshal", q:"İshal var mı?" },
  { id:"abdpain",    group:"gi", cat:"gi", label:"Karın ağrısı / kramp", q:"Karın ağrısı veya kramp var mı?" },
  { id:"distension", group:"gi", cat:"gi", label:"Distansiyon / ileus", q:"Karın distansiyonu var mı?" },
  { id:"hepatomeg",  group:"gi", cat:"gi", label:"Sağ üst kadran hassasiyeti", q:"Sağ üst kadran hassasiyeti var mı?" },

  // --- genitoüriner ---
  { id:"retention",  group:"gu", cat:"gu", label:"Üriner retansiyon / glob vezikal", q:"Üriner retansiyon (glob vezikal, USG'de dolu mesane) var mı?" },
  { id:"incont",     group:"gu", cat:"gu", label:"İnkontinans", q:"İdrar/gaita inkontinansı var mı?" },
  { id:"polyuria",   group:"gu", cat:"gu", label:"Poliüri", q:"Poliüri var mı?" },

  // --- motor / nöromüsküler ---
  { id:"tremor",     group:"hand", cat:"neuro", label:"Tremor", q:"Tremor var mı?" },
  { id:"coarsetremor",group:"hand", cat:"neuro", label:"Kaba tremor", q:"Kaba (büyük amplitüdlü) tremor var mı?" },
  { id:"fascic",     group:"motor", cat:"neuro", label:"Fasikülasyon", q:"Fasikülasyonlar var mı?" },
  { id:"myoclonus",  group:"motor", cat:"neuro", label:"Miyoklonus", q:"Miyoklonus var mı?" },
  { id:"clonus",     group:"reflex", cat:"neuro", label:"İndüklenebilir klonus (ayak bileği)", q:"Ayak bileğinde indüklenebilir klonus var mı?" },
  { id:"sponclonus", group:"reflex", cat:"neuro", label:"Spontan klonus", q:"Spontan klonus var mı?" },
  { id:"hyperreflex",group:"reflex", cat:"neuro", label:"Hiperrefleksi", q:"Derin tendon refleksleri artmış mı (özellikle alt ekstremite)?" },
  { id:"hyporeflex", group:"reflex", cat:"neuro", label:"Hiporefleksi / arefleksi", q:"Derin tendon refleksleri azalmış mı?" },
  { id:"leadpipe",   group:"tone",  cat:"neuro", label:"Kurşun boru rijiditesi (yaygın)", q:"Yaygın 'kurşun boru' rijiditesi var mı?" },
  { id:"rigidLE",    group:"leg",   cat:"neuro", label:"Alt ekstremite ağırlıklı rijidite / hipertoni", q:"Hipertoni alt ekstremitelerde üst ekstremitelerden belirgin mi?" },
  { id:"weakness",   group:"motor", cat:"neuro", label:"Kas güçsüzlüğü / paralizi", q:"Kas güçsüzlüğü var mı?" },
  { id:"hypotonia",  group:"motor", cat:"neuro", label:"Hipotoni", q:"Hipotoni var mı?" },
  { id:"asterixis",  group:"hand",  cat:"neuro", label:"Asteriksis", q:"Asteriksis var mı?" },
  { id:"sweatypalm", group:"hand",  cat:"skin",  label:"Terli avuç içi", q:"Avuç içleri terli mi?" },
  { id:"babinski",   group:"foot",  cat:"neuro", label:"Babinski pozitif", q:"Babinski pozitif mi?" },
  { id:"ataxia",     group:"leg",   cat:"neuro", label:"Ataksi", q:"Ataksi var mı?" },
  { id:"dystonia",   group:"motor", cat:"neuro", label:"Akut distoni", q:"Akut distoni (fokal kas spazmı) var mı?" },
  { id:"bradykin",   group:"motor", cat:"neuro", label:"Bradikinezi / akinezi", q:"Bradikinezi var mı?" },
  { id:"compart",    group:"leg",   cat:"neuro", label:"Kas hassasiyeti / şişlik (rabdomiyoliz)", q:"Kas hassasiyeti veya kompartman gerginliği var mı?" },
  { id:"edema",      group:"leg",   cat:"cardiac", label:"Periferik ödem", q:"Periferik ödem var mı?" },

  // --- arka / bası / böbrek ---
  { id:"headtrauma", group:"head", cat:"other", label:"Kafa travması bulgusu", q:"Kafa travması bulgusu var mı?" },
  { id:"pressure",   group:"pressure", cat:"skin", label:"Bası yarası / uzun süre hareketsiz kalma izi", q:"Bası yarası var mı?" },
  { id:"cva",        group:"lumbar", cat:"other", label:"Kostovertebral açı hassasiyeti", q:"Kostovertebral açı hassasiyeti var mı?" },

  // --- mental durum (anatomik olmayan) ---
  { id:"agit",       cat:"mental", label:"Ajitasyon / huzursuzluk", q:"Ajitasyon var mı?" },
  { id:"delirium",   cat:"mental", label:"Deliryum / konfüzyon", q:"Deliryum veya konfüzyon var mı?" },
  { id:"halluc",     cat:"mental", label:"Hallüsinasyon (görsel, 'havada bir şey yakalama')", q:"Hallüsinasyon var mı?" },
  { id:"psychosis",  cat:"mental", label:"Paranoya / psikoz", q:"Paranoid düşünce veya psikoz var mı?" },
  { id:"sedation",   cat:"mental", label:"Sedasyon / uykuya meyil", q:"Sedasyon var mı?" },
  { id:"coma",       cat:"mental", label:"Koma (GKS ≤8)", q:"Koma (GKS ≤8) var mı?" },
  { id:"seizure",    cat:"mental", label:"Nöbet", q:"Nöbet geçirdi mi?" },
  { id:"refractseiz",cat:"mental", label:"Benzodiazepine dirençli nöbet", q:"Nöbetler benzodiazepine dirençli mi?" },
  { id:"mutism",     cat:"mental", label:"Mutizm / stupor / katatoni", q:"Mutizm, stupor veya katatoni var mı?" },
  { id:"dissoc",     cat:"mental", label:"Dissosiyasyon / boş bakış", q:"Dissosiyatif durum (boş bakış, çevreyle ilgisizlik) var mı?" },
  { id:"normalMS",   cat:"mental", label:"Mental durum normal", q:"Mental durum tamamen normal mi?" },
  { id:"suddenwake", cat:"mental", label:"Komadan ani uyanma", q:"Derin komadan aniden uyanma oldu mu?" },
  { id:"headache",   cat:"sx",     label:"Baş ağrısı", q:"Baş ağrısı var mı?" },
  { id:"tinnitus",   cat:"sx",     label:"Tinnitus / işitme azlığı", q:"Tinnitus var mı?" },
  { id:"dizziness",  cat:"sx",     label:"Baş dönmesi / senkop", q:"Baş dönmesi veya senkop var mı?" },
  { id:"dysarthria", cat:"neuro",  label:"Dizartri", q:"Dizartri var mı?" },
  { id:"anxiety",    cat:"mental", label:"Anksiyete / disfori", q:"Anksiyete-disfori var mı?" },

  // --- EKG (EKG sekmesinden) ---
  { id:"qrswide",    cat:"ecg", label:"QRS ≥100 ms", q:"QRS ≥100 ms mi?" },
  { id:"qrsvwide",   cat:"ecg", label:"QRS ≥160 ms", q:"QRS ≥160 ms mi?" },
  { id:"qtlong",     cat:"ecg", label:"QTc >500 ms", q:"QTc >500 ms mi?" },
  { id:"avrR",       cat:"ecg", label:"aVR'de R ≥3 mm", q:"aVR'de terminal R dalgası ≥3 mm mi?" },
  { id:"raxis",      cat:"ecg", label:"Terminal 40 ms sağ aks (aVR R, I/aVL S)", q:"Terminal QRS'de sağ aks deviasyonu var mı?" },
  { id:"brugada",    cat:"ecg", label:"Brugada paterni", q:"V1-V3'te Brugada benzeri patern var mı?" },
  { id:"avblock",    cat:"ecg", label:"AV blok", q:"AV blok var mı?" },
  { id:"scoop",      cat:"ecg", label:"ST 'çukur' depresyonu (digoksin etkisi)", q:"ST segmentinde çukur (scooped) depresyon var mı?" },
  { id:"bidirVT",    cat:"ecg", label:"Bidireksiyonel VT", q:"Bidireksiyonel ventriküler taşikardi var mı?" },
  { id:"ectopy",     cat:"ecg", label:"Ventriküler ektopi / VT", q:"Sık ventriküler ektopi veya VT var mı?" },
  { id:"atachblock", cat:"ecg", label:"Atriyal taşikardi + blok", q:"Bloklu atriyal taşikardi var mı?" },
  { id:"peakedT",    cat:"ecg", label:"Sivri T (hiperkalemi)", q:"Sivri T dalgaları var mı?" },
  { id:"uwave",      cat:"ecg", label:"U dalgası / düz T (hipokalemi)", q:"U dalgası veya düzleşmiş T var mı?" },
  { id:"torsades",   cat:"ecg", label:"Torsades de pointes", q:"Torsades de pointes gelişti mi?" },
  { id:"sinusbrady", cat:"ecg", label:"Sinüs bradikardisi / kavşak ritmi", q:"Sinüs bradikardisi veya kavşak ritmi var mı?" },
  { id:"stelev",     cat:"ecg", label:"ST elevasyonu / iskemi", q:"ST elevasyonu veya iskemik değişiklik var mı?" },

  // --- Laboratuvar (Lab sekmesinden) ---
  { id:"agacid",     cat:"lab", label:"Artmış anyon açıklı metabolik asidoz", q:"Anyon açığı artmış metabolik asidoz var mı?" },
  { id:"osmgap",     cat:"lab", label:"Ozmolar gap >10", q:"Ozmolar gap >10 mOsm/kg mı?" },
  { id:"lactate",    cat:"lab", label:"Laktat belirgin yüksek (>8)", q:"Laktat >8 mmol/L mi?" },
  { id:"respalk",    cat:"lab", label:"Respiratuvar alkaloz (+ metabolik asidoz)", q:"Kan gazında respiratuvar alkaloz + metabolik asidoz birlikteliği var mı?" },
  { id:"hypoK",      cat:"lab", label:"Hipokalemi", q:"Potasyum <3.5 mmol/L mi?" },
  { id:"hyperK",     cat:"lab", label:"Hiperkalemi", q:"Potasyum >5.5 mmol/L mi?" },
  { id:"hypoCa",     cat:"lab", label:"Hipokalsemi", q:"Hipokalsemi var mı?" },
  { id:"aki",        cat:"lab", label:"Akut böbrek hasarı", q:"Kreatinin yükselmiş mi?" },
  { id:"ckhigh",     cat:"lab", label:"CK yüksek (rabdomiyoliz)", q:"CK belirgin yüksek mi?" },
  { id:"leuko",      cat:"lab", label:"Lökositoz", q:"Lökositoz var mı?" },
  { id:"oxalate",    cat:"lab", label:"İdrarda oksalat kristalleri", q:"İdrarda kalsiyum oksalat kristalleri var mı?" },
  { id:"ketosis",    cat:"lab", label:"Ketonemi/ketonüri (asidoz olmadan)", q:"Asidoz olmaksızın ketoz var mı?" },
  { id:"spo2gap",    cat:"lab", label:"SpO₂ ~85 sabit, O₂'ye yanıtsız / SaO₂ farkı", q:"SpO₂ ~%85'te sabit ve oksijene yanıtsız mı (SaO₂-SpO₂ farkı)?" },
  { id:"chocblood",  cat:"lab", label:"Çikolata kahverengi kan", q:"Alınan kan çikolata kahverengi mi?" },
  { id:"methb",      cat:"lab", label:"MetHb düzeyi yüksek", q:"Ko-oksimetride MetHb yüksek mi?" },
  { id:"cohb",       cat:"lab", label:"COHb yüksek", q:"Ko-oksimetride COHb yüksek mi?" },
  { id:"apaplevel",  cat:"lab", label:"Parasetamol düzeyi tedavi çizgisinin üzerinde", q:"Parasetamol düzeyi nomogramda çizginin üstünde mi?" },
  { id:"salilevel",  cat:"lab", label:"Salisilat düzeyi yüksek", q:"Salisilat düzeyi yüksek mi?" },
  { id:"digilevel",  cat:"lab", label:"Digoksin düzeyi yüksek", q:"Digoksin düzeyi yüksek mi?" },
  { id:"lilevel",    cat:"lab", label:"Lityum düzeyi yüksek", q:"Lityum düzeyi yüksek mi?" },
  { id:"etohlevel",  cat:"lab", label:"Etanol düzeyi yüksek", q:"Etanol düzeyi yüksek mi?" },
  { id:"lfthigh",    cat:"lab", label:"Transaminaz yüksekliği", q:"AST/ALT yüksek mi?" },
  { id:"venoushyperox", cat:"lab", label:"Venöz kan arteriyel kadar kırmızı (venöz hiperoksi)", q:"Venöz kan parlak kırmızı / venöz O₂ satürasyonu yüksek mi?" },
  { id:"hypoNa",     cat:"lab", label:"Hiponatremi", q:"Hiponatremi var mı?" },

  // --- öykü / maruziyet (Hasta sekmesi) ---
  { id:"h_serot",    cat:"hx", label:"Serotonerjik ilaç öyküsü / doz artışı", q:"Son 24 saatte serotonerjik ilaç başlanmış, artırılmış veya aşırı alınmış mı (SSRI, SNRI, tramadol, MAOİ, linezolid, MDMA)?" },
  { id:"h_dopant",   cat:"hx", label:"Antipsikotik / dopamin antagonisti öyküsü", q:"Antipsikotik veya antiemetik (metoklopramid) kullanımı / doz artışı ya da L-dopa kesilmesi var mı?" },
  { id:"h_tca",      cat:"hx", label:"TSA / Na kanal blokeri alımı", q:"Trisiklik antidepresan veya Na kanal blokeri (karbamazepin, difenhidramin, kokain, propranolol, bupropion) alımı var mı?" },
  { id:"h_bbccb",    cat:"hx", label:"Beta bloker / KKB alımı", q:"Beta bloker veya kalsiyum kanal blokeri alımı var mı?" },
  { id:"h_digi",     cat:"hx", label:"Digoksin / kardiyak glikozit", q:"Digoksin kullanımı veya bitkisel glikozit (zakkum, yüksükotu) alımı var mı?" },
  { id:"h_opioid",   cat:"hx", label:"Opioid alımı", q:"Opioid alımı öyküsü var mı?" },
  { id:"h_opwd",     cat:"hx", label:"Opioid kesilmesi / nalokson sonrası", q:"Opioid bağımlısında kesilme veya nalokson uygulaması var mı?" },
  { id:"h_etohwd",   cat:"hx", label:"Alkol / benzodiazepin kesilmesi", q:"Kronik alkol veya benzodiazepin kullanıcısında kesilme var mı?" },
  { id:"h_sedative", cat:"hx", label:"Benzodiazepin / barbitürat / GHB alımı", q:"Benzodiazepin, barbitürat, zolpidem veya GHB alımı var mı?" },
  { id:"h_symp",     cat:"hx", label:"Kokain / amfetamin / katinon alımı", q:"Kokain, amfetamin, MDMA veya sentetik katinon alımı var mı?" },
  { id:"h_antichol", cat:"hx", label:"Antikolinerjik ajan alımı", q:"Antihistaminik, atropin, skopolamin, datura, TSA veya antipsikotik alımı var mı?" },
  { id:"h_op",       cat:"hx", label:"Organofosfat / karbamat / mantar", q:"Pestisit (organofosfat, karbamat) veya muskarinik mantar maruziyeti var mı?" },
  { id:"h_sali",     cat:"hx", label:"Salisilat alımı", q:"Aspirin / salisilat alımı (akut veya kronik) var mı?" },
  { id:"h_apap",     cat:"hx", label:"Parasetamol alımı", q:"Parasetamol alımı var mı?" },
  { id:"h_oxidant",  cat:"hx", label:"Oksidan ajan (dapson, benzokain, nitrit, anilin)", q:"Oksidan ajan maruziyeti var mı (dapson, benzokain, 'poppers', anilin boya)?" },
  { id:"h_fire",     cat:"hx", label:"Yangın / duman / kapalı alan yanma", q:"Yangın, duman inhalasyonu veya kapalı alanda yanma kaynağı var mı?" },
  { id:"h_cyanide",  cat:"hx", label:"Siyanür kaynağı (laboratuvar, kuyumcu, nitroprussid)", q:"Siyanür kaynağı maruziyeti var mı?" },
  { id:"h_toxalc",   cat:"hx", label:"Metanol / etilen glikol (antifriz, sahte içki)", q:"Antifriz, sahte/kaçak içki, cam suyu alımı var mı?" },
  { id:"h_isoprop",  cat:"hx", label:"İzopropanol (kolonya, el dezenfektanı)", q:"İzopropil alkol (kolonya, dezenfektan) alımı var mı?" },
  { id:"h_su",       cat:"hx", label:"Sülfonilüre / insülin", q:"Sülfonilüre veya insülin maruziyeti var mı?" },
  { id:"h_li",       cat:"hx", label:"Lityum kullanımı", q:"Lityum kullanıyor mu?" },
  { id:"h_inh",      cat:"hx", label:"İzoniazid alımı", q:"İzoniazid alımı var mı?" },
  { id:"h_anest",    cat:"hx", label:"Volatil anestezik / süksinilkolin", q:"Yakın zamanda volatil anestezik veya süksinilkolin maruziyeti var mı?" },
  { id:"h_pcp",      cat:"hx", label:"Ketamin / PCP / dekstrometorfan", q:"Ketamin, fensiklidin veya dekstrometorfan alımı var mı?" },
  { id:"h_clon",     cat:"hx", label:"Klonidin / imidazolin", q:"Klonidin veya imidazolin (göz/burun damlası) alımı var mı?" },
  { id:"onset_fast", cat:"hx", label:"Hızlı başlangıç (<24 saat)", q:"Belirtiler 24 saat içinde hızla mı gelişti?" },
  { id:"onset_slow", cat:"hx", label:"Yavaş başlangıç (günler)", q:"Belirtiler günler içinde yavaş mı gelişti?" },
  { id:"h_iron",     cat:"hx", label:"Demir alımı", q:"Demir preparatı alımı var mı?" },
  { id:"h_co",       cat:"hx", label:"Soba / şofben / jeneratör maruziyeti", q:"Soba, şofben, jeneratör veya egzoz maruziyeti var mı? Aynı ortamda başkalarında da semptom var mı?" }
];

const FINDING_BY_ID = Object.fromEntries(FINDINGS.map(f => [f.id, f]));

/* Toksidromlar */
const TOXIDROMES = [
  {
    id:"symp", name:"Sempatomimetik", short:"Sempato.", color:"#c0392b",
    agents:"Kokain, amfetaminler, MDMA, sentetik katinonlar, efedrin, kafein/teofilin, albuterol",
    classic:"Taşikardi, hipertansiyon, hipertermi, midriyazis, TERLİ cilt, ajitasyon, bağırsak sesleri normal/artmış",
    w:{ tachy:3, htn:3, hyperth:2, tachypnea:1, mydriasis:3, diaph:3, sweatypalm:2, agit:3, psychosis:2, seizure:1, tremor:1, hyperreflex:1, bs_up:1, hypergly:1, chestpain:2, septum:2, h_symp:4,
        dryskin:-3, drymucosa:-2, miosis:-3, brady:-3, sedation:-2, coma:-2, retention:-1, bs_down:-1, hypoth:-2 },
    mgmt:"Benzodiazepin titrasyonu (ajitasyon, HT, taşikardi, hipertermi), agresif soğutma, sıvı; beta bloker TEK BAŞINA kullanma (kokain). Göğüs ağrısında ASA, nitrat, benzodiazepin."
  },
  {
    id:"antichol", name:"Antikolinerjik", short:"Antikol.", color:"#d35400",
    agents:"Antihistaminikler (difenhidramin), TSA, antipsikotikler, atropin/skopolamin, antispazmodikler, Datura, benztropin",
    classic:"'Kör, kuru, kırmızı, sıcak, deli, tavşan gibi': midriyazis, KURU cilt ve mukoza, flushing, hipertermi, taşikardi, deliryum, üriner retansiyon, bağırsak sesleri azalmış",
    w:{ tachy:3, hyperth:2, htn:1, mydriasis:3, dryskin:3, drymucosa:3, flushed:2, bs_down:2, retention:3, delirium:3, halluc:2, agit:2, mutism:1, seizure:1, myoclonus:1, qrswide:1, qtlong:1, h_antichol:4,
        diaph:-3, sweatypalm:-2, miosis:-3, brady:-2, saliv:-3, bronchorr:-3, diarrhea:-2, incont:-1, lacrim:-2 },
    mgmt:"Destek, benzodiazepin; saf antikolinerjik deliryumda fizostigmin (QRS geniş / TSA şüphesinde kontrendike). Hipertermide soğutma, retansiyonda sonda."
  },
  {
    id:"cholin", name:"Kolinerjik", short:"Kolinerjik", color:"#16a085",
    agents:"Organofosfatlar, karbamatlar, sinir ajanları, fizostigmin/neostigmin, muskarinik mantarlar (Clitocybe, Inocybe), nikotin",
    classic:"SLUDGE/DUMBELS: salivasyon, lakrimasyon, idrar/gaita inkontinansı, kusma-ishal, bronkore-bronkospazm, bradikardi, MİYOZİS; nikotinik: fasikülasyon, güçsüzlük, taşikardi",
    w:{ miosis:3, saliv:3, lacrim:2, bronchorr:4, wheeze:2, vomit:2, diarrhea:2, incont:2, diaph:2, fascic:4, weakness:3, brady:2, hypot:1, seizure:1, coma:1, sedation:1, pulmedema:2, odor_garlic:2, rhinorrhea:1, bs_up:2, abdpain:1, hypoxia:1, h_op:4,
        dryskin:-3, drymucosa:-3, mydriasis:-2, bs_down:-2, retention:-3, delirium:-1 },
    mgmt:"Dekontaminasyon + koruyucu ekipman. Atropin: sekresyon kuruyana kadar her 3-5 dk'da doz ikiye katlanır (pupil hedef değil). Pralidoksim (OP, erken). Nöbet: benzodiazepin. Süksinilkolinden kaçın."
  },
  {
    id:"opioid", name:"Opioid", short:"Opioid", color:"#34495e",
    agents:"Morfin, eroin, fentanil ve analogları, oksikodon, metadon, tramadol (nöbet), buprenorfin, loperamid (QT)",
    classic:"Miyozis + solunum depresyonu + SSS depresyonu triadı; bradikardi, hipotansiyon, hipotermi, hiporefleksi, bağırsak sesleri azalmış",
    w:{ miosis:4, bradypnea:4, shallow:3, hypoxia:2, sedation:3, coma:3, brady:1, hypot:1, hypoth:1, bs_down:2, hyporeflex:1, tracks:3, patch:2, pulmedema:1, hypercap:2, h_opioid:4,
        mydriasis:-2, tachypnea:-2, agit:-2, diaph:-1, htn:-1, hyperreflex:-1, tachy:-1 },
    mgmt:"Havayolu ve ventilasyon önce. Nalokson 0,04-0,4 mg IV titre (solunum hedefi, uyanıklık değil); yanıt varsa kesilme riski; uzun etkili ajanlarda infüzyon (etkili dozun 2/3'ü/saat) ve gözlem."
  },
  {
    id:"sedhyp", name:"Sedatif-hipnotik", short:"Sedatif", color:"#7f8c8d",
    agents:"Benzodiazepinler, barbitüratlar, Z-ilaçlar, GHB, etanol, propofol, baklofen",
    classic:"SSS depresyonu, normal/hafif küçük pupiller, ataksi, nistagmus, dizartri; vitaller görece korunmuş (barbitürat/etanol/GHB'de hipoventilasyon, hipotermi)",
    w:{ sedation:4, coma:3, ataxia:3, nystagmus:3, dysarthria:2, hyporeflex:1, hypotonia:1, bradypnea:2, brady:1, hypot:1, hypoth:2, bullae:2, suddenwake:2, odor_etoh:2, etohlevel:2, myoclonus:1, h_sedative:4,
        agit:-2, seizure:-1, hyperth:-3, mydriasis:-1, tachy:-1, diaph:-1, hyperreflex:-2, clonus:-2 },
    mgmt:"Destek tedavi, havayolu. Flumazenil yalnız izole, bağımlı olmayan benzodiazepin alımında (nöbet riski; TSA ko-ingestiyonunda kontrendike). GHB: kısa süreli koma, ani uyanma."
  },
  {
    id:"serot", name:"Serotonin sendromu", short:"Serotonin", color:"#8e44ad",
    agents:"SSRI/SNRI, MAOİ, tramadol, meperidin, linezolid, MDMA, lityum, triptanlar, dekstrometorfan, ondansetron, metilen mavisi; kombinasyonlar",
    classic:"Hunter: serotonerjik ajan + (spontan klonus / indüklenebilir klonus + ajitasyon veya diyaforez / oküler klonus / tremor + hiperrefleksi / hipertoni + >38 °C + klonus). Hızlı başlangıç (<24 s), alt ekstremite > üst, hiperaktif bağırsak",
    w:{ h_serot:4, onset_fast:2, clonus:4, sponclonus:4, ocularclonus:4, hyperreflex:3, tremor:2, rigidLE:2, agit:2, diaph:2, hyperth:2, tachy:2, htn:2, mydriasis:2, bs_up:2, diarrhea:1, myoclonus:1, delirium:1, seizure:1,
        leadpipe:-1, hyporeflex:-3, bradykin:-2, dryskin:-2, onset_slow:-3, h_dopant:-1, brady:-1, mutism:-1 },
    mgmt:"Serotonerjik ajanları kes, benzodiazepin, soğutma; orta-ağır olguda siproheptadin (12 mg PO yükleme, sonra 2 mg/2 saat). Ağır hipertermi (>41 °C): sedasyon, paralizi, entübasyon. Ajitasyon için fiziksel kısıtlama tek başına kullanılmaz."
  },
  {
    id:"nms", name:"Nöroleptik malign sendrom", short:"NMS", color:"#2c3e50",
    agents:"Haloperidol, atipik antipsikotikler, metoklopramid, proklorperazin; L-dopa/dopamin agonisti kesilmesi",
    classic:"Dopamin antagonisti + günler içinde başlayan KURŞUN BORU rijidite, hipertermi, mental durum değişikliği (mutizm/stupor), otonomik instabilite, bradirefleksi, CK yüksek",
    w:{ h_dopant:4, onset_slow:3, leadpipe:4, hyperth:3, mutism:3, delirium:2, tachy:2, htn:1, hypot:1, diaph:2, bradykin:2, ckhigh:3, leuko:1, hyporeflex:1, incont:1, tremor:1, saliv:1, aki:1, mydriasis:0,
        clonus:-3, sponclonus:-3, ocularclonus:-3, hyperreflex:-3, onset_fast:-2, bs_up:-1, h_serot:-1 },
    mgmt:"Ajanı kes, agresif soğutma, sıvı (rabdomiyoliz), benzodiazepin; ağır olguda dantrolen veya bromokriptin. Diyaliz gerekebilir. Antipsikotik yeniden başlanması ≥2 hafta ertelenir."
  },
  {
    id:"mh", name:"Malign hipertermi", short:"MH", color:"#e74c3c",
    agents:"Volatil anestezikler (sevofluran, desfluran, izofluran), süksinilkolin",
    classic:"Anestezi sırasında/sonrasında açıklanamayan EtCO₂ artışı, taşikardi, masseter spazmı, yaygın rijidite, hızla yükselen ısı, hiperkalemi, asidoz",
    w:{ h_anest:5, hypercap:4, trismus:3, leadpipe:3, hyperth:3, tachy:2, hyperK:2, ckhigh:2, agacid:2, ectopy:1, peakedT:1, diaph:1,
        onset_slow:-3, clonus:-2, h_dopant:-1 },
    mgmt:"Tetikleyiciyi durdur, %100 O₂ ve hiperventilasyon, dantrolen 2,5 mg/kg IV (10 mg/kg'a kadar tekrar), soğutma, hiperkalemi tedavisi, bikarbonat (asidoz), aritmi için KKB kullanma."
  },
  {
    id:"sali", name:"Salisilat", short:"Salisilat", color:"#e67e22",
    agents:"Aspirin, metil salisilat (keklik üzümü yağı, kremler), bizmut subsalisilat",
    classic:"Takipne/hiperpne, tinnitus, kusma, terleme, hipertermi; respiratuvar alkaloz + anyon açıklı metabolik asidoz; konfüzyon/ajitasyon; nonkardiyojenik pulmoner ödem (ağır)",
    w:{ h_sali:4, salilevel:5, tachypnea:4, kussmaul:2, tinnitus:4, vomit:2, diaph:2, hyperth:1, tachy:1, agit:1, delirium:2, agacid:3, respalk:4, pulmedema:2, hypoK:1, hypogly:1, coma:1, seizure:1, ckhigh:0,
        bradypnea:-3, shallow:-3, miosis:-1, brady:-1 },
    mgmt:"Kömür (erken, tekrarlayan doz düşünülebilir), idrar alkalinizasyonu (NaHCO₃ bolus + infüzyon, idrar pH 7,5-8), potasyum replasmanı, glukoz (nöroglikopeni). Hemodiyaliz: düzey >100 mg/dL (akut, normal böbrek) / >90 (böbrek bozukluğu) / >60 (kronik); salisilizme bağlı mental durum değişikliği, pH <7,2 (veya agresif tedaviye rağmen <7,3), serebral/pulmoner ödem, bikarbonat infüzyonunu engelleyen sıvı yükü, tedaviye rağmen kötüleşme. Entübasyon tehlikeli: hiperventilasyonu sürdür."
  },
  {
    id:"nachan", name:"Na kanal blokajı (TSA tipi)", short:"Na kanal", color:"#9b59b6",
    agents:"TSA (amitriptilin), karbamazepin, difenhidramin, kokain, propranolol, bupropion, kinidin, lamotrijin, lokal anestezikler, klorokin",
    classic:"Geniş QRS (≥100 ms), aVR'de R ≥3 mm, terminal sağ aks, hipotansiyon, taşikardi, nöbet, koma; TSA'da antikolinerjik bulgular eşlik eder; Brugada paterni",
    w:{ h_tca:4, qrswide:4, qrsvwide:4, avrR:4, raxis:3, brugada:3, ectopy:2, tachy:2, hypot:3, seizure:3, coma:2, sedation:1, qtlong:1, mydriasis:1, dryskin:1, retention:1, delirium:1, bs_down:1, stelev:0,
        brady:-1, miosis:-2, diaph:-1 },
    mgmt:"NaHCO₃ 1-2 mEq/kg IV bolus (QRS >100 ms, hipotansiyon, aritmi), hedef pH 7,50-7,55; hipertonik salin alternatif. Nöbet: benzodiazepin (fenitoin yok). Hipotansiyon: sıvı, norepinefrin. Dirençli: lidokain (IB), lipid emülsiyonu; IA/IC/III antiaritmikler ve fizostigmin kontrendike."
  },
  {
    id:"bbccb", name:"Beta bloker / KKB", short:"BB-KKB", color:"#2980b9",
    agents:"Metoprolol, propranolol (Na kanal, nöbet), sotalol (QT); verapamil, diltiazem, amlodipin (vazodilatasyon)",
    classic:"Bradikardi, hipotansiyon, AV blok, şok. KKB: HİPERGLİSEMİ ve mental durum görece korunmuş; BB: hipoglisemi, bronkospazm; propranolol: geniş QRS, nöbet, koma",
    w:{ h_bbccb:4, brady:4, sinusbrady:3, hypot:4, avblock:3, weakpulse:2, hypergly:2, hypogly:1, wheeze:1, normalMS:1, seizure:1, qrswide:1, qtlong:1, coma:1, pulmedema:1,
        tachy:-3, htn:-3, mydriasis:-1, hyperth:-2, agit:-2, diaph:-1 },
    mgmt:"Atropin (sıklıkla yetersiz), sıvı, kalsiyum, glukagon (BB), YÜKSEK DOZ İNSÜLİN-ÖGLİSEMİ (1 U/kg bolus + 1 U/kg/s, 10 U/kg/s'e titre; dekstroz + K takibi), vazopresör (norepinefrin/epinefrin), lipid emülsiyonu, pacing, ECMO (refrakter). Yavaş salımlı formda tüm bağırsak yıkama."
  },
  {
    id:"digi", name:"Kardiyak glikozit (digoksin)", short:"Digoksin", color:"#27ae60",
    agents:"Digoksin, yüksükotu, zakkum, inci çiçeği, kurbağa derisi (bufadienolid)",
    classic:"Bulantı-kusma, konfüzyon, ksantopsi; bradiaritmi + artmış otomatisite (bloklu atriyal taşikardi, bidireksiyonel VT, sık PVC), AV blok, 'çukur' ST; akut alımda HİPERKALEMİ (prognostik)",
    w:{ h_digi:4, digilevel:5, vomit:3, xanthopsia:4, visual:2, delirium:2, brady:3, avblock:3, bidirVT:5, atachblock:4, ectopy:3, scoop:2, hyperK:4, hypoK:1, irregular:2, abdpain:1, headache:1, sinusbrady:2,
        tachy:-1, mydriasis:-1, hyperth:-2, diaph:-1 },
    mgmt:"Digoksin-Fab: akut hayatı tehdit eden aritmi, K >5-5,5 mmol/L, hemodinamik bozukluk; ağır toksisite + miktar bilinmiyor: hemodinamik olarak görece stabilse 2 flakon, yanıt yetersizse 1-2 flakon tekrar; arrest yakın/arrestte 10 flakon; düzey biliniyorsa flakon = düzey (ng/mL) × kg / 100 (tam nötralizasyon; kısmi için yarısı). Atropin (bradikardi), Mg (ektopi). Kalsiyum verme (tartışmalı, kaçın), kardiyoversiyon düşük enerji/ son çare."
  },
  {
    id:"methb", name:"Metemoglobinemi", short:"MetHb", color:"#5d4037",
    agents:"Dapson, benzokain/lidokain spreyler, nitritler ('poppers'), anilin boyalar, fenazopiridin, nitrat kuyu suyu (bebek), rasburikaz",
    classic:"O₂'ye yanıtsız siyanoz, SpO₂ ~%85'te takılı, çikolata kahverengi kan, normal PaO₂; >%20 dispne-baş ağrısı-taşikardi, >%50 koma/nöbet/asidoz",
    w:{ h_oxidant:4, methb:5, cyanosis:4, cyanlips:3, spo2gap:5, chocblood:5, tachy:1, headache:2, hypoxia:2, tachypnea:1, delirium:1, seizure:1, coma:1, agacid:1,
        miosis:-1, brady:-1, hyperth:-1, bs_down:-1 },
    mgmt:"O₂, oksidan ajanı kes. Metilen mavisi 1-2 mg/kg IV (5 dk'da), 30-60 dk'da tekrar (MetHb >%30 veya daha düşük düzeyde hipoksi semptomu varsa; %20-30 + semptom); G6PD eksikliğinde etkisiz/hemoliz; serotonerjik ilaçlarla serotonin sendromu riski; dapsonda rebound (simetidin). Refrakter: kan değişimi, HBO."
  },
  {
    id:"asphyx", name:"Hücresel asfiksan (siyanür / CO / H₂S)", short:"CN-CO-H₂S", color:"#c0392b",
    agents:"Siyanür (yangın dumanı, nitroprussid, kuyumcu, kayısı çekirdeği), karbonmonoksit (soba, şofben, jeneratör), hidrojen sülfür (kanalizasyon, gübre çukuru)",
    classic:"Hipoksi olmadan laktik asidoz (laktat >8-10), koma/nöbet, hipotansiyon, kardiyovasküler kollaps; CO: baş ağrısı, bulantı, ev halkında benzer semptom, SpO₂ yanıltıcı; CN: acı badem, venöz hiperoksi",
    w:{ h_fire:4, h_cyanide:4, h_co:4, cohb:5, lactate:4, agacid:3, coma:3, seizure:2, hypot:3, weakpulse:2, headache:3, vomit:2, odor_almond:3, odor_egg:3, venoushyperox:3, cherry:2, tachypnea:1, bradypnea:1, brady:1, tachy:1, delirium:2, stelev:2, chestpain:1, dizziness:1,
        miosis:-1, mydriasis:0, dryskin:-1, retention:-1 },
    mgmt:"%100 O₂ (CO: NRM/entübasyon, HBO: COHb >%25, gebelik >%15, bilinç kaybı, pH <7,25, uç organ iskemisi — EKG/troponin, solunum yetmezliği, fokal nörolojik bulgu, bilinç değişikliği). Siyanür: hidroksokobalamin 5 g IV (15 dk), gerekirse tekrar ± sodyum tiyosülfat 12,5 g; yangın kurbanlarında nitrit verme. H₂S: O₂, nitrit düşünülebilir."
  },
  {
    id:"toxalc", name:"Toksik alkol (metanol / etilen glikol)", short:"Toksik alkol", color:"#1abc9c",
    agents:"Metanol (sahte içki, cam suyu, kolonya katkı), etilen glikol (antifriz), dietilen glikol",
    classic:"Erken: sarhoşluk, kusma, karın ağrısı, ozmolar gap; geç (6-24 s): artmış AG asidoz, Kussmaul; metanol: görme kaybı, 'kar fırtınası', pupil yanıtsızlığı; EG: hipokalsemi, oksalat kristali, böbrek yetmezliği, kraniyal nöropati",
    w:{ h_toxalc:4, osmgap:4, agacid:4, kussmaul:3, visual:4, mydriasis:1, vomit:2, abdpain:2, delirium:2, coma:2, seizure:1, oxalate:4, hypoCa:3, aki:3, tachypnea:2, odor_etoh:1, ataxia:1, lactate:1, dysarthria:1,
        ketosis:-2, miosis:-1, bs_up:-1, onset_slow:0 },
    mgmt:"Fomepizol 15 mg/kg IV yükleme, 10 mg/kg/12 s ×4, sonra 15 mg/kg/12 s (diyalizde her 4 s) — etanol alternatif. Bikarbonat (pH <7,3). Metanol: folinik asit/folat; EG: tiamin + piridoksin. Hemodiyaliz: pH <7,25-7,3, görme bulgusu, böbrek yetmezliği, yüksek düzey (>50 mg/dL) veya kötüleşen vitaller."
  },
  {
    id:"isoprop", name:"İzopropanol", short:"İzopropanol", color:"#16a085",
    agents:"İzopropil alkol (kolonya, el dezenfektanı, cam temizleyici)",
    classic:"Belirgin sarhoşluk/koma, aseton kokusu, ketozis VAR, asidoz YOK (ozmolar gap + ketoz, normal AG), hemorajik gastrit, hipotansiyon (ağır)",
    w:{ h_isoprop:4, osmgap:3, ketosis:4, odor_acetone:3, sedation:3, coma:2, ataxia:2, vomit:2, abdpain:1, hypot:1, hypoth:1, dysarthria:1,
        agacid:-3, visual:-2, oxalate:-3, kussmaul:-2 },
    mgmt:"Destek tedavi; fomepizol gerekmez (asetona dönüşür, asidoz yapmaz). Ağır hipotansiyon/komada hemodiyaliz nadiren."
  },
  {
    id:"hypogl", name:"Hipoglisemik ajan", short:"Hipoglisemi", color:"#f39c12",
    agents:"Sülfonilüreler (glibenklamid, glimepirid), insülin, meglitinidler; etanol (çocuk), beta bloker, salisilat (nöroglikopeni)",
    classic:"Hipoglisemi + terleme, taşikardi, tremor; konfüzyon, fokal nörolojik defisit, nöbet, koma. Sülfonilürede uzun süreli ve tekrarlayan",
    w:{ h_su:4, hypogly:5, diaph:3, tachy:2, tremor:2, delirium:3, coma:3, seizure:2, agit:1, anxiety:1, pale:2, sweatypalm:2,
        hypergly:-5, dryskin:-2, miosis:-1 },
    mgmt:"Dekstroz (D50 25-50 g IV veya D10), yemek; sülfonilürede oktreotid 50-100 µg SC/IV 6-8 saatte bir (rebound önler), 24 saat gözlem. Profilaktik dekstroz infüzyonu sülfonilürede insülin salınımını tetikler, hedefe titre."
  },
  {
    id:"etohwd", name:"Alkol / sedatif yoksunluğu", short:"EtOH-yoksunluk", color:"#d35400",
    agents:"Kronik etanol, benzodiazepin, barbitürat, GHB, baklofen kesilmesi",
    classic:"Tremor, terleme, taşikardi, hipertansiyon, anksiyete, insomni; 12-48 s nöbet; 48-96 s deliryum tremens (hipertermi, hallüsinasyon, ajitasyon); hiperaktif bağırsak",
    w:{ h_etohwd:5, tremor:4, coarsetremor:2, diaph:3, tachy:3, htn:3, hyperth:2, agit:3, halluc:3, delirium:3, anxiety:2, seizure:2, mydriasis:1, vomit:1, bs_up:1, hyperreflex:1, hypoK:1,
        sedation:-3, coma:-3, brady:-2, miosis:-2, bradypnea:-3 },
    mgmt:"Benzodiazepin semptom tetikli (diazepam 10-20 mg IV / lorazepam 2-4 mg) — yüksek doz gerekebilir; dirençli: fenobarbital, propofol/entübasyon. Tiamin 100-500 mg, Mg, K, glukoz. Antipsikotik tek başına verilmez."
  },
  {
    id:"opwd", name:"Opioid yoksunluğu", short:"Opioid-yoksun.", color:"#7f8c8d",
    agents:"Opioid bağımlısında kesilme, nalokson/naltrekson/buprenorfin ile presipite yoksunluk",
    classic:"Midriyazis, piloereksiyon, esneme, lakrimasyon, rinore, kusma-ishal, karın krampları, miyalji, anksiyete; mental durum NORMAL, vitaller hafif yüksek; hayatı tehdit etmez (gebe hariç)",
    w:{ h_opwd:5, mydriasis:3, piloer:4, yawning:4, lacrim:3, rhinorrhea:3, vomit:2, diarrhea:3, abdpain:2, bs_up:2, tachy:1, htn:1, anxiety:3, agit:1, normalMS:2, diaph:1,
        sedation:-3, coma:-4, miosis:-4, bradypnea:-4, seizure:-2, hyperth:-1, delirium:-2 },
    mgmt:"Semptomatik: klonidin, ondansetron, loperamid; buprenorfin veya metadon ile tedavi (presipite yoksunlukta dikkat). Nalokson sonrası yoksunlukta destek, sedasyon."
  },
  {
    id:"li", name:"Lityum toksisitesi", short:"Lityum", color:"#8e44ad",
    agents:"Lityum (akut, akut-kronik, kronik); dehidratasyon, NSAİİ, ACEİ, tiyazid etkileşimi",
    classic:"Kaba tremor, hiperrefleksi, klonus, ataksi, dizartri, konfüzyon; bulantı-kusma-ishal (akut); nefrojenik Dİ; EKG: bradikardi, T düzleşmesi, QT uzaması",
    w:{ h_li:4, lilevel:5, coarsetremor:4, tremor:2, hyperreflex:3, clonus:2, ataxia:3, dysarthria:2, delirium:3, myoclonus:2, vomit:2, diarrhea:2, polyuria:2, brady:1, qtlong:1, seizure:1, aki:1, sinusbrady:1, coma:1, hypoNa:1,
        miosis:-1, bradypnea:-1, dryskin:-1 },
    mgmt:"Kömür ETKİSİZ (tüm bağırsak yıkama: yavaş salımlı). İzotonik salin ile volüm; nefrotoksik ilaçları kes. Hemodiyaliz: düzey >4 mmol/L + böbrek bozukluğu, >5 mmol/L, nöbet/bilinç bozukluğu/hayatı tehdit eden aritmi; rebound için düzey tekrarı."
  },
  {
    id:"dyst", name:"Akut distonik reaksiyon", short:"Distoni", color:"#2c3e50",
    agents:"Haloperidol, metoklopramid, proklorperazin, risperidon, kokain ile birlikte",
    classic:"Fokal istemsiz kas spazmı: tortikolis, okülojirik kriz, trismus, laringeal distoni; mental durum ve vitaller normal; günler içinde (sıklıkla ilk 48 s)",
    w:{ h_dopant:4, dystonia:5, torticollis:4, oculogyric:4, trismus:3, normalMS:3, anxiety:1, stridor:1,
        hyperth:-3, leadpipe:-2, coma:-3, seizure:-2, tachy:-1 },
    mgmt:"Biperiden 5 mg IV/IM veya difenhidramin 25-50 mg IV (benztropin 1-2 mg IV/IM); laringeal distoni havayolu acili. 2-3 gün oral antikolinerjik ile idame."
  },
  {
    id:"dissoc", name:"Dissosiyatif (ketamin / PCP)", short:"Dissosiyatif", color:"#3498db",
    agents:"Ketamin, fensiklidin, dekstrometorfan, metoksetamin",
    classic:"Nistagmus (vertikal/rotatuar), taşikardi, hipertansiyon, ajitasyon veya boş bakış/katatoni, midriyazis, hipersalivasyon, analjezi, rijidite",
    w:{ h_pcp:4, nystagmusV:4, nystagmus:2, dissoc:4, agit:2, tachy:2, htn:2, mydriasis:1, saliv:2, hyperth:1, leadpipe:1, mutism:1, halluc:2, psychosis:2, diaph:1,
        miosis:-2, bradypnea:-2, coma:-1 },
    mgmt:"Sakin ortam, benzodiazepin; hipertermi soğutma; rabdomiyoliz izlemi. Kısıtlamadan kaçın."
  },
  {
    id:"inh", name:"İzoniazid", short:"İzoniazid", color:"#e74c3c",
    agents:"İzoniazid; benzer: hidrazin, Gyromitra mantarı",
    classic:"Alımdan 30 dk-2 s sonra benzodiazepine dirençli tekrarlayan nöbetler, laktik asidoz, koma",
    w:{ h_inh:5, refractseiz:5, seizure:3, lactate:3, agacid:3, coma:2, delirium:1, vomit:1, tachy:1,
        miosis:-1, brady:-1 },
    mgmt:"Piridoksin IV: alınan INH ile gram-gram (bilinmeyen: 5 g), tekrar edilebilir; benzodiazepin eş zamanlı. Dirençli: propofol, barbitürat; hemodiyaliz."
  },
  {
    id:"clon", name:"Klonidin / imidazolin", short:"Klonidin", color:"#34495e",
    agents:"Klonidin, deksmedetomidin, tizanidin, tetrahidrozolin/oksimetazolin damlaları, guanfasin",
    classic:"Opioid benzeri: miyozis, SSS depresyonu, bradikardi, hipotansiyon, hipoventilasyon; erken geçici hipertansiyon; uyarıyla uyanma; nalokson değişken yanıt",
    w:{ h_clon:5, miosis:3, sedation:3, coma:2, brady:3, hypot:3, bradypnea:2, htn:1, hypoth:1, sinusbrady:2, avblock:1, suddenwake:1,
        mydriasis:-2, tachy:-2, agit:-1, hyperth:-2, diaph:-1 },
    mgmt:"Destek, atropin (bradikardi), sıvı/vazopresör; nalokson denenebilir (değişken); 24 saat izlem (çocuk)."
  }
];

/* Önerilen ikili ayrımlar — sekmede referans tablo olarak gösterilir */
const DISCRIMINATORS = [
  { pair:"Sempatomimetik vs Antikolinerjik", key:"Cilt ve bağırsak: sempatomimetikte TERLİ cilt, bağırsak sesleri normal/artmış; antikolinerjikte KURU cilt-mukoza, hipoaktif bağırsak, üriner retansiyon, 'picking' hallüsinasyon." },
  { pair:"Serotonin sendromu vs NMS", key:"Serotonin: serotonerjik ajan, <24 saatte hızlı başlangıç, KLONUS/hiperrefleksi, alt ekstremite > üst, ishal/hiperaktif bağırsak. NMS: dopamin antagonisti, günler içinde, kurşun boru rijidite, bradirefleksi, mutizm, CK çok yüksek." },
  { pair:"Serotonin/NMS vs Antikolinerjik hipertermi", key:"Antikolinerjikte cilt KURU, refleksler ve tonus normal, bağırsak hipoaktif; serotonin/NMS'de terli cilt ve nöromüsküler anormallik (klonus veya rijidite)." },
  { pair:"Malign hipertermi", key:"Anestezik/süksinilkolin tetikleyicisi, dakikalar içinde EtCO₂ artışı ve rijidite; dantrolen yanıtı." },
  { pair:"Opioid vs Sedatif-hipnotik vs Klonidin", key:"Opioid: toplu iğne pupil + bradipne; nalokson yanıtı. Sedatif-hipnotik: pupil normal/orta, solunum görece korunmuş (barbitürat hariç), ataksi/nistagmus. Klonidin: opioid gibi ama bradikardi-hipotansiyon ön planda, uyarıyla uyanır." },
  { pair:"Opioid vs Kolinerjik (miyozis + koma)", key:"Kolinerjikte sekresyonlar artmış (bronkore, salivasyon, lakrimasyon), ishal/inkontinans, fasikülasyon; opioidde sekresyon yok, bağırsak sessiz." },
  { pair:"Bradikardi + hipotansiyon", key:"BB: hipoglisemi, bronkospazm, (propranolol) geniş QRS/nöbet. KKB: hiperglisemi, mental durum korunmuş. Digoksin: GİS, ksantopsi, hiperkalemi, bloklu atriyal taşikardi/bidireksiyonel VT. Kolinerjik: SLUDGE. Klonidin: miyozis + SSS depresyonu." },
  { pair:"Geniş QRS taşikardi", key:"Na kanal blokajı: aVR R ≥3 mm, terminal sağ aks, bikarbonat yanıtı. Hiperkalemi: sivri T, PR uzaması. Digoksin: genelde bradiaritmi." },
  { pair:"Artmış AG metabolik asidoz", key:"GOLD MARK: Glikoller, Oksoprolin, L-laktat, D-laktat, Metanol, Aspirin, Renal yetmezlik, Ketoasidoz. Laktat çok yüksek + hipoksi yok → siyanür/CO/H₂S, metformin, INH. Ozmolar gap + AG → toksik alkol." },
  { pair:"Siyanoz, O₂'ye yanıtsız", key:"MetHb: SpO₂ ~%85 sabit, PaO₂ normal, çikolata kan. Sülfhemoglobinemi benzer, metilen mavisine yanıtsız. Siyanürde siyanoz nadir (venöz hiperoksi)." },
  { pair:"Nöbet + asidoz", key:"INH (benzodiazepine dirençli), teofilin, bupropion, TSA (geniş QRS), tramadol, salisilat (geç), hipoglisemi, siyanür/CO, yoksunluk." }
];

/* Antidot / tedavi tablosu — erişkin dozları; kg girildiyse hesaplanır */
const ANTIDOTES = [
  { id:"nalox", name:"Nalokson", tox:"Opioid", dose:"0,04-0,4 mg IV (apne yoksa düşük başla), 2-3 dk'da bir titre; 2 mg → toplam 10 mg'a kadar. IM/IN 0,4-2 mg. İnfüzyon: etkili dozun 2/3'ü / saat.", note:"Hedef yeterli ventilasyon (uyanıklık değil). Uzun etkili opioid/metadonda ≥6-24 s gözlem." },
  { id:"atro", name:"Atropin", tox:"Kolinerjik (OP/karbamat)", dose:"1-3 mg IV (ağırsa 3-5 mg); her 3-5 dk'da doz ikiye katlanır, bronşiyal sekresyonlar kuruyana kadar. Sonra toplam yükleme dozunun %10-20'si/saat infüzyon.", note:"Pupil ve kalp hızı hedef değil. Bronkore çözülene kadar." , perkg:null },
  { id:"pam", name:"Pralidoksim (2-PAM)", tox:"Organofosfat", dose:"30 mg/kg IV (1-2 g) 15-30 dk'da, sonra 8-10 mg/kg/s (≈500 mg/s) infüzyon.", perkg:{load:30,unit:"mg",rate:8,rateUnit:"mg/s"}, note:"Atropin verildikten sonra, 'yaşlanma' öncesi erken. Karbamatta tartışmalı ama zararı az." },
  { id:"phys", name:"Fizostigmin", tox:"Antikolinerjik deliryum", dose:"0,5-2 mg IV yavaş (≥5 dk), 10-15 dk'da tekrar edilebilir; etkisi 30-60 dk.", note:"KONTRENDİKE: QRS >100 ms / TSA şüphesi, bradikardi, bronkospazm. Atropin hazır olsun." },
  { id:"fluma", name:"Flumazenil", tox:"Benzodiazepin (izole)", dose:"0,2 mg IV 30 sn'de, 1 dk arayla 0,2-0,5 mg; maks 1-3 mg.", note:"Kronik benzodiazepin kullanıcısı, nöbet öyküsü, TSA/prokonvülzan ko-ingestiyonda kontrendike. Rutin kullanılmaz." },
  { id:"bicarb", name:"Sodyum bikarbonat", tox:"Na kanal blokajı (TSA), salisilat", dose:"TSA: 1-2 mEq/kg IV bolus (50-100 mEq), QRS daralana / pH 7,50-7,55 olana kadar tekrar; sonra 150 mEq/1 L D5W infüzyon. Salisilat: 1-2 mEq/kg bolus, sonra 150 mEq/1 L D5W (K ekle) idame ×2-3, hedef idrar pH 7,5-8.", perkg:{load:1,unit:"mEq",max:100,range:"1-2"}, note:"Potasyum ve pH takibi (serum pH <7,55-7,6)." },
  { id:"lipid", name:"Lipid emülsiyonu %20", tox:"Lokal anestezik, lipofilik ilaç (BB, KKB, TSA, bupropion) — refrakter", dose:"1,5 mL/kg IV bolus (1 dk), gerekirse 1-2 kez tekrar; sonra 0,25 mL/kg/dk 30-60 dk. Toplam ≤10-12 mL/kg.", perkg:{load:1.5,unit:"mL",rate:0.25,rateUnit:"mL/dk"}, note:"Lab interferansı, pankreatit, ECMO devresi tıkanması. Hemodinamik kollapsta." },
  { id:"gluca", name:"Glukagon", tox:"Beta bloker", dose:"3-10 mg IV bolus (1-2 dk), yanıt varsa 3-5 mg/s infüzyon.", note:"Kusma (havayolu), hiperglisemi; etkisi sıklıkla geçici — yüksek doz insüline köprü." },
  { id:"hie", name:"Yüksek doz insülin (HIE)", tox:"KKB, beta bloker", dose:"Regüler insülin 1 U/kg IV bolus, sonra 1 U/kg/s; 15-30 dk'da bir 1-2 U/kg/s artır, 10 U/kg/s'e kadar. Dekstroz 0,5 g/kg bolus (glukoz <250 ise) + 0,5 g/kg/s infüzyon. Glukoz her 15-30 dk, K her saat.", perkg:{load:1,unit:"U",rate:1,rateUnit:"U/s"}, note:"Etki 15-60 dk'da başlar; erken başla. Hipoglisemi ve hipokalemi izle." },
  { id:"ca", name:"Kalsiyum", tox:"KKB (ve hipokalsemi, hiperkalemi)", dose:"Kalsiyum klorür %10 10-20 mL (1-2 g) santral yoldan veya kalsiyum glukonat %10 30-60 mL (3-6 g) IV 5-10 dk; 10-20 dk arayla 3-4 kez; infüzyon 0,2-0,4 mL/kg/s CaCl.", note:"İyonize Ca hedef normalin 2 katına kadar. Digoksinde kaçın." },
  { id:"fab", name:"Digoksin immün Fab", tox:"Kardiyak glikozit", dose:"Ağır toksisite, miktar bilinmiyor: görece stabil hasta 2 flakon, yanıt yetersizse 1-2 flakon tekrar; arrest yakın/arrest: 10 flakon (erişkin). Hesap: flakon = (serum digoksin ng/mL × kg) / 100; alınan mg bilinirse flakon = mg × 0,8 / 0,5 (biyoyararlanım %80).", note:"Endikasyon: hayatı tehdit eden aritmi, K >5-5,5 mmol/L (akut), hemodinamik instabilite, son organ hasarı. Sonrası serum digoksin ölçümü güvenilmez (total)." },
  { id:"hydroxo", name:"Hidroksokobalamin", tox:"Siyanür", dose:"5 g IV 15 dk'da (70 mg/kg çocuk); gerekirse ikinci 5 g 15 dk-2 saatte. ± Sodyum tiyosülfat %25 50 mL (12,5 g) IV 10-30 dk.", perkg:{load:70,unit:"mg",max:5000}, note:"Kırmızı idrar/cilt, lab interferansı (ko-oksimetri, kreatinin). Yangın kurbanlarında nitrit YOK (MetHb + COHb)." },
  { id:"mb", name:"Metilen mavisi", tox:"Metemoglobinemi", dose:"1-2 mg/kg IV (%1 solüsyon 0,1-0,2 mL/kg) 5 dk'da; 30-60 dk'da yanıt yoksa 1 mg/kg tekrar. Toplam ≤7 mg/kg.", perkg:{load:1,unit:"mg",range:"1-2"}, note:"Endikasyon: MetHb >%30 (veya daha düşükken hipoksi semptomu); %20-30 ve semptomatik; anemi/kalp-akciğer hastalığında daha düşük eşik. G6PD eksikliği (hemoliz), serotonerjik ilaçlar (serotonin sendromu), dapsonda uzun yarı ömür." },
  { id:"fome", name:"Fomepizol", tox:"Metanol, etilen glikol", dose:"15 mg/kg IV yükleme (30 dk), 10 mg/kg/12 s ×4 doz, sonra 15 mg/kg/12 s (enzim indüksiyonu). Hemodiyalizde her 4 saatte bir.", perkg:{load:15,unit:"mg",rate:10,rateUnit:"mg/12 s"}, note:"Etanol alternatif (hedef 100-150 mg/dL). Metanol: folinik asit 50 mg IV/4-6 s; EG: tiamin 100 mg + piridoksin 50 mg." },
  { id:"nac", name:"N-asetilsistein (IV 21 saat)", tox:"Parasetamol", dose:"150 mg/kg (200 mL D5W) 60 dk'da → 50 mg/kg (500 mL) 4 saatte → 100 mg/kg (1000 mL) 16 saatte. Oral: 140 mg/kg yükleme, 70 mg/kg/4 s ×17.", perkg:{load:150,unit:"mg",rate:null}, note:"Endikasyon: nomogramda çizgi üstü, zamanı bilinmeyen alım + ölçülebilir düzey veya yüksek ALT, alımdan >8 saat sonra başvuruda düzey beklemeden başla. 16-saatlik üçüncü torba hepatotoksisite/yüksek düzeyde uzatılır." },
  { id:"cypro", name:"Siproheptadin", tox:"Serotonin sendromu", dose:"12 mg PO/NG yükleme, sonra 2 mg her 2 saatte semptom sürdükçe; idame 8 mg/6 s. Günlük maks 32 mg.", note:"Yalnız oral; antikolinerjik etki (sedasyon). Ağır olguda sedasyon-entübasyon öncelikli." },
  { id:"dant", name:"Dantrolen", tox:"Malign hipertermi (NMS'de ikinci basamak)", dose:"MH: 2,5 mg/kg IV hızlı, belirtiler sürerse 5-10 dk'da tekrar, 10 mg/kg'a (bazen daha fazla) kadar; sonra 1 mg/kg/4-6 s 24-48 s. NMS: 1-2,5 mg/kg IV, 1 mg/kg/6 s (maks 10 mg/kg/gün).", perkg:{load:2.5,unit:"mg"}, note:"Hepatotoksisite, KKB ile birlikte verilmez (hiperkalemi). NMS'de kanıt zayıf." },
  { id:"bromo", name:"Bromokriptin", tox:"NMS", dose:"2,5 mg PO/NG 6-8 saatte bir, 45 mg/gün'e kadar titre; 10 gün sürdür, yavaş azalt.", note:"Hipotansiyon, kusma; psikoz alevlenebilir." },
  { id:"octre", name:"Oktreotid", tox:"Sülfonilüre hipoglisemisi", dose:"50-100 µg SC/IV 6-8 saatte bir (çocuk 1-1,5 µg/kg); 24 saat.", note:"Dekstroz ile birlikte; kesildikten sonra 12-24 s hipoglisemi izlemi." },
  { id:"dex", name:"Dekstroz", tox:"Hipoglisemi", dose:"D50 50 mL (25 g) IV veya D10 250 mL IV; çocuk D10 2-5 mL/kg. Sonra D10 infüzyon.", note:"Kronik alkolde tiamin ile birlikte (önce/eş zamanlı)." },
  { id:"pyri", name:"Piridoksin (B6)", tox:"İzoniazid, hidrazin, Gyromitra", dose:"Alınan INH ile gram-gram IV (maks hız 0,5-1 g/dk); bilinmeyen: 5 g IV (çocuk 70 mg/kg). Nöbet sürerse tekrar.", perkg:{load:70,unit:"mg",max:5000}, note:"Benzodiazepinle sinerjik. Aşırı dozda periferik nöropati." },
  { id:"benzo", name:"Benzodiazepin", tox:"Sempatomimetik, yoksunluk, nöbet, serotonin/NMS, antikolinerjik ajitasyon", dose:"Lorazepam 2-4 mg IV / diazepam 5-10 mg IV, 5-10 dk arayla titre (yoksunlukta 10-20 mg diazepam); midazolam 5-10 mg IM (damar yolu yoksa).", note:"Tavan doz yok; solunum izlemi. Kokainde kardiyovasküler bulguların birinci basamağı." },
  { id:"mg", name:"Magnezyum sülfat", tox:"Torsades / QT uzaması, digoksin ektopisi", dose:"2 g IV 2-5 dk'da (ağırsa 1-2 dk), 5-15 dk'da tekrar; sonra 1-4 g/s infüzyon. Hedef K >4, Mg >2.", note:"Torsades refrakterse overdrive pacing (90-110/dk) veya izoproterenol." },
  { id:"lido", name:"Lidokain", tox:"TSA/Na kanal blokajı aritmisi (bikarbonata dirençli)", dose:"1-1,5 mg/kg IV bolus, sonra 1-4 mg/dk infüzyon.", perkg:{load:1,unit:"mg",range:"1-1,5"}, note:"Sınıf IA (prokainamid), IC (flekainid) ve III (amiodaron) kontrendike." },
  { id:"charcoal", name:"Aktif kömür", tox:"Çoğu oral alım (ilk 1-2 s)", dose:"1 g/kg (erişkin 50 g) PO/NG. Çoklu doz (0,5 g/kg/4 s): karbamazepin, dapson, fenobarbital, kinin, teofilin.", perkg:{load:1,unit:"g",max:50}, note:"Havayolu korunmuyorsa verme. Bağlamaz: alkoller, demir, lityum, hidrokarbon, kostik." },
  { id:"wbi", name:"Tüm bağırsak yıkama (PEG)", tox:"Yavaş salımlı ilaç, demir, lityum, vücut paketçileri", dose:"PEG-ELS 1,5-2 L/s NG (çocuk 25 mL/kg/s) rektal akıntı berraklaşana kadar.", note:"İleus, perforasyon, havayolu korunmuyorsa kontrendike." },
  { id:"desfer", name:"Deferoksamin", tox:"Demir", dose:"15 mg/kg/s IV infüzyon (hipotansiyonda yavaş başla), 24 saati geçmeden yeniden değerlendir; idrar 'vin rosé' rengi kaybolana kadar.", perkg:{rate:15,rateUnit:"mg/s"}, note:"Endikasyon: demir >500 µg/dL, asidoz, şok, bilinç bozukluğu. ARDS (uzun infüzyon), Yersinia." },
  { id:"carn", name:"L-karnitin", tox:"Valproat (hiperamonyemi, hepatotoksisite)", dose:"100 mg/kg IV yükleme (maks 6 g), sonra 15 mg/kg/4 s.", perkg:{load:100,unit:"mg",max:6000}, note:"Ağır olguda hemodiyaliz." },
  { id:"thia", name:"Tiamin", tox:"Alkol, etilen glikol, Wernicke", dose:"100-500 mg IV; Wernicke şüphesi 500 mg IV 3×/gün.", note:"Glukozdan önce/eş zamanlı." },
  { id:"biper", name:"Biperiden / difenhidramin", tox:"Akut distoni", dose:"Biperiden 5 mg IV/IM (tekrar 30 dk); difenhidramin 25-50 mg IV/IM; benztropin 1-2 mg IV/IM. 48-72 s oral idame.", note:"Laringeal distonide havayolu hazırlığı." },
  { id:"hbo", name:"Hiperbarik oksijen", tox:"Karbonmonoksit", dose:"2,5-3 ATA, 90-120 dk, ilk 6-12 saat içinde.", note:"Endikasyon: COHb >%25 (gebe >%15), bilinç kaybı, ağır metabolik asidoz (pH <7,25), uç organ iskemisi (EKG değişikliği, troponin, solunum yetmezliği, fokal nörolojik defisit, bilinç değişikliği). Tartışmalı; merkez protokolü." }
];

/* Referans: toksidrom hızlı tablosu (sekmede gösterilir) */
const TOX_TABLE = [
  ["Toksidrom","Nabız","TA","Solunum","Isı","Pupil","Cilt","Bağırsak","Mental","Ayırıcı"],
  ["Sempatomimetik","↑","↑","↑","↑","Midriyazis","Terli","Normal/↑","Ajite","Terleme, piloereksiyon, nöbet, MI"],
  ["Antikolinerjik","↑","↑/−","−","↑","Midriyazis","Kuru, kızarık","↓","Deliryum, mırıldanma","Retansiyon, kuru mukoza, 'picking'"],
  ["Kolinerjik","↓ (nik: ↑)","↓/−","↑ (bronkore)","−","Miyozis","Terli","↑","Konfüzyon/koma","SLUDGE, fasikülasyon, güçsüzlük"],
  ["Opioid","↓","↓","↓↓","↓","Miyozis","Normal/soğuk","↓","Depresyon","Nalokson yanıtı, iğne izi"],
  ["Sedatif-hipnotik","−/↓","−/↓","−/↓","−/↓","−/↓","Normal","−","Depresyon","Ataksi, nistagmus, dizartri"],
  ["Serotonin","↑","↑","↑","↑","Midriyazis","Terli","↑ (ishal)","Ajite/konfüze","KLONUS, hiperrefleksi, tremor, <24 s"],
  ["NMS","↑","↑/labil","↑","↑↑","−","Terli, soluk","−/↓","Stupor/mutizm","Kurşun boru rijidite, bradirefleksi, CK↑, günler"],
  ["Salisilat","↑","−","↑↑","↑","−","Terli","−","Konfüze/ajite","Tinnitus, resp. alkaloz + AG asidoz, pulmoner ödem"],
  ["Na kanal (TSA)","↑","↓","−/↓","↑/−","Midriyazis","Kuru","↓","Koma, nöbet","QRS ≥100, aVR R, Brugada, bikarbonat yanıtı"],
  ["BB / KKB","↓","↓","−","−","−","Soğuk/soluk","−","KKB: normal; BB: depresyon","BB hipoglisemi; KKB hiperglisemi"],
  ["Digoksin","↓ / ektopi","↓","−","−","−","−","↑ (bulantı)","Konfüze","Ksantopsi, hiperkalemi, bidireksiyonel VT"],
  ["MetHb","↑","−","↑","−","−","Siyanotik (O₂ yanıtsız)","−","Baş ağrısı → koma","SpO₂ ~85, çikolata kan, normal PaO₂"],
  ["Siyanür / CO","↑ → ↓","↓","↑ → ↓","−","−","Normal/kırmızı","−","Koma, nöbet","Laktat >8-10, hipoksi yok, duman öyküsü"],
  ["Toksik alkol","↑","−","↑ (Kussmaul)","−","Metanol: dilate, yanıtsız","−","↑ (kusma)","Sarhoş → koma","Ozmolar gap → AG asidoz, görme, oksalat, hipoCa"],
  ["Alkol yoksunluğu","↑","↑","↑","↑","Midriyazis","Terli","↑","Tremor, hallüsinasyon, DT","48-96 s, nöbet 12-48 s"],
  ["Opioid yoksunluğu","↑","↑","−","−","Midriyazis","Piloereksiyon","↑↑ (ishal)","Anksiyöz, uyanık","Esneme, lakrimasyon, rinore; hayatı tehdit etmez"]
];
