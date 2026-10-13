/* =====================================================================
   UYGULAMA MANTIĞI
   ===================================================================== */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const VIEWS = [
  { id:"patient", label:"Hasta & öykü",   icon:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0" },
  { id:"vitals",  label:"Vitaller",       icon:"M3 12h4l2-5 3 10 3-7 2 2h4" },
  { id:"exam",    label:"Fizik muayene",  icon:"M12 3v4m0 10v4M5 12h4m6 0h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { id:"ecg",     label:"EKG",            icon:"M2 12h3l2-7 3 14 3-10 2 5 2-2h5" },
  { id:"lab",     label:"Lab & hesap",    icon:"M9 3v7L4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2l-5-9V3M8 3h8" },
  { id:"qa",      label:"Rehberli ayrım", icon:"M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 1.7V15m0 3h0M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
  { id:"result",  label:"Değerlendirme",  icon:"M4 20h16M6 16l4-6 4 4 5-8" },
  { id:"anti",    label:"Antidotlar",     icon:"M12 2l3 3-9 9-3-3zM13 11l5 5-3 3-5-5M5 19l3-3" },
  { id:"ai",      label:"AI danışman",    icon:"M12 3a7 7 0 0 1 7 7c0 2.5-1.3 4-2.5 5.3V18H7.5v-2.7C6.3 14 5 12.5 5 10a7 7 0 0 1 7-7zM9 21h6" },
  { id:"refs",    label:"Kaynaklar",      icon:"M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 7h8M8 11h8M8 15h5" }
];

/* ---------- durum ---------- */
const blank = () => ({
  id: null, created: null,
  patient: { name:"", age:"", sex:"", wt:"", agent:"", time:"", route:"", intent:"", meds:"", hx:"" },
  vitals: { hr:"", sbp:"", dbp:"", rr:"", temp:"", spo2:"", glu:"", etco2:"", gcsE:"", gcsV:"", gcsM:"" },
  ecg: { hr:"", rhythm:"", pr:"", qrs:"", qt:"", avr:"", avrrs:"", axis:"", k:"" },
  lab: { na:"", cl:"", hco3:"", alb:"", ph:"", pco2:"", lac:"", k:"", ca:"", osm:"", glu:"", bun:"", etoh:"", apap:"", apapt:"", sali:"", digi:"", li:"", methb:"", cohb:"", ck:"", cr:"", alt:"", wbc:"", flevel:"", fmg:"" },
  findings: {},     // id -> 1 (var) | -1 (yok)
  skipped: [],      // ayrım motorunda atlanan soru id'leri
  view: "patient", bodyView: "front", region: null
});
let S = blank();
let auto = {}; // vital/EKG/lab'dan türetilen otomatik bulgular id->1

const store = {
  get(k, d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};

/* ---------- yardımcı ---------- */
const num = v => (v===""||v==null||isNaN(+v)) ? null : +v;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2200); }
function setFinding(id, val){ if(val===0||val==null) delete S.findings[id]; else S.findings[id]=val; S.skipped=S.skipped.filter(x=>x!==id); refresh(); }
function getFinding(id){ return S.findings[id] ?? (auto[id] ? 1 : 0); }
function effectiveFindings(){ const f={...Object.fromEntries(Object.keys(auto).map(k=>[k,1])), ...S.findings}; return f; }

/* ---------- puanlama ---------- */
function score(){
  const f = effectiveFindings();
  return TOXIDROMES.map(t => {
    let s=0, plus=[], minus=[], max=0;
    for (const [id,w] of Object.entries(t.w)){
      if (w>0) max += w;
      const v = f[id]; if (!v) continue;
      const contrib = v>0 ? w : (w>0 ? -Math.min(w,2) : 0); // bulgunun yokluğu: pozitif ağırlıklı bulgu için küçük ceza
      if (!contrib) continue;
      s += contrib;
      const lbl = FINDING_BY_ID[id]?.label || id;
      (contrib>0 ? plus : minus).push({lbl, w:contrib, present:v>0});
    }
    const pct = max ? Math.max(0, Math.min(100, Math.round(100*s/max))) : 0;
    return { t, s, max, pct, plus:plus.sort((a,b)=>b.w-a.w), minus:minus.sort((a,b)=>a.w-b.w) };
  }).sort((a,b)=>b.s-a.s);
}

/* ---------- otomatik bulgular ---------- */
const VITAL_DEF = [
  { id:"hr",   label:"Nabız", unit:"/dk", eval:v=> v>130?["crit","Belirgin taşikardi"]: v>100?["warn","Taşikardi"]: v<40?["crit","Ağır bradikardi"]: v<60?["warn","Bradikardi"]:["ok","Normal"] },
  { id:"sbp",  label:"Sistolik TA", unit:"mmHg", eval:v=> v<80?["crit","Şok"]: v<90?["warn","Hipotansiyon"]: v>180?["crit","Ağır hipertansiyon"]: v>140?["warn","Hipertansiyon"]:["ok","Normal"] },
  { id:"dbp",  label:"Diyastolik TA", unit:"mmHg", eval:v=> v>110?["warn","Yüksek"]:["ok",""] },
  { id:"rr",   label:"Solunum", unit:"/dk", eval:v=> v<8?["crit","Apne eşiği"]: v<12?["warn","Bradipne"]: v>30?["crit","Belirgin takipne"]: v>20?["warn","Takipne"]:["ok","Normal"] },
  { id:"temp", label:"Isı", unit:"°C", eval:v=> v>40?["crit","Ağır hipertermi"]: v>38?["warn","Hipertermi"]: v<32?["crit","Ağır hipotermi"]: v<35?["warn","Hipotermi"]:["ok","Normal"] },
  { id:"spo2", label:"SpO₂", unit:"%", eval:v=> v<88?["crit","Ağır hipoksi"]: v<94?["warn","Hipoksi"]:["ok","Normal"] },
  { id:"glu",  label:"Glukoz", unit:"mg/dL", eval:v=> v<50?["crit","Ağır hipoglisemi"]: v<70?["warn","Hipoglisemi"]: v>300?["crit","Belirgin hiperglisemi"]: v>200?["warn","Hiperglisemi"]:["ok","Normal"] },
  { id:"etco2",label:"EtCO₂", unit:"mmHg", eval:v=> v>60?["crit","Ağır hiperkapni"]: v>50?["warn","Hiperkapni"]: v<30?["warn","Hipokapni"]:["ok","Normal"] }
];
function deriveAuto(){
  auto = {};
  const v = S.vitals, n = num;
  if (n(v.hr)!=null){ if (v.hr>100) auto.tachy=1; if (v.hr<60) auto.brady=1; }
  if (n(v.sbp)!=null){ if (v.sbp>140) auto.htn=1; if (v.sbp<90) auto.hypot=1; }
  if (n(v.rr)!=null){ if (v.rr>20) auto.tachypnea=1; if (v.rr<12) auto.bradypnea=1; }
  if (n(v.temp)!=null){ if (v.temp>38) auto.hyperth=1; if (v.temp<35) auto.hypoth=1; }
  if (n(v.spo2)!=null && v.spo2<94) auto.hypoxia=1;
  if (n(v.glu)!=null){ if (v.glu<70) auto.hypogly=1; if (v.glu>200) auto.hypergly=1; }
  if (n(v.etco2)!=null && v.etco2>50) auto.hypercap=1;
  const g = gcs(); if (g!=null && g<=8) auto.coma=1;
  // EKG
  const e = S.ecg;
  if (n(e.hr)!=null){ if (e.hr>100) auto.tachy=1; if (e.hr<60) auto.brady=1; }
  if (n(e.qrs)!=null){ if (e.qrs>=100) auto.qrswide=1; if (e.qrs>=160) auto.qrsvwide=1; }
  const q = qtc(); if (q && q.fridericia>500) auto.qtlong=1;
  if (n(e.avr)!=null && e.avr>=3) auto.avrR=1;
  if (n(e.avrrs)!=null && e.avrrs>0.7) auto.avrR=1;
  if (e.axis==="right") auto.raxis=1;
  if (e.rhythm==="Bidireksiyonel VT") auto.bidirVT=1;
  if (e.rhythm==="Atriyal taşikardi + blok") auto.atachblock=1;
  if (e.rhythm==="Tam AV blok") auto.avblock=1;
  if (e.rhythm==="Torsades"){ auto.torsades=1; auto.qtlong=1; }
  if (e.rhythm==="VT"||e.rhythm==="Geniş kompleks taşikardi") auto.ectopy=1;
  if (e.rhythm==="Sinüs bradikardisi"||e.rhythm==="Kavşak ritmi") auto.sinusbrady=1;
  if (e.rhythm==="Atriyal fibrilasyon") auto.irregular=1;
  const kk = n(e.k) ?? n(S.lab.k);
  if (kk!=null){ if (kk<3.5) auto.hypoK=1; if (kk>5.5) auto.hyperK=1; }
  // Lab
  const L = S.lab, ag = anionGap();
  if (ag && ag.ag>12 && n(L.hco3)!=null && L.hco3<22) auto.agacid=1;
  const og = osmGap(); if (og && og.gap>10) auto.osmgap=1;
  if (n(L.lac)!=null && L.lac>8) auto.lactate=1;
  if (n(L.ph)!=null && n(L.pco2)!=null && n(L.hco3)!=null && L.hco3<22 && L.pco2<35 && L.ph>=7.38) auto.respalk=1;
  if (n(L.ca)!=null && L.ca<1.1) auto.hypoCa=1;
  if (n(L.cr)!=null && L.cr>1.3) auto.aki=1;
  if (n(L.ck)!=null && L.ck>1000) auto.ckhigh=1;
  if (n(L.wbc)!=null && L.wbc>11) auto.leuko=1;
  if (n(L.methb)!=null && L.methb>3) auto.methb=1;
  if (n(L.cohb)!=null && L.cohb>5) auto.cohb=1;
  if (n(L.sali)!=null && L.sali>30) auto.salilevel=1;
  if (n(L.digi)!=null && L.digi>2) auto.digilevel=1;
  if (n(L.li)!=null && L.li>1.5) auto.lilevel=1;
  if (n(L.etoh)!=null && L.etoh>80) auto.etohlevel=1;
  if (n(L.alt)!=null && L.alt>100) auto.lfthigh=1;
  if (n(L.na)!=null && L.na<135) auto.hypoNa=1;
  const rm = rumack(); if (rm && rm.above) auto.apaplevel=1;
  if (n(L.glu)!=null && n(S.vitals.glu)==null){ if (L.glu<70) auto.hypogly=1; if (L.glu>200) auto.hypergly=1; }
}
function gcs(){ const {gcsE,gcsV,gcsM}=S.vitals; if(gcsE===""||gcsV===""||gcsM==="") return null; return +gcsE + +gcsV + +gcsM; }

/* ---------- hesaplar ---------- */
function qtc(){
  const qt=num(S.ecg.qt), hr=num(S.ecg.hr) ?? num(S.vitals.hr);
  if (qt==null||hr==null||hr<=0) return null;
  const rr = 60/hr;
  return { rr, bazett: qt/Math.sqrt(rr), fridericia: qt/Math.cbrt(rr), framingham: qt+154*(1-rr), hodges: qt+1.75*(hr-60) };
}
function anionGap(){
  const na=num(S.lab.na), cl=num(S.lab.cl), h=num(S.lab.hco3); if(na==null||cl==null||h==null) return null;
  const ag = na-cl-h, alb=num(S.lab.alb);
  const agc = alb!=null ? ag + 2.5*(4-alb) : null;
  const delta = (ag-12)/(24-h);
  const winter = 1.5*h+8;
  return { ag, agc, delta, winter };
}
function osmGap(){
  const osm=num(S.lab.osm), na=num(S.lab.na), glu=num(S.lab.glu), bun=num(S.lab.bun), et=num(S.lab.etoh)||0;
  if (osm==null||na==null||glu==null||bun==null) return null;
  const calc = 2*na + glu/18 + bun/2.8 + et/4.6;
  return { calc, gap: osm-calc };
}
function rumack(){
  const c=num(S.lab.apap), t=num(S.lab.apapt); if(c==null||t==null) return null;
  if (t<4||t>24) return { c, t, valid:false };
  const line = 150*Math.pow(2,-(t-4)/4), high = 300*Math.pow(2,-(t-4)/4);
  return { c, t, valid:true, line, high, above: c>=line, veryhigh: c>=high };
}

/* ---------- render: ray ---------- */
function renderRail(){
  const counts = { exam: Object.keys(S.findings).filter(id=>FINDING_BY_ID[id]?.group).length, qa: S.skipped.length?0:0 };
  $("#rail").innerHTML = VIEWS.map((v,i)=>`${i===6?'<div class="sep"></div>':''}<button type="button" data-view="${v.id}" class="${S.view===v.id?'active':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${v.icon}"/></svg>${v.label}${counts[v.id]?`<span class="cnt">${counts[v.id]}</span>`:''}</button>`).join("");
}
function showView(id){ S.view=id; $$(".view").forEach(v=>v.classList.toggle("active", v.dataset.view===id)); renderRail(); $("#main").scrollTop=0; if(id==="qa") renderQA(); if(id==="result") renderResult(); if(id==="ai") renderSummary(); }

/* ---------- render: etiket grupları ---------- */
function tagHTML(id){
  const f=FINDING_BY_ID[id]; const v=S.findings[id]; const a=auto[id];
  const cls = v>0?"on":v<0?"on neg":a?"on":"";
  return `<span class="tag ${cls}" data-f="${id}" title="${esc(f.q||'')}">${esc(f.label)}${a&&!v?'<span class="k">oto</span>':''}${v<0?'<span class="k">yok</span>':''}</span>`;
}
function renderTags(sel, ids){ $(sel).innerHTML = ids.map(tagHTML).join(""); }
function cycleTag(id){ const v=S.findings[id]||0; setFinding(id, v===0?1 : v===1?-1 : 0); }

/* ---------- render: vitaller ---------- */
function renderVitals(){
  const wrap=$("#vitals");
  if (!wrap.children.length){
    wrap.innerHTML = VITAL_DEF.map(d=>`<div class="vital" data-v="${d.id}"><label for="v_${d.id}">${d.label}</label><div class="row"><input id="v_${d.id}" type="number" inputmode="decimal" step="any"><span class="unit">${d.unit}</span></div><div class="st"></div></div>`).join("");
  }
  VITAL_DEF.forEach(d=>{
    const el=wrap.querySelector(`[data-v="${d.id}"]`), v=num(S.vitals[d.id]);
    const inp=el.querySelector("input"); if (document.activeElement!==inp) inp.value=S.vitals[d.id];
    el.classList.remove("ok","warn","crit"); const st=el.querySelector(".st");
    if (v==null){ st.textContent=""; return; }
    const [c,t]=d.eval(v); el.classList.add(c); st.textContent=t;
  });
  ["gcsE","gcsV","gcsM"].forEach(k=>{ $("#v_"+k).value=S.vitals[k]; });
  const g=gcs(); const items=[];
  if (g!=null) items.push(`<span class="pill ${g<=8?'crit':g<=12?'warn':'ok'}">GKS ${g}</span>`);
  if (num(S.vitals.sbp)!=null && num(S.vitals.hr)!=null) items.push(`<span class="pill neutral">Şok indeksi ${(S.vitals.hr/S.vitals.sbp).toFixed(2)}</span>`);
  Object.keys(auto).filter(id=>FINDING_BY_ID[id]?.cat==="vital"||id==="coma").forEach(id=>items.push(`<span class="pill info">${esc(FINDING_BY_ID[id].label)}</span>`));
  $("#vitalSummary").innerHTML = items.join("") || '<span class="small muted">Değer girildikçe türetilen bulgular burada listelenir.</span>';
  renderTags("#mentalTags", FINDINGS.filter(f=>f.cat==="mental"||(f.cat==="sx")||f.id==="dysarthria").map(f=>f.id));
}

/* ---------- render: vücut haritası ---------- */
function renderFigure(){
  const R = REGIONS[S.bodyView];
  const fig=$("#figure");
  const countFor = sp => (REGION_GROUPS[sp.id]||[]).reduce((n,g)=>n+FINDINGS.filter(f=>f.group===g && S.findings[f.id]>0).length,0);
  fig.innerHTML = `<img src="${R.img}" alt="Muayene figürü — ${S.bodyView==='front'?'ön':S.bodyView==='back'?'arka':'yüz'} görünüm" draggable="false">` +
    R.spots.map(sp=>{ const c=countFor(sp); return `<button type="button" class="hs ${c?'marked':''} ${S.region===sp.id?'sel':''}" style="left:${sp.x}%;top:${sp.y}%" data-r="${sp.id}" title="${esc(sp.label)}" aria-label="${esc(sp.label)}"><span class="n">${c}</span></button>`; }).join("");
  $$("#viewSwitch button").forEach(b=>b.classList.toggle("active", b.dataset.v===S.bodyView));
  renderRegionPanel();
  const marked = FINDINGS.filter(f=>f.group && S.findings[f.id]);
  $("#markedSummary").innerHTML = marked.length ? marked.map(f=>`<span class="tag ${S.findings[f.id]>0?'on':'on neg'}" data-f="${f.id}">${esc(f.label)}${S.findings[f.id]<0?'<span class="k">yok</span>':''}</span>`).join("") : '<span class="small muted">Henüz bulgu işaretlenmedi.</span>';
}
function renderRegionPanel(){
  const p=$("#regionPanel");
  if (!S.region){ p.innerHTML=`<h3><span class="dot"></span> Bölge seçin</h3><p class="small muted">Figürdeki bir noktaya tıklayın. Numaralar o bölgedeki pozitif bulgu sayısıdır.</p>`; return; }
  const allSpots=[...REGIONS.front.spots,...REGIONS.back.spots,...REGIONS.face.spots];
  const sp=allSpots.find(s=>s.id===S.region); const groups=REGION_GROUPS[S.region]||[];
  const list=FINDINGS.filter(f=>groups.includes(f.group));
  p.innerHTML = `<h3><span class="dot"></span> ${esc(sp.label)}</h3><div class="finding-list">` + list.map(f=>{
    const v=S.findings[f.id]||0;
    return `<div class="finding ${v>0?'on':v<0?'neg':''}"><div><div class="t">${esc(f.label)}</div><div class="s">${esc(f.q||'')}</div></div><div class="tri"><button type="button" class="y ${v>0?'on':''}" data-set="${f.id}:1">Var</button><button type="button" class="n ${v<0?'on':''}" data-set="${f.id}:-1">Yok</button><button type="button" data-set="${f.id}:0">—</button></div></div>`;
  }).join("") + `</div>`;
}

/* ---------- render: EKG ---------- */
function renderECG(){
  Object.keys(S.ecg).forEach(k=>{ const el=$("#e_"+k); if(el && document.activeElement!==el) el.value=S.ecg[k]; });
  renderTags("#ecgTags", ["brugada","avblock","scoop","bidirVT","ectopy","atachblock","peakedT","uwave","torsades","sinusbrady","stelev","irregular","raxis","avrR"]);
  const q=qtc(), out=$("#qtcOut");
  out.innerHTML = q ? `<dt>RR</dt><dd>${(q.rr*1000).toFixed(0)} ms</dd><dt>QTc Bazett</dt><dd>${q.bazett.toFixed(0)} ms</dd><dt>QTc Fridericia</dt><dd>${q.fridericia.toFixed(0)} ms</dd><dt>QTc Framingham</dt><dd>${q.framingham.toFixed(0)} ms</dd><dt>QTc Hodges</dt><dd>${q.hodges.toFixed(0)} ms</dd>` : `<dt class="muted">QT ve hız girin</dt><dd></dd>`;
  const flags=[], e=S.ecg, n=num;
  if (n(e.qrs)!=null){
    if (e.qrs>=160) flags.push(["crit","QRS ≥160 ms","Ventriküler aritmi riski ~%50 (TSA). NaHCO₃ bolus; lidokain/lipid hazır."]);
    else if (e.qrs>=100) flags.push(["warn","QRS ≥100 ms","Nöbet riski ~%26 (TSA). Na kanal blokajı düşün; NaHCO₃ 1-2 mEq/kg ve daralma yanıtı değerlendir. Hiperkalemiyi dışla."]);
    else flags.push(["ok","QRS dar","Na kanal blokajı için düşük olasılık (erken dönemde tekrar et)."]);
  }
  if (q){
    const qv=q.fridericia;
    if (qv>500) flags.push(["crit",`QTc ${qv.toFixed(0)} ms (Fridericia)`,"Torsades riski: K >4, Mg >2, Mg 2 g IV, QT uzatan ilaçları kes, overdrive pacing/izoproterenol hazır. Taşikardide Bazett QTc'yi abartır; Fridericia tercih."]);
    else if (qv>470) flags.push(["warn",`QTc ${qv.toFixed(0)} ms`,"Uzamış (erkek ≥470, kadın ≥480). Elektrolitleri düzelt, seri EKG."]);
  }
  if ((n(e.avr)!=null && e.avr>=3) || (n(e.avrrs)!=null && e.avrrs>0.7)) flags.push(["crit","aVR terminal R ≥3 mm / R:S >0,7","TSA toksisitesinde nöbet ve aritmi öngörücüsü."]);
  if (e.axis==="right") flags.push(["warn","Terminal sağ aks","Terminal 40 ms'de sağ aks deviasyonu (aVR'de R, I/aVL'de S) Na kanal blokajı lehine."]);
  if (S.findings.brugada>0) flags.push(["warn","Brugada paterni","Na kanal blokajında kötü prognoz; bikarbonat."]);
  const hr=n(e.hr)??n(S.vitals.hr);
  if (hr!=null && hr<50) flags.push(["warn","Bradikardi","BB/KKB/digoksin/klonidin/organofosfat/hiperkalemi? Atropin, pacing, HIE hazırlığı."]);
  if (e.rhythm==="Bidireksiyonel VT"||e.rhythm==="Atriyal taşikardi + blok") flags.push(["crit",e.rhythm,"Digoksin toksisitesi için yüksek özgüllük → Fab endikasyonu."]);
  if (e.rhythm==="Torsades") flags.push(["crit","Torsades de pointes","Mg 2 g IV, defibrilasyon (nabızsız), overdrive pacing."]);
  const kk=n(e.k)??n(S.lab.k);
  if (kk!=null && kk>5.5) flags.push(["crit",`K ${kk} mmol/L`,"Akut digoksinde K >5-5,5 → Fab endikasyonu ve mortalite öngörücüsü. Kalsiyum digoksinde tartışmalı."]);
  if (kk!=null && kk<3.5) flags.push(["warn",`K ${kk} mmol/L`,"Hipokalemi: QT uzaması/torsades riski; kronik digoksin toksisitesini kolaylaştırır."]);
  if (S.findings.scoop>0) flags.push(["info","Digoksin etkisi","Çukur ST tek başına toksisite göstermez."]);
  $("#ecgFlags").innerHTML = flags.length ? flags.map(f=>`<div class="flag ${f[0]}"><b>${esc(f[1])}</b><span>${esc(f[2])}</span></div>`).join("") : '<div class="flag"><b>Bayrak yok</b><span>Ölçümleri girin.</span></div>';
}

/* ---------- render: lab ---------- */
function renderLab(){
  Object.keys(S.lab).forEach(k=>{ const el=$("#l_"+k)||( k==="flevel"?$("#f_level"): k==="fmg"?$("#f_mg"):null); if(el && document.activeElement!==el) el.value=S.lab[k]; });
  const ag=anionGap(), o=$("#agOut");
  if (ag){
    const parts=[`<div class="big">AG ${ag.ag.toFixed(0)} <span class="sub">mEq/L</span></div>`];
    parts.push(`<div class="sub">${ag.ag>12?'Artmış anyon açığı':'Normal anyon açığı (≤12)'}${ag.agc!=null?` · albümin düzeltilmiş ${ag.agc.toFixed(0)}`:''}</div>`);
    if (num(S.lab.hco3)<24 && ag.ag>12) parts.push(`<div class="sub">Delta oranı ${isFinite(ag.delta)?ag.delta.toFixed(2):'—'} → ${ag.delta<0.4?'hiperkloremik asidoz baskın':ag.delta<0.8?'karma (AG + hiperkloremik)':ag.delta<=2?'saf AG asidoz':'eşlik eden metabolik alkaloz'}</div>`);
    if (num(S.lab.hco3)<22) parts.push(`<div class="sub">Winter: beklenen pCO₂ ${ag.winter.toFixed(0)} ± 2${num(S.lab.pco2)!=null?` · ölçülen ${S.lab.pco2} → ${S.lab.pco2<ag.winter-2?'eşlik eden respiratuvar ALKALOZ (salisilat?)':S.lab.pco2>ag.winter+2?'eşlik eden respiratuvar asidoz (yetersiz kompansasyon)':'uygun kompansasyon'}`:''}</div>`);
    if (ag.ag>12 && num(S.lab.hco3)<22) parts.push(`<div class="sub"><b>GOLD MARK</b>: glikoller, oksoprolin, L-laktat, D-laktat, metanol, aspirin, renal, ketoasidoz. Laktat ${num(S.lab.lac)!=null?S.lab.lac:'?'}.</div>`);
    o.innerHTML=parts.join("");
  } else o.innerHTML='<span class="sub">Na, Cl ve HCO₃ girin.</span>';
  const og=osmGap(), oo=$("#osmOut");
  if (og){
    const g=og.gap;
    let html=`<div class="big">Ozmolar gap ${g.toFixed(0)}</div><div class="sub">Hesaplanan ${og.calc.toFixed(0)} = 2·Na + glukoz/18 + BUN/2,8 + etanol/4,6 · ${g>10?'ARTMIŞ (>10): toksik alkol, ağır alkol, keton, laktat, propilen glikol, mannitol':'normal (−10 ile +10); normal gap toksik alkolü DIŞLAMAZ (geç dönem)'}</div>`;
    if (g>10) html+=`<div class="sub" style="margin-top:6px">Gap'in tamamı tek ajana bağlıysa tahmini düzey (mg/dL): <b>metanol ${(g*3.2).toFixed(0)}</b> · <b>etilen glikol ${(g*6.2).toFixed(0)}</b> · izopropanol ${(g*6.0).toFixed(0)} · etanol ${(g*4.6).toFixed(0)}. Fomepizol eşiği: metanol/EG ≥20-25 mg/dL veya gap >10 + şüphe.</div>`;
    oo.innerHTML=html;
  } else oo.innerHTML='<span class="sub">Ölçülen ozmolalite, Na, glukoz ve BUN girin.</span>';
  drawRumack();
  const rm=rumack(), ao=$("#apapOut");
  if (rm){
    if (!rm.valid) ao.innerHTML=`<div class="sub">Nomogram yalnız 4-24 saat için geçerli. &lt;4 saatte 4. saat düzeyini bekle; &gt;24 saatte düzey + ALT ile karar ver (ölçülebilir düzey veya ALT yüksekse NAC).</div>`;
    else ao.innerHTML=`<div class="big ${rm.above?'':''}" style="color:${rm.above?'var(--crit)':'var(--ok)'}">${rm.above?'Çizginin ÜSTÜNDE → NAC başla':'Çizginin altında'}</div><div class="sub">${rm.t} saatte tedavi çizgisi ${rm.line.toFixed(0)} µg/mL (150 µg/mL @4 s, t½ 4 s; özgün 'olası hepatotoksisite' çizgisi 200). ${rm.veryhigh?'<b>Yüksek risk çizgisi (300) üstünde:</b> uzatılmış NAC / üçüncü torbada doz artışı düşün.':''} Alım saatinde belirsizlik varsa en erken olasılığı kullan.</div>`;
  } else ao.innerHTML='<span class="sub">Düzey ve zamanı girin. Tek akut alım için geçerlidir; kademeli/kronik alımda ALT ve düzeye göre karar ver.</span>';
  // düzeyler
  const L=S.lab, lv=[];
  if (num(L.sali)!=null) lv.push(`<span class="pill ${L.sali>=90?'crit':L.sali>=60?'warn':L.sali>30?'warn':'ok'}">Salisilat ${L.sali} mg/dL — ${L.sali>=100?'HD endikasyonu (akut)':L.sali>=90?'HD (böbrek bozukluğunda) / kronikte >60':L.sali>=60?'kronikse HD endikasyonu; akutta alkalinizasyon':L.sali>30?'toksik aralık, alkalinizasyon':'terapötik'}</span>`);
  if (num(L.digi)!=null) lv.push(`<span class="pill ${L.digi>2?'warn':'ok'}">Digoksin ${L.digi} ng/mL ${L.digi>2?'— yüksek (kliniğe göre Fab)':''}</span>`);
  if (num(L.li)!=null) lv.push(`<span class="pill ${L.li>=4?'crit':L.li>1.5?'warn':'ok'}">Lityum ${L.li} mmol/L ${L.li>=4?'— HD endikasyonu (özellikle böbrek bozukluğunda); >5 kesin':L.li>1.5?'— toksik':''}</span>`);
  if (num(L.methb)!=null) lv.push(`<span class="pill ${L.methb>=30?'crit':L.methb>=20?'warn':L.methb>3?'warn':'ok'}">MetHb %${L.methb} ${L.methb>=30?'— acil: metilen mavisi':L.methb>=20?'— semptomatikse metilen mavisi':L.methb>3?'— yüksek; hipoksi semptomu varsa tedavi':''}</span>`);
  if (num(L.cohb)!=null) lv.push(`<span class="pill ${L.cohb>=25?'crit':L.cohb>=10?'warn':'ok'}">COHb %${L.cohb} ${L.cohb>=25?'— HBO düşün':L.cohb>=10?'— %100 O₂':''}</span>`);
  if (num(L.ck)!=null) lv.push(`<span class="pill ${L.ck>5000?'crit':L.ck>1000?'warn':'ok'}">CK ${L.ck} ${L.ck>5000?'— ağır rabdomiyoliz':L.ck>1000?'— rabdomiyoliz':''}</span>`);
  if (num(L.alt)!=null) lv.push(`<span class="pill ${L.alt>1000?'crit':L.alt>100?'warn':'ok'}">ALT ${L.alt}</span>`);
  $("#levelsOut").innerHTML = lv.join(" ") || '<span class="sub">Düzeyler eşiklerle yorumlanır.</span>';
  renderTags("#labTags", ["oxalate","ketosis","spo2gap","chocblood","venoushyperox","hypoCa","aki","leuko","lfthigh","hypoNa","hypoK","hyperK","respalk","lactate","agacid","osmgap","apaplevel"]);
  // Fab
  const wt=num(S.patient.wt), fl=num(L.flevel), fm=num(L.fmg), fo=[];
  if (fl!=null && wt!=null) fo.push(`Düzeye göre: ${Math.ceil(fl*wt/100)} flakon (${fl} × ${wt} / 100 = ${(fl*wt/100).toFixed(1)})`);
  if (fm!=null) fo.push(`Alınan doza göre: ${Math.ceil(fm*0.8/0.5)} flakon (${fm} mg × 0,8 / 0,5)`);
  fo.push("Ampirik (miktar bilinmiyor): görece stabil 2 flakon, yanıt yetersizse 1-2 tekrar; arrest yakın/arrest 10 flakon. Endikasyon: hayatı tehdit eden aritmi, K >5-5,5 (akut), hemodinamik instabilite, uç organ hasarı.");
  $("#fabOut").innerHTML = fo.map(x=>`<div class="sub">${esc(x)}</div>`).join("");
  // hızlı doz
  const qd=[];
  if (wt!=null){
    qd.push(`<b>NAC IV 21 s</b>: ${Math.round(150*wt)} mg/60 dk → ${Math.round(50*wt)} mg/4 s → ${Math.round(100*wt)} mg/16 s`);
    qd.push(`<b>NaHCO₃</b>: ${Math.round(wt)}-${Math.round(2*wt)} mEq bolus`);
    qd.push(`<b>Lipid %20</b>: ${Math.round(1.5*wt)} mL bolus, ${(0.25*wt).toFixed(0)} mL/dk`);
    qd.push(`<b>HIE</b>: ${Math.round(wt)} U bolus + ${Math.round(wt)} U/s (→${Math.round(10*wt)} U/s), dekstroz ${Math.round(0.5*wt)} g bolus`);
    qd.push(`<b>Fomepizol</b>: ${Math.round(15*wt)} mg yükleme, ${Math.round(10*wt)} mg/12 s`);
    qd.push(`<b>Metilen mavisi</b>: ${Math.round(wt)}-${Math.round(2*wt)} mg (${(0.1*wt).toFixed(0)}-${(0.2*wt).toFixed(0)} mL %1)`);
    qd.push(`<b>Pralidoksim</b>: ${Math.round(30*wt)} mg yükleme (maks 2 g), ${Math.round(8*wt)} mg/s`);
    qd.push(`<b>Dantrolen</b>: ${(2.5*wt).toFixed(0)} mg IV`);
    qd.push(`<b>Aktif kömür</b>: ${Math.min(50,Math.round(wt))} g`);
  } else qd.push('<span class="sub">Kilo girildiğinde kilo bazlı dozlar burada görünür.</span>');
  $("#quickDose").innerHTML = qd.map(x=>`<div class="sub">${x}</div>`).join("");
}
function drawRumack(){
  const c=$("#rmCanvas"); if(!c) return; const ctx=c.getContext("2d"); const W=c.width,H=c.height;
  const cs=getComputedStyle(document.documentElement); const fg=cs.getPropertyValue("--fg-2").trim()||"#555", line=cs.getPropertyValue("--line").trim()||"#ccc", crit=cs.getPropertyValue("--crit").trim()||"#c00", warn=cs.getPropertyValue("--warn").trim()||"#b70", pin=cs.getPropertyValue("--pin").trim()||"#d70";
  ctx.clearRect(0,0,W,H);
  const px=54,py=14,pw=W-px-14,ph=H-py-36;
  const xs=t=>px+pw*(t-4)/20, ys=v=>py+ph*(1-(Math.log10(v)-Math.log10(5))/(Math.log10(600)-Math.log10(5)));
  ctx.strokeStyle=line; ctx.lineWidth=1; ctx.font="11px JetBrains Mono, monospace"; ctx.fillStyle=fg;
  [5,10,20,50,100,150,200,300,500].forEach(v=>{ ctx.beginPath(); ctx.moveTo(px,ys(v)); ctx.lineTo(px+pw,ys(v)); ctx.stroke(); ctx.textAlign="right"; ctx.fillText(v,px-6,ys(v)+4); });
  [4,8,12,16,20,24].forEach(t=>{ ctx.beginPath(); ctx.moveTo(xs(t),py); ctx.lineTo(xs(t),py+ph); ctx.stroke(); ctx.textAlign="center"; ctx.fillText(t+" s",xs(t),py+ph+16); });
  ctx.textAlign="left"; ctx.fillText("µg/mL",px-50,py+8);
  const drawLine=(k,col)=>{ ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath(); for(let t=4;t<=24;t+=0.5){ const v=k*Math.pow(2,-(t-4)/4); const x=xs(t),y=ys(v); t===4?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke(); };
  drawLine(300,warn); drawLine(150,crit);
  ctx.fillStyle=crit; ctx.fillText("150 (tedavi çizgisi)",xs(4)+6,ys(150)-6); ctx.fillStyle=warn; ctx.fillText("300 (yüksek risk)",xs(4)+6,ys(300)-6);
  const rm=rumack(); if(rm&&rm.valid){ const x=xs(rm.t), y=ys(Math.max(5,Math.min(600,rm.c))); ctx.fillStyle=pin; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill(); ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.stroke(); }
}

/* ---------- render: sıralama ---------- */
function renderRank(){
  const sc=score(); const any=Object.keys(effectiveFindings()).length;
  const wrap=$("#rank");
  if (!any){ wrap.innerHTML='<div class="empty">Vital, muayene, EKG veya lab bulgusu girildikçe sıralama burada oluşur.</div>'; }
  else wrap.innerHTML = sc.slice(0,8).map((r,i)=>`<div class="rk ${i===0&&r.s>0?'top':''} ${r.s<=0?'':''}" data-t="${r.t.id}" title="${esc(r.t.classic)}"><div class="h"><b>${esc(r.t.name)}</b><span class="sc">${r.s>0?'+':''}${r.s}</span></div><div class="bar"><i style="width:${r.pct}%"></i></div><div class="why">${r.plus.slice(0,4).map(p=>`<span class="plus">+${p.w} ${esc(p.lbl)}</span>`).join(" · ")}${r.minus.length?' · '+r.minus.slice(0,2).map(m=>`<span class="minus">${m.w} ${esc(m.lbl)}${m.present?'':' (yok)'}</span>`).join(" · "):''}</div></div>`).join("");
  // uyarılar
  const al=[], f=effectiveFindings(), v=S.vitals, n=num;
  if (f.qrswide) al.push(["crit","Geniş QRS → NaHCO₃"]);
  if (f.qtlong) al.push(["crit","QTc >500 → Mg, K/Mg düzelt"]);
  if (f.hypogly) al.push(["crit","Hipoglisemi → dekstroz"]);
  if (f.bradypnea||f.hypoxia) al.push(["crit","Ventilasyon yetersiz → havayolu, nalokson?"]);
  if (n(v.temp)!=null && v.temp>40) al.push(["crit","Isı >40 °C → agresif soğutma, sedasyon"]);
  if (f.hypot && f.brady) al.push(["crit","Bradikardi + hipotansiyon → Ca, glukagon, HIE, pacing"]);
  if (f.lactate && !f.hypoxia) al.push(["warn","Hipoksi olmadan laktat yüksek → siyanür/CO/metformin?"]);
  if (f.osmgap && f.agacid) al.push(["crit","Ozmolar gap + AG asidoz → fomepizol"]);
  if (f.spo2gap||f.chocblood||f.methb) al.push(["crit","MetHb → metilen mavisi"]);
  if (f.apaplevel) al.push(["crit","Parasetamol çizgi üstü → NAC"]);
  if (f.refractseiz) al.push(["crit","Dirençli nöbet → piridoksin (INH?), propofol"]);
  if ((f.clonus||f.sponclonus) && f.hyperth) al.push(["warn","Klonus + hipertermi → serotonin sendromu; soğutma, benzodiazepin"]);
  if (f.leadpipe && f.hyperth) al.push(["warn","Rijidite + hipertermi → NMS/MH; CK, dantrolen"]);
  if (f.bronchorr) al.push(["crit","Bronkore → atropin, dekontaminasyon"]);
  if (f.hyperK && (f.h_digi||f.digilevel)) al.push(["crit","Digoksin + hiperkalemi → Fab"]);
  $("#alerts").innerHTML = al.length ? al.map(a=>`<div class="flag ${a[0]}"><b>${esc(a[1])}</b><span></span></div>`).join("") : '<div class="empty">Kritik uyarı yok.</div>';
  $("#findingChip").innerHTML=`<b>${Object.keys(S.findings).length}</b> bulgu${Object.keys(auto).length?` · <b>${Object.keys(auto).length}</b> otomatik`:''}`;
  $("#patientChip").textContent = S.patient.name || (S.patient.agent ? `Ajan: ${S.patient.agent}` : "Yeni hasta");
}

/* ---------- render: rehberli ayrım ---------- */
function nextQuestion(){
  const sc=score().filter(r=>r.s>0); const f=effectiveFindings();
  const cands = sc.length>=2 ? sc.slice(0,4) : (sc.length===1 ? [sc[0], ...score().slice(1,4)] : score().slice(0,4));
  const answered = new Set([...Object.keys(f), ...S.skipped]);
  let best=null, bestGain=0;
  for (const fd of FINDINGS){
    if (!fd.q || answered.has(fd.id)) continue;
    if (fd.cat==="vital"||fd.cat==="ecg"||fd.cat==="lab") { /* ölçümler ayrı sekmelerden gelir ama sorulabilir */ }
    const ws = cands.map(c=>c.t.w[fd.id]||0);
    const spread = Math.max(...ws)-Math.min(...ws);
    const top2 = ws.length>1 ? Math.abs(ws[0]-ws[1]) : spread;
    const relevance = ws.reduce((a,b)=>a+Math.abs(b),0);
    // yatak başı sorular önce: öykü ve muayene; ölçüm gerektiren lab/EKG/vital sorular geriye
    const penalty = fd.cat==="lab"?-4 : fd.cat==="ecg"?-3 : fd.cat==="vital"?-2.5 : 0;
    const gain = top2*3 + spread*1.5 + relevance*0.3 + (fd.cat==="hx"?0.5:0) + penalty;
    if (gain>bestGain){ bestGain=gain; best=fd; }
  }
  return best ? { fd:best, cands } : null;
}
function renderQA(){
  const q=nextQuestion(), card=$("#qcard");
  if (!q){ card.innerHTML=`<h4>Rehberli ayrım</h4><div class="q">Ayırt edici soru kalmadı.</div><p class="why">Daha fazla bulgu girin veya atlananları sıfırlayın.</p>`; }
  else {
    const top=q.cands.map(c=>c.t); const fd=q.fd;
    const favors = top.filter(t=>(t.w[fd.id]||0)>0).map(t=>`${t.short} (+${t.w[fd.id]})`);
    const against = top.filter(t=>(t.w[fd.id]||0)<0).map(t=>`${t.short} (${t.w[fd.id]})`);
    card.innerHTML=`<h4>Ayırt edilen: ${top.map(t=>esc(t.short)).join(" · ")}</h4><div class="q">${esc(fd.q)}</div><p class="why"><b>Varsa</b> lehine: ${favors.length?esc(favors.join(", ")):"—"}. <b>Aleyhine</b>: ${against.length?esc(against.join(", ")):"—"}.</p><div class="ans"><button type="button" class="y" data-a="${fd.id}:1">Var / Evet</button><button type="button" class="n" data-a="${fd.id}:-1">Yok / Hayır</button><button type="button" data-a="${fd.id}:skip">Bilinmiyor, atla</button></div>`;
  }
  const hist=[...Object.entries(S.findings)].reverse().slice(0,30);
  $("#qhist").innerHTML = hist.length ? hist.map(([id,v])=>`<div><span>${esc(FINDING_BY_ID[id]?.label||id)}</span><b style="color:${v>0?'var(--pin)':'var(--fg-2)'}">${v>0?'var':'yok'}</b></div>`).join("") : '<span class="small muted">Henüz yanıt yok.</span>';
  $("#discTable").innerHTML = DISCRIMINATORS.map(d=>`<tr><td><b>${esc(d.pair)}</b></td><td>${esc(d.key)}</td></tr>`).join("");
}

/* ---------- render: sonuç ---------- */
function renderResult(){
  const sc=score(), wrap=$("#resultBody");
  const top=sc.filter(r=>r.s>0).slice(0,3);
  if (!top.length){ wrap.innerHTML='<div class="card"><p class="muted">Henüz yeterli bulgu yok. Vital, muayene ve EKG verilerini girin.</p></div>'; }
  else wrap.innerHTML = top.map((r,i)=>`<div class="card" style="border-left:5px solid ${r.t.color}"><h3>${i+1}. ${esc(r.t.name)} <span class="pill ${i===0?'crit':'neutral'}" style="margin-left:6px">${r.s>0?'+':''}${r.s} puan · ${r.pct}%</span></h3>
    <p class="small"><b>Ajanlar:</b> ${esc(r.t.agents)}</p>
    <p class="small" style="margin-top:4px"><b>Klasik tablo:</b> ${esc(r.t.classic)}</p>
    <div class="grid g2" style="margin-top:10px">
      <div><h4>Destekleyen</h4><div class="tags" style="margin-top:6px">${r.plus.map(p=>`<span class="tag on">+${p.w} ${esc(p.lbl)}</span>`).join("")||'<span class="small muted">—</span>'}</div></div>
      <div><h4>Aleyhine</h4><div class="tags" style="margin-top:6px">${r.minus.map(m=>`<span class="tag on neg">${m.w} ${esc(m.lbl)}${m.present?'':' (yok)'}</span>`).join("")||'<span class="small muted">—</span>'}</div></div>
    </div>
    <div class="notice" style="margin-top:12px"><b>Yönetim:</b> ${esc(r.t.mgmt)}</div></div>`).join("") +
    (sc.length>3 ? `<div class="card"><h3>Diğer adaylar</h3><div class="tags">${sc.slice(3,10).map(r=>`<span class="tag" data-t="${r.t.id}">${esc(r.t.name)} <span class="k">${r.s>0?'+':''}${r.s}</span></span>`).join("")}</div></div>`:"");
  const table=$("#toxTable"); const topIds=new Set(top.map(r=>r.t.name));
  table.innerHTML = `<thead><tr>${TOX_TABLE[0].map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${TOX_TABLE.slice(1).map(row=>`<tr class="${[...topIds].some(n=>n.toLowerCase().startsWith(row[0].toLowerCase().split(' ')[0]))?'hl':''}">${row.map((c,i)=>`<td>${i===0?'<b>'+esc(c)+'</b>':esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}

/* ---------- render: antidotlar ---------- */
function renderAnti(){
  const q=($("#antiFilter").value||"").toLowerCase().trim(), wt=num(S.patient.wt);
  const list=ANTIDOTES.filter(a=>!q || (a.name+" "+a.tox+" "+a.dose).toLowerCase().includes(q));
  $("#antiList").innerHTML = list.map(a=>{
    let kg="";
    if (wt!=null && a.perkg){
      const p=a.perkg, parts=[];
      if (p.load!=null){ let d=p.load*wt; if(p.max) d=Math.min(d,p.max); parts.push(`yükleme ≈ <b>${d%1?d.toFixed(1):d}</b> ${p.unit}${p.range?` (${p.range} ${p.unit}/kg)`:''}`); }
      if (p.rate!=null) parts.push(`idame ≈ <b>${(p.rate*wt)%1?(p.rate*wt).toFixed(1):p.rate*wt}</b> ${p.rateUnit}`);
      kg=`<div class="note" style="color:var(--accent)">${wt} kg için: ${parts.join(" · ")}</div>`;
    }
    return `<div class="card"><h3>${esc(a.name)}<span class="pill info">${esc(a.tox)}</span></h3><div class="dose">${esc(a.dose)}</div>${kg}<div class="note">${esc(a.note)}</div></div>`;
  }).join("") || '<p class="muted">Eşleşen antidot yok.</p>';
}

/* ---------- vaka özeti & AI ---------- */
function caseSummary(){
  const p=S.patient, v=S.vitals, e=S.ecg, L=S.lab, f=effectiveFindings();
  const line=[];
  line.push(`HASTA: ${p.age||'?'} yaş ${p.sex==='E'?'erkek':p.sex==='K'?'kadın':''}${p.wt?`, ${p.wt} kg`:''}.`);
  if (p.agent||p.time||p.route||p.intent) line.push(`MARUZİYET: ${p.agent||'bilinmiyor'}${p.time?`, ${p.time} saat önce`:''}${p.route?`, ${p.route}`:''}${p.intent?`, ${p.intent}`:''}.`);
  if (p.meds) line.push(`İLAÇLAR: ${p.meds}.`); if (p.hx) line.push(`ÖYKÜ: ${p.hx}.`);
  const vit=[["Nabız",v.hr,"/dk"],["TA",v.sbp&&`${v.sbp}/${v.dbp||'?'}`,"mmHg"],["SS",v.rr,"/dk"],["Isı",v.temp,"°C"],["SpO₂",v.spo2,"%"],["Glukoz",v.glu,"mg/dL"],["EtCO₂",v.etco2,"mmHg"]].filter(x=>x[1]).map(x=>`${x[0]} ${x[1]} ${x[2]}`);
  const g=gcs(); if (g!=null) vit.push(`GKS ${g} (E${v.gcsE}V${v.gcsV}M${v.gcsM})`);
  if (vit.length) line.push(`VİTALLER: ${vit.join(", ")}.`);
  const pos=Object.entries(f).filter(([id,x])=>x>0).map(([id])=>FINDING_BY_ID[id]?.label||id);
  const neg=Object.entries(S.findings).filter(([id,x])=>x<0).map(([id])=>FINDING_BY_ID[id]?.label||id);
  if (pos.length) line.push(`BULGULAR (VAR): ${pos.join("; ")}.`);
  if (neg.length) line.push(`BULGULAR (YOK): ${neg.join("; ")}.`);
  const ek=[["Hız",e.hr],["Ritim",e.rhythm],["PR",e.pr&&e.pr+" ms"],["QRS",e.qrs&&e.qrs+" ms"],["QT",e.qt&&e.qt+" ms"],["aVR R",e.avr&&e.avr+" mm"],["Terminal aks",e.axis]].filter(x=>x[1]).map(x=>`${x[0]} ${x[1]}`);
  const q=qtc(); if(q) ek.push(`QTc(F) ${q.fridericia.toFixed(0)} ms`);
  if (ek.length) line.push(`EKG: ${ek.join(", ")}.`);
  const lab=[["Na",L.na],["Cl",L.cl],["HCO₃",L.hco3],["pH",L.ph],["pCO₂",L.pco2],["Laktat",L.lac],["K",L.k||e.k],["iCa",L.ca],["Ozm",L.osm],["Glukoz",L.glu],["BUN",L.bun],["Etanol",L.etoh],["Parasetamol",L.apap&&`${L.apap} µg/mL @${L.apapt||'?'} s`],["Salisilat",L.sali],["Digoksin",L.digi],["Lityum",L.li],["MetHb",L.methb&&L.methb+"%"],["COHb",L.cohb&&L.cohb+"%"],["CK",L.ck],["Kreatinin",L.cr],["ALT",L.alt],["WBC",L.wbc]].filter(x=>x[1]).map(x=>`${x[0]} ${x[1]}`);
  const ag=anionGap(); if(ag) lab.push(`AG ${ag.ag.toFixed(0)}`); const og=osmGap(); if(og) lab.push(`ozmolar gap ${og.gap.toFixed(0)}`);
  if (lab.length) line.push(`LAB: ${lab.join(", ")}.`);
  const sc=score().filter(r=>r.s>0).slice(0,4);
  if (sc.length) line.push(`PUSULA SIRALAMASI: ${sc.map(r=>`${r.t.name} (${r.s})`).join(" > ")}.`);
  return line.join("\n");
}
function renderSummary(){ $("#caseSummary").textContent = caseSummary() || "Henüz veri yok."; }

let sampleFn=null, aiCtl=null;
(async()=>{ try{ if(window.claude?.use){ sampleFn = await window.claude.use("sample"); } }catch(e){ sampleFn=null; } updateProvider(); })();
function updateProvider(){
  const sel=$("#aiProvider"); const local = location.protocol==="file:" || !window.claude;
  if (!sampleFn && sel.value==="claude" && local) sel.value="gemini";
  $("#geminiCfg").hidden = sel.value!=="gemini";
  const st=$("#aiStatus");
  if (sel.value==="claude") st.textContent = sampleFn ? "Claude hazır: yanıt bu sayfayı açan kişinin Claude kullanımından düşer." : "Claude yalnız claude.ai artifact görüntüleyicisinde kullanılabilir. Gemini için sağlayıcıyı değiştirin.";
  else st.textContent = window.claude ? "Not: claude.ai artifact sandbox'ı dış API çağrısını engeller; Gemini için HTML dosyasını bilgisayarınızda açın." : "Anahtar yalnız bu tarayıcıda saklanır ve doğrudan Google'a gönderilir.";
}
const AI_RULES = `Sen bir acil tıp ve klinik toksikoloji uzmanısın. Aşağıdaki vaka özetine göre Türkçe, yapılandırılmış ve kısa yanıt ver: (1) En olası toksidrom(lar) ve gerekçe, (2) Ayırıcı tanı ve ayrımı netleştirecek bulgu/tetkikler, (3) İlk 1 saatte öncelikli yönetim adımları (doz aralıklarıyla, erişkin), (4) Tuzaklar ve izlem. Emin olmadığın yerde belirt. Bu bir karar destek aracıdır; nihai kararın klinisyene ait olduğunu bir cümleyle hatırlat.`;
async function ask(){
  const out=$("#aiOut"), btn=$("#btnAsk"), stop=$("#btnStop"); const prompt = AI_RULES + "\n\nVAKA:\n" + caseSummary() + "\n\nSORU: " + $("#aiQ").value.trim();
  btn.disabled=true; stop.disabled=false; out.textContent="Düşünüyor…"; aiCtl=new AbortController();
  try{
    if ($("#aiProvider").value==="claude"){
      if (!sampleFn) throw {code:"unavailable", message:"Claude bu ortamda kullanılamıyor."};
      const r = await sampleFn(prompt, { signal:aiCtl.signal, onText:({text})=>{ out.textContent=text; }, cache:false });
      out.textContent=r.text; if (r.truncated) out.textContent+="\n\n[Yanıt kesildi]";
    } else {
      const key=$("#geminiKey").value.trim(), model=$("#geminiModel").value.trim()||"gemini-2.5-flash";
      if (!key) throw {code:"nokey", message:"Gemini API anahtarı girin."};
      store.set("tp_gemini_key", key); store.set("tp_gemini_model", model);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, { method:"POST", signal:aiCtl.signal, headers:{"Content-Type":"application/json","x-goog-api-key":key}, body: JSON.stringify({ contents:[{role:"user",parts:[{text:prompt}]}], generationConfig:{ temperature:0.3 } }) });
      if (!res.ok){ const t=await res.text(); throw {code:"http", message:`Gemini ${res.status}: ${t.slice(0,300)}`}; }
      const reader=res.body.getReader(), dec=new TextDecoder(); let buf="", acc="";
      while(true){ const {value,done}=await reader.read(); if(done) break; buf+=dec.decode(value,{stream:true});
        let idx; while((idx=buf.indexOf("\n\n"))>=0){ const chunk=buf.slice(0,idx); buf=buf.slice(idx+2);
          chunk.split("\n").filter(l=>l.startsWith("data:")).forEach(l=>{ try{ const j=JSON.parse(l.slice(5).trim()); const t=j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||""; acc+=t; out.textContent=acc; }catch(e){} }); } }
      if (!acc) out.textContent="Boş yanıt (model adını kontrol edin).";
    }
  }catch(e){
    if (e?.code==="cancelled"||e?.name==="AbortError") out.textContent=(e.text||out.textContent)+"\n\n[Durduruldu]";
    else if (e?.code==="not_granted") out.textContent="Claude erişimine izin verilmedi.";
    else if (e?.code==="rate_limited") out.textContent="Çok sık istek; biraz bekleyin.";
    else out.textContent="Hata: "+(e?.message||e);
  } finally { btn.disabled=false; stop.disabled=true; aiCtl=null; }
}

/* ---------- kayıt ---------- */
function records(){ return store.get("tp_records", []); }
function saveCase(){
  if (!S.id){ S.id="c"+Date.now().toString(36); S.created=new Date().toISOString(); }
  S.updated=new Date().toISOString();
  const r=records().filter(x=>x.id!==S.id); r.unshift(JSON.parse(JSON.stringify(S))); store.set("tp_records", r.slice(0,60)); renderRecords(); toast("Vaka kaydedildi");
}
function renderRecords(){
  const r=records(), w=$("#records");
  w.innerHTML = r.length ? r.map(c=>`<div class="rec"><div><b>${esc(c.patient.name||c.patient.agent||'İsimsiz vaka')}</b><div class="m">${new Date(c.updated||c.created).toLocaleString("tr-TR")} · ${Object.keys(c.findings||{}).length} bulgu${c.patient.age?` · ${c.patient.age} y`:''}</div></div><div style="display:flex;gap:6px"><button type="button" class="btn sm" data-load="${c.id}">Aç</button><button type="button" class="btn sm danger" data-del="${c.id}">Sil</button></div></div>`).join("") : '<span class="small muted">Kayıtlı vaka yok.</span>';
}
function loadCase(c){ S={...blank(),...JSON.parse(JSON.stringify(c))}; S.view="patient"; syncInputs(); refresh(); showView("patient"); toast("Vaka yüklendi"); }
function syncInputs(){
  Object.keys(S.patient).forEach(k=>{ const el=$("#p_"+k); if(el) el.value=S.patient[k]; });
  renderVitals(); renderECG(); renderLab();
}

/* ---------- ana yenileme ---------- */
function refresh(){
  deriveAuto();
  renderRail(); renderRank();
  const v=S.view;
  if (v==="patient"){ renderTags("#hxTags", FINDINGS.filter(f=>f.cat==="hx").map(f=>f.id)); }
  if (v==="vitals") renderVitals();
  if (v==="exam") renderFigure();
  if (v==="ecg") renderECG();
  if (v==="lab") renderLab();
  if (v==="qa") renderQA();
  if (v==="result") renderResult();
  if (v==="anti") renderAnti();
  if (v==="ai") renderSummary();
  store.set("tp_draft", S);
}

/* ---------- olaylar ---------- */
function bind(){
  document.addEventListener("click", e=>{
    const t=e.target.closest("[data-view]"); if (t && t.closest("#rail")){ showView(t.dataset.view); refresh(); return; }
    const tag=e.target.closest(".tag[data-f]"); if (tag){ cycleTag(tag.dataset.f); return; }
    const set=e.target.closest("[data-set]"); if (set){ const [id,v]=set.dataset.set.split(":"); setFinding(id,+v); return; }
    const hs=e.target.closest(".hs[data-r]"); if (hs){ S.region=hs.dataset.r; renderFigure(); return; }
    const vs=e.target.closest("#viewSwitch button"); if (vs){ S.bodyView=vs.dataset.v; S.region=null; renderFigure(); return; }
    const a=e.target.closest("[data-a]"); if (a){ const [id,v]=a.dataset.a.split(":"); if(v==="skip"){ if(!S.skipped.includes(id)) S.skipped.push(id); refresh(); } else setFinding(id,+v); return; }
    const rk=e.target.closest(".rk[data-t], .tag[data-t]"); if (rk){ showView("result"); refresh(); return; }
    const ld=e.target.closest("[data-load]"); if (ld){ const c=records().find(x=>x.id===ld.dataset.load); if(c) loadCase(c); return; }
    const dl=e.target.closest("[data-del]"); if (dl){ if(dl.dataset.confirm){ store.set("tp_records", records().filter(x=>x.id!==dl.dataset.del)); renderRecords(); toast("Silindi"); } else { dl.dataset.confirm="1"; dl.textContent="Emin misiniz?"; setTimeout(()=>{ delete dl.dataset.confirm; dl.textContent="Sil"; },3000); } return; }
  });
  document.addEventListener("input", e=>{
    const el=e.target; if(!el.id) return;
    const [pre,key]=[el.id.slice(0,2), el.id.slice(2)];
    if (pre==="p_"){ S.patient[key]=el.value; if(key==="wt"||key==="name"||key==="agent"){ renderRank(); } store.set("tp_draft",S); if(key==="wt"){ deriveAuto(); } return; }
    if (pre==="v_"){ S.vitals[key]=el.value; refresh(); return; }
    if (pre==="e_"){ S.ecg[key]=el.value; refresh(); return; }
    if (pre==="l_"){ S.lab[key]=el.value; refresh(); return; }
    if (el.id==="f_level"){ S.lab.flevel=el.value; renderLab(); return; }
    if (el.id==="f_mg"){ S.lab.fmg=el.value; renderLab(); return; }
    if (el.id==="antiFilter"){ renderAnti(); return; }
  });
  document.addEventListener("change", e=>{ const el=e.target; if(el.id==="aiProvider") updateProvider(); });
  $("#btnSave").onclick=saveCase;
  $("#btnNew").onclick=()=>{ if ($("#btnNew").dataset.c){ S=blank(); syncInputs(); refresh(); showView("patient"); refresh(); delete $("#btnNew").dataset.c; $("#btnNew").textContent="Yeni vaka"; toast("Yeni vaka"); } else { $("#btnNew").dataset.c="1"; $("#btnNew").textContent="Kaydedilmemiş veri silinsin mi? Tekrar tıkla"; setTimeout(()=>{ delete $("#btnNew").dataset.c; $("#btnNew").textContent="Yeni vaka"; },4000); } };
  $("#btnExport").onclick=async()=>{ const j=JSON.stringify(S,null,1); try{ await navigator.clipboard.writeText(j); toast("JSON panoya kopyalandı"); }catch(e){ const b=$("#importBox"); b.hidden=false; b.value=j; b.select(); toast("Kopyalamak için metni seçin"); } };
  $("#btnImport").onclick=()=>{ const b=$("#importBox"); if (b.hidden){ b.hidden=false; b.value=""; b.focus(); b.placeholder="JSON'u yapıştırıp bu düğmeye tekrar basın"; } else { try{ const c=JSON.parse(b.value); if(!c.patient||!c.findings) throw 0; c.id=null; loadCase(c); b.hidden=true; }catch(e){ toast("Geçersiz JSON"); } } };
  $("#btnQReset").onclick=()=>{ S.skipped=[]; refresh(); };
  $("#btnCopySummary").onclick=async()=>{ try{ await navigator.clipboard.writeText(caseSummary()); toast("Özet kopyalandı"); }catch(e){ const r=document.createRange(); r.selectNodeContents($("#caseSummary")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast("Metin seçildi, kopyalayın"); } };
  $("#btnAsk").onclick=ask; $("#btnStop").onclick=()=>aiCtl?.abort();
  $("#geminiKey").value=store.get("tp_gemini_key",""); $("#geminiModel").value=store.get("tp_gemini_model","gemini-2.5-flash");
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", ()=>drawRumack());
}

/* ---------- başlangıç ---------- */
function start(){
  bind();
  const d=store.get("tp_draft", null);
  if (d && d.patient){ S={...blank(),...d}; }
  if (!S.findings || !Object.keys(S.findings).length && !S.patient.agent && !num(S.vitals.hr)) {
    // Örnek vaka: ilk açılışta aracın ne yaptığını gösterir
    if (!d){ S=blank(); S.patient={...S.patient, name:"Örnek vaka (TSA)", age:"27", sex:"K", wt:"62", agent:"Amitriptilin 25 mg ×40 (örnek)", time:"2", route:"Oral", intent:"Kasıtlı (özkıyım)"};
      S.vitals={...S.vitals, hr:"128", sbp:"88", dbp:"52", rr:"14", temp:"38.4", spo2:"96", glu:"132", gcsE:"2", gcsV:"2", gcsM:"4"};
      S.ecg={...S.ecg, hr:"128", rhythm:"Sinüs taşikardisi", qrs:"128", qt:"380", avr:"4"};
      S.findings={ mydriasis:1, dryskin:1, drymucosa:1, bs_down:1, retention:1, h_tca:1, diaph:-1, clonus:-1 }; }
  }
  syncInputs(); renderRecords();
  showView(S.view||"patient"); refresh();
  // artifact canlı güncelleme
  window.claude?.hot?.snapshot?.(()=>S);
}
if (window.claude?.hot?.ready) window.claude.hot.ready(d=>{ if(d&&d.patient) S={...blank(),...d}; start(); }); else start();
