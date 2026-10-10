(() => {
"use strict";
const W = 1280, FH = 450, IS = 84;

/* ===== KATEGORI ===== */
const CATS = {
  o: { n: "ORGANIK", t: "hijau", c: "#2e9e4f", i: "🍃", ex: "sisa makanan, daun" },
  p: { n: "PLASTIK / LOGAM", t: "kuning", c: "#f2b705", i: "♻️", ex: "botol, kaleng, kemasan" },
  k: { n: "KERTAS / KARDUS", t: "biru", c: "#2f7de1", i: "📄", ex: "koran, kardus, majalah" },
  b: { n: "B3", t: "merah", c: "#d93636", i: "☣️", ex: "baterai, lampu, bahan kimia" },
  r: { n: "RESIDU", t: "abu-abu", c: "#9aa3ad", i: "🚫", ex: "tisu kotor, popok" }
};
const ORDER = ["o", "p", "k", "b", "r"];

/* ===== DAFTAR SAMPAH: [nama, kategori, emoji, alasan, gambar opsional di assets/] ===== */
const RAW = [
  ["Kulit Pisang","o","🍌","Berasal dari tumbuhan dan dapat terurai secara alami.","banana.png"],
  ["Sisa Nasi","o","🍚","Sisa makanan mudah terurai dan bisa dijadikan kompos."],
  ["Daun Kering","o","🍂","Daun berasal dari tumbuhan dan terurai menjadi tanah."],
  ["Apel Busuk","o","🍎","Buah busuk adalah bahan organik yang terurai alami."],
  ["Kulit Jeruk","o","🍊","Kulit buah mudah terurai dan baik untuk kompos."],
  ["Sisa Sayuran","o","🥬","Sayuran sisa masakan terurai oleh mikroorganisme."],
  ["Tulang Ikan","o","🐟","Berasal dari makhluk hidup sehingga dapat terurai."],
  ["Cangkang Telur","o","🥚","Cangkang telur dapat terurai dan menyuburkan tanah."],
  ["Botol Plastik","p","🧴","Plastik dapat didaur ulang menjadi barang baru.","bottle.png"],
  ["Botol Minuman","p","🍾","Botol minuman bisa dikumpulkan dan didaur ulang."],
  ["Kantong Plastik","p","🛍️","Plastik sulit terurai, sebaiknya didaur ulang."],
  ["Kaleng Minuman","p","🥫","Logam kaleng dapat dilebur dan dipakai kembali."],
  ["Gelas Plastik","p","🥤","Gelas plastik bersih dapat didaur ulang."],
  ["Bungkus Camilan","p","🍿","Kemasan plastik dipisahkan agar dapat didaur ulang."],
  ["Sendok Logam Bekas","p","🥄","Benda logam dapat dilebur dan didaur ulang."],
  ["Kertas","k","📄","Kertas terbuat dari serat kayu dan dapat didaur ulang.","paper.png"],
  ["Koran","k","📰","Koran bekas dapat didaur ulang menjadi kertas baru."],
  ["Kardus","k","📦","Kardus dapat diolah kembali menjadi kemasan baru."],
  ["Majalah","k","📖","Kertas majalah dapat didaur ulang."],
  ["Kotak Makanan Kertas","k","🥡","Kemasan berbahan kertas (yang bersih) dapat didaur ulang."],
  ["Buku Tulis Bekas","k","📓","Halaman kertas bekas dapat didaur ulang."],
  ["Amplop","k","✉️","Amplop terbuat dari kertas dan dapat didaur ulang."],
  ["Baterai","b","🔋","Baterai harus dipisahkan karena mengandung bahan yang berbahaya bagi lingkungan.","battery.png"],
  ["Lampu","b","💡","Lampu tertentu mengandung zat berbahaya dan pecahannya tajam."],
  ["Kemasan Pestisida","b","🧪","Sisa bahan kimia dapat mencemari tanah dan air."],
  ["Cat Bekas","b","🎨","Cat mengandung bahan kimia berbahaya bagi lingkungan."],
  ["Obat Kedaluwarsa","b","💊","Obat dapat mencemari lingkungan dan harus ditangani khusus."],
  ["Termometer Raksa","b","🌡️","Raksa adalah logam beracun yang sangat berbahaya."],
  ["Tinta Printer Bekas","b","🖨️","Tinta mengandung bahan kimia yang mencemari lingkungan."],
  ["Tisu Kotor","r","🧻","Tisu bekas terkontaminasi dan tidak dapat didaur ulang."],
  ["Popok","r","👶","Popok bekas bercampur kotoran sehingga tergolong residu."],
  ["Puntung Rokok","r","🚬","Filter rokok sulit terurai dan tidak bisa didaur ulang."],
  ["Masker Bekas","r","😷","Masker bekas tidak dapat didaur ulang dan perlu dibuang aman."],
  ["Permen Karet","r","🍬","Permen karet lengket dan tidak dapat didaur ulang."],
  ["Debu Sapuan","r","🧹","Debu dan sampah campuran tidak punya kategori daur ulang."],
  ["Pecahan Keramik","r","🏺","Keramik tidak dapat didaur ulang seperti kaca atau logam."]
];
const cnt = {};
const ITEMS = RAW.map(([name, cat, icon, why, img]) => {
  cnt[cat] = (cnt[cat] || 0) + 1;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const srcs = ["assets/items/" + slug + ".png"];
  if (img) srcs.push("assets/" + img);
  return { name, cat, icon, why, img, slug, srcs, lvl: cnt[cat] <= 3 ? 1 : 3 };
});

/* ===== ELEMEN ===== */
const $ = id => document.getElementById(id);
const stage = $("stage"), boardsEl = $("boards");
const BIN_FILE = { o: "organik", p: "plastik", k: "kertas", b: "b3", r: "residu" };

/* ===== ASET GAMBAR (otomatis; jika file tidak ada, tampilan bawaan dipakai) ===== */
const imgCache = {};
function preload(src, cb) {
  if (src in imgCache) return;
  imgCache[src] = null;
  const im = new Image();
  im.onload = () => { imgCache[src] = im; if (cb) cb(); };
  im.src = src;
}
function applyBins() {
  document.querySelectorAll(".bin").forEach(el => {
    const s = "assets/bin-" + BIN_FILE[el.dataset.c] + ".png";
    if (imgCache[s]) { el.classList.add("has-img"); el.style.backgroundImage = `url("${s}")`; }
  });
}
ORDER.forEach(k => preload("assets/bin-" + BIN_FILE[k] + ".png", applyBins));
ITEMS.forEach(it => it.srcs.forEach(s => preload(s)));

/* ===== SKALA LAYAR ===== */
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / 720);
  stage.style.setProperty("--s", s);
}
addEventListener("resize", fit); fit();

/* ===== SUARA (opsional, dibuat sendiri dengan WebAudio) ===== */
let ac = null;
function tone(f, d, type = "sine", delay = 0, vol = .12) {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + delay;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}
const snd = {
  drop: () => tone(180, .12, "triangle"),
  click: () => { tone(720, .06, "triangle", 0, .1); tone(1080, .08, "triangle", .045, .08); },
  ok: () => { tone(660, .12, "square", 0, .08); tone(880, .18, "square", .1, .08); },
  bad: () => { tone(200, .25, "sawtooth", 0, .1); tone(140, .3, "sawtooth", .15, .1); },
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, "triangle", i * .1)),
  over: () => [400, 320, 250, 160].forEach((f, i) => tone(f, .3, "sawtooth", i * .22, .1))
};


/* ===== MUSIK LATAR (dibuat dengan WebAudio, tanpa file eksternal) ===== */
const Music = (() => {
  const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am - F - C - G
  const BS = [33, 29, 36, 31];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let on = true, timer = null, step = 0, next = 0, master = null, noise = null;
  try { on = localStorage.getItem("ss-music") !== "off"; } catch (e) {}
  function ctx() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    if (!master) {
      master = ac.createGain(); master.gain.value = .4; master.connect(ac.destination);
      noise = ac.createBuffer(1, ac.sampleRate * .3, ac.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ac;
  }
  function o(type, f, t, d, v) {
    const os = ac.createOscillator(), g = ac.createGain();
    os.type = type; os.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    os.connect(g); g.connect(master); os.start(t); os.stop(t + d + .02);
  }
  function kick(t) {
    const os = ac.createOscillator(), g = ac.createGain();
    os.frequency.setValueAtTime(160, t); os.frequency.exponentialRampToValueAtTime(42, t + .12);
    g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
    os.connect(g); g.connect(master); os.start(t); os.stop(t + .25);
  }
  function hit(t, d, hp, v) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; f.type = "highpass"; f.frequency.value = hp;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + d + .02);
  }
  function play(s, t, spb) {
    const bar = Math.floor(s / 16) % 4, i = s % 16, lv = level || 1, ch = CH[bar];
    if (i % 4 === 0) kick(t);
    if (i % 2 === 0) o("sawtooth", hz(BS[bar] + (i % 8 === 6 ? 12 : 0)), t, spb * 1.7, .16);
    o("square", hz(ch[i % 3] + (i % 8 >= 4 ? 12 : 0)), t, spb * .9, .04);
    if (i % 2 === 1) hit(t, .04, 7000, .12);
    if (lv >= 2 && (i === 4 || i === 12)) hit(t, .14, 1500, .3);
    if (lv >= 3 && i % 4 === 2) hit(t, .03, 9000, .12);
    if (lv >= 4 && i % 4 === 0) o("sawtooth", hz(ch[(i / 4) % 3] + 24), t, spb * 3, .05);
    if (lv >= 5 && i % 2 === 1) kick(t);
  }
  function sched() {
    const spb = 60 / (118 + topLevel() * 10) / 4;
    while (next < ac.currentTime + .15) { play(step, next, spb); next += spb; step++; }
  }
  return {
    start() { if (!on || timer) return; try { ctx(); next = ac.currentTime + .05; step = 0; timer = setInterval(sched, 25); } catch (e) {} },
    stop() { clearInterval(timer); timer = null; },
    toggle() {
      on = !on;
      try { localStorage.setItem("ss-music", on ? "on" : "off"); } catch (e) {}
      if (on) { if (phase === "run") this.start(); else if (phase === "menu") MenuMusic.start(); }
      else { this.stop(); MenuMusic.stop(); }
      return on;
    },
    get on() { return on; }
  };
})();

/* ===== MUSIK MENU UTAMA (santai, dibuat dengan WebAudio) ===== */
const MenuMusic = (() => {
  const SPB = 60 / 70;                                                                  // detik per ketukan (70 BPM)
  const CH = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]]; // Cmaj7 - Am7 - Fmaj7 - G6
  const BS = [36, 33, 29, 31];
  const ARP = [0, 2, 3, 2, 1, 2, 3, 2];
  const MEL = { "0:0": 76, "0:5": 79, "1:0": 76, "1:4": 72, "2:0": 77, "2:5": 76, "3:0": 74, "3:4": 71 };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let timer = null, next = 0, step = 0, out = null;
  function setup() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    if (out) return;
    out = ac.createGain(); out.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
    const dl = ac.createDelay(1); dl.delayTime.value = SPB * .75;
    const fb = ac.createGain(); fb.gain.value = .3;
    const wet = ac.createGain(); wet.gain.value = .35;
    out.connect(lp); lp.connect(ac.destination);
    lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(ac.destination);
  }
  function note(type, f, t, d, v, a) {
    const os = ac.createOscillator(), g = ac.createGain();
    os.type = type; os.frequency.value = f;
    g.gain.setValueAtTime(.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    os.connect(g); g.connect(out); os.start(t); os.stop(t + d + .05);
  }
  function sched() {
    if (next < ac.currentTime) next = ac.currentTime + .05;
    while (next < ac.currentTime + .2) {
      const bar = Math.floor(step / 8) % 4, i = step % 8, ch = CH[bar];
      if (i === 0) ch.slice(0, 3).forEach(m => note("sine", hz(m), next, SPB * 4, .05, .8));
      if (i === 0 || i === 4) note("sine", hz(BS[bar]), next, SPB * 2, .16, .02);
      note("triangle", hz(ch[ARP[i]] + 12), next, SPB * 1.4, .05, .01);
      const m = MEL[bar + ":" + i]; if (m) note("sine", hz(m), next, SPB * 2.5, .07, .02);
      next += SPB / 2; step++;
    }
  }
  return {
    start() {
      if (!Music.on) return;
      try {
        setup();
        if (timer) return;
        out.gain.cancelScheduledValues(ac.currentTime);
        out.gain.setTargetAtTime(.8, ac.currentTime, .5);
        next = ac.currentTime + .1; step = 0;
        timer = setInterval(sched, 25);
      } catch (e) {}
    },
    stop() {
      if (!timer) return;
      clearInterval(timer); timer = null;
      try { out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0, ac.currentTime, .12); } catch (e) {}
    }
  };
})();

/* ===== STATE ===== */
const SPEED = [90, 125, 160, 200, 245];
const KEY_SPEED = { single: 1150, versus: 800 };   // kecepatan geser objek dengan keyboard (px/detik)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let phase = "menu", mode = "single", curMode = "single", players = [], last = 0;
const topLevel = () => players.reduce((m, p) => Math.max(m, p.level), 1);   // tempo musik mengikuti level tertinggi
const lifeStr = n => n > 0 ? "❤️".repeat(n) + "🖤".repeat(3 - n) : "🖤🖤🖤";

/* ===== SCOREBOARD & NAMA PEMAIN =====
   Disimpan di localStorage, dipisah untuk "single" dan "versus". Top 10 per mode.
   Urutan: skor tertinggi > akurasi tertinggi > sampah benar terbanyak > yang lebih dulu mencapainya.
   Satu nama hanya punya satu baris (skor terbaiknya). */
const SB_KEY = "ss-scores-v1", SB_MAX = 10;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sbCmp = (a, b) => b.score - a.score || b.acc - a.acc || b.ok - a.ok || a.t - b.t;
function sbLoad() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(SB_KEY)); } catch (e) {}
  const fix = l => Array.isArray(l) ? l.filter(e => e && typeof e.name === "string" && typeof e.score === "number").sort(sbCmp).slice(0, SB_MAX) : [];
  return { single: fix(d && d.single), versus: fix(d && d.versus) };
}
const sbData = sbLoad();
function sbSave() { try { localStorage.setItem(SB_KEY, JSON.stringify(sbData)); } catch (e) {} }
let sbTab = "single", curNames = ["Pemain 1", "Pemain 2"];
const sbNewT = [];   // penanda baris yang baru saja masuk (disorot di menu)
function sbAdd(mk, p, won) {
  if (p.score <= 0) return null;
  const list = sbData[mk], key = p.name.toLowerCase();
  const entry = { name: p.name, score: p.score, ok: p.ok, bad: p.bad, acc: accOf(p), t: Date.now() + p.i };
  if (won) entry.win = true;
  const ex = list.findIndex(e => e.name.toLowerCase() === key);
  let improved = true;
  if (ex >= 0) { if (sbCmp(entry, list[ex]) < 0) list.splice(ex, 1); else improved = false; }
  if (improved) list.push(entry);
  list.sort(sbCmp); list.length = Math.min(list.length, SB_MAX);
  sbSave();
  const at = improved ? list.indexOf(entry) : list.findIndex(e => e.name.toLowerCase() === key);
  if (improved && at >= 0) sbNewT.push(entry.t);
  return { rank: at >= 0 ? at + 1 : null, improved };
}
function rankText(r) {
  if (!r || !r.rank) return "Belum masuk 10 besar";
  return r.improved ? "🏅 Peringkat #" + r.rank + " di scoreboard" : "Rekor pribadimu masih peringkat #" + r.rank;
}
function renderSb() {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.sb === sbTab));
  const box = $("sbList"), list = sbData[sbTab];
  box.innerHTML = "";
  if (!list.length) { box.innerHTML = '<div class="sb-empty">Belum ada skor.<br>Jadilah yang pertama!</div>'; return; }
  list.forEach((e, i) => {
    const r = document.createElement("div");
    r.className = "sb-row" + (sbNewT.includes(e.t) ? " me" : "");
    r.innerHTML = '<span class="rk">' + (["🥇", "🥈", "🥉"][i] || (i + 1)) + '</span><span class="sb-nm"></span><span class="sc">' + e.score + '</span><span class="ac">' + e.acc + '%</span>';
    r.querySelector(".sb-nm").textContent = e.name + (e.win ? " 🏆" : "");
    box.appendChild(r);
  });
}
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => { sbTab = b.dataset.sb; renderSb(); }));

const nm1 = $("nm1"), nm2 = $("nm2");
let ndMode = "single";
function openNameDlg(m) {
  ndMode = m; const vs = m === "versus";
  $("ndTitle").textContent = vs ? "⚔️ Nama Para Pemain" : "👤 Masukkan Namamu";
  $("ndL1").textContent = vs ? "PEMAIN 1 · A D S" : "NAMA";
  $("nf2").classList.toggle("hidden", !vs);
  nm1.value = nm2.value = ""; $("ndErr").textContent = "";
  $("nameDlg").classList.remove("hidden");
  setTimeout(() => nm1.focus(), 60);
}
function submitName() {
  const clean = v => v.trim().replace(/\s+/g, " ");
  const a = clean(nm1.value), b = clean(nm2.value), vs = ndMode === "versus", err = $("ndErr");
  if (!a) { err.textContent = vs ? "Nama Pemain 1 belum diisi." : "Nama belum diisi."; nm1.focus(); return; }
  if (vs) {
    if (!b) { err.textContent = "Nama Pemain 2 belum diisi."; nm2.focus(); return; }
    if (a.toLowerCase() === b.toLowerCase()) { err.textContent = "Nama kedua pemain harus berbeda."; nm2.focus(); return; }
  }
  $("nameDlg").classList.add("hidden");
  startGame(ndMode, vs ? [a, b] : [a]);
}
$("ndGo").addEventListener("click", submitName);
$("ndCancel").addEventListener("click", () => $("nameDlg").classList.add("hidden"));
nm1.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (ndMode === "versus" && !nm2.value.trim()) nm2.focus(); else submitName(); } });
nm2.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submitName(); } });
$("nameDlg").addEventListener("click", e => { if (e.target === e.currentTarget) $("nameDlg").classList.add("hidden"); });

/* ===== PAPAN PERMAINAN: 1 papan (1 pemain) atau 2 papan kiri-kanan (versus) ===== */
function buildBoards(m) {
  boardsEl.innerHTML = "";
  mode = m; stage.classList.toggle("vs", m === "versus");
  const n = m === "versus" ? 2 : 1, bw = W / n;
  players = [];
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.className = "board"; el.style.left = i * bw + "px"; el.style.width = bw + "px";
    el.style.setProperty("--bw", bw / 5 + "px");
    el.innerHTML = '<div class="field"><div class="item"></div><div class="iname"></div><div class="fb"></div><div class="info"></div><div class="banner"></div></div><div class="bins"></div><div class="dead"><div>🏁</div><div>SELESAI</div></div>';
    boardsEl.appendChild(el);
    const bins = {}, binsEl = el.querySelector(".bins");
    ORDER.forEach(k => {
      const c = CATS[k], d = document.createElement("div");
      d.className = "bin"; d.dataset.c = k; d.style.setProperty("--cc", c.c);
      d.innerHTML = `<div class="lid"></div><div class="body"><div class="ic">${c.i}</div><div class="nm">${c.n}</div><div class="ex">${c.ex}</div></div>`;
      binsEl.appendChild(d); bins[k] = d;
    });
    const q = s => el.querySelector(s);
    const h = m === "versus"
      ? { lv: document.querySelector("#vhud .p" + (i + 1) + " .lv"), sc: document.querySelector("#vhud .p" + (i + 1) + " .sc"), lf: document.querySelector("#vhud .p" + (i + 1) + " .lf") }
      : { lv: $("level"), sc: $("score"), lf: $("lives") };
    players.push({
      i, el, x0: i * bw, bw, binW: bw / 5, bins, h,
      itemEl: q(".item"), iname: q(".iname"), fb: q(".fb"), info: q(".info"), banner: q(".banner"), dead: q(".dead"),
      score: 0, lives: 3, ok: 0, bad: 0, level: 1, cur: null, x: 0, y: 0,
      st: "wait", wait: .5, lastIdx: -1, out: false, kL: false, kR: false, kD: false, infoTimer: 0
    });
  }
  if (m === "versus") { const dv = document.createElement("div"); dv.className = "divider"; boardsEl.appendChild(dv); }
  applyBins();
  players.forEach(hud);
}
function hud(p) {
  p.h.lv.textContent = "LEVEL " + p.level;
  p.h.sc.textContent = "SCORE: " + p.score;
  p.h.lf.textContent = lifeStr(p.lives);
}
function startGame(m, names) {
  if (names) curNames = names;
  curMode = m; buildBoards(m);
  players.forEach((p, i) => { p.name = curNames[i] || ("Pemain " + (i + 1)); });
  if (m === "versus") players.forEach(p => { document.querySelector("#vhud .p" + (p.i + 1) + " .tag").textContent = p.name; });
  ["menu", "over", "overV", "nameDlg"].forEach(id => $(id).classList.add("hidden"));
  phase = "run"; last = performance.now();
  MenuMusic.stop(); Music.stop(); Music.start();
}
function spawn(p) {
  const pool = ITEMS.filter(i => i.lvl <= (p.level >= 3 ? 3 : 1) || (p.level === 2 && i.lvl === 1));
  let idx; do { idx = ITEMS.indexOf(pool[Math.floor(Math.random() * pool.length)]); } while (idx === p.lastIdx && pool.length > 1);
  p.lastIdx = idx; const cur = p.cur = ITEMS[idx];
  const m = p.bw * .12;
  p.x = m + Math.random() * (p.bw - 2 * m); p.y = -IS / 2;
  const el = p.itemEl;
  el.style.transform = `translate(${p.x - IS / 2}px,${p.y - IS / 2}px)`;
  el.style.display = ""; el.textContent = cur.icon; el.setAttribute("aria-label", cur.name);
  const src = cur.srcs.find(s => imgCache[s]);
  if (src) { const im = imgCache[src].cloneNode(); im.alt = cur.name; el.textContent = ""; el.appendChild(im); }
  p.iname.textContent = cur.name; p.iname.classList.add("show");
  p.st = "play"; snd.drop();
}
function binAt(p, px) { return ORDER[clamp(Math.floor(px / p.binW), 0, 4)]; }

/* ===== LOOP ===== */
function step(p, dt) {
  if (phase !== "run") return;
  if (p.st === "wait") { p.wait -= dt; if (p.wait <= 0) spawn(p); }
  else if (p.st === "play") {
    const dir = (p.kR ? 1 : 0) - (p.kL ? 1 : 0);
    p.x = clamp(p.x + dir * KEY_SPEED[mode] * dt, IS / 2, p.bw - IS / 2);
    const sp = (SPEED[p.level - 1] + (p.ok % 10) * 4) * (p.kD ? 3 : 1);
    p.y += sp * dt;
    p.itemEl.style.transform = `translate(${p.x - IS / 2}px,${p.y - IS / 2}px)`;
    const tgt = binAt(p, p.x);
    ORDER.forEach(k => p.bins[k].classList.toggle("target", k === tgt));
    if (p.y >= FH - IS / 2) land(p, tgt);
  }
}
function loop(now) {
  if (paused) { last = now; requestAnimationFrame(loop); return; }
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (phase === "run") players.forEach(p => step(p, dt));
  requestAnimationFrame(loop);
}

/* ===== PENILAIAN ===== */
function land(p, k) {
  p.st = "resolve"; p.itemEl.style.display = "none"; p.iname.classList.remove("show");
  ORDER.forEach(c => p.bins[c].classList.remove("target"));
  const cur = p.cur, good = k === cur.cat, b = p.bins[k];
  b.classList.remove("flash-ok", "flash-bad"); void b.offsetWidth;
  const cx = (ORDER.indexOf(k) + .5) * p.binW;
  let msg;
  if (good) {
    p.ok++; p.score += 10; snd.ok(); b.classList.add("flash-ok");
    msg = `✓ BENAR! ${cur.name} → ${CATS[k].n}`;
    pop(p, "+10", cx, FH - 60, "#7dff9a"); burst(p, cx, FH - 20, CATS[k].c);
  } else {
    p.bad++; p.score = Math.max(0, p.score - 5); p.lives--; snd.bad(); b.classList.add("flash-bad");
    const sh = mode === "single" ? stage : p.el, cls = mode === "single" ? "shake" : "bshake";
    sh.classList.remove(cls); void sh.offsetWidth; sh.classList.add(cls);
    msg = `✕ SALAH! ${cur.name} → ${CATS[cur.cat].n}`;
    pop(p, "-5", cx, FH - 60, "#ff8b8b"); burst(p, cx, FH - 20, "#ff5252");
  }
  showInfo(p, good, msg, cur.why);
  hud(p);
  if (p.lives <= 0) {
    if (mode === "single") { endGame(gameOver); return; }
    p.out = true; p.st = "out";
    setTimeout(() => p.dead.classList.add("show"), 1200);
    if (vsEnded()) endGame(gameOverVs);
    return;
  }
  const nl = Math.min(5, 1 + Math.floor(p.ok / 10));
  if (nl > p.level) {
    p.level = nl; hud(p); snd.level();
    p.banner.textContent = "LEVEL " + p.level; p.banner.classList.remove("go"); void p.banner.offsetWidth; p.banner.classList.add("go");
  }
  if (mode === "versus" && vsEnded()) { endGame(gameOverVs); return; }
  p.wait = .6; p.st = "wait";
}
/* Versus selesai jika kedua pemain habis nyawa, atau pemain yang masih main sudah melampaui skor pemain yang habis */
function vsEnded() {
  const [a, b] = players;
  if (a.out && b.out) return true;
  if (a.out && b.score > a.score) return true;
  if (b.out && a.score > b.score) return true;
  return false;
}
function endGame(fn) { phase = "over-wait"; Music.stop(); setTimeout(fn, 900); }
function showInfo(p, good, title, text) {
  p.info.className = "info show " + (good ? "ok" : "bad");
  p.info.innerHTML = `<b>${title}</b>${text}`;
  clearTimeout(p.infoTimer); p.infoTimer = setTimeout(() => p.info.classList.remove("show"), 3200);
}
function pop(p, t, px, py, col) {
  const e = document.createElement("div"); e.className = "pop"; e.textContent = t;
  e.style.left = px - 30 + "px"; e.style.top = py + "px"; e.style.color = col; p.fb.appendChild(e);
  e.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-90px)", opacity: 0 }], { duration: 800, easing: "ease-out" }).onfinish = () => e.remove();
}
function burst(p, px, py, col) {
  for (let i = 0; i < 12; i++) {
    const e = document.createElement("div"); e.className = "pt"; e.style.background = col;
    e.style.left = px + "px"; e.style.top = py + "px"; p.fb.appendChild(e);
    const a = Math.random() * Math.PI, r = 50 + Math.random() * 80;
    e.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * r * (Math.random() < .5 ? -1 : 1)}px,${-Math.sin(a) * r}px)`, opacity: 0 }], { duration: 650, easing: "ease-out" }).onfinish = () => e.remove();
  }
}
const accOf = p => { const t = p.ok + p.bad; return t ? Math.round(p.ok / t * 100) : 0; };
function gameOver() {
  if (phase !== "over-wait") return;   // sudah kembali ke menu
  const p = players[0];
  phase = "over"; Music.stop(); snd.over();
  sbNewT.length = 0; sbTab = "single";
  const r = sbAdd("single", p, false);
  $("rankMsg").textContent = "👤 " + p.name + " · " + rankText(r);
  $("fScore").textContent = p.score; $("fOk").textContent = p.ok; $("fBad").textContent = p.bad;
  $("fAcc").textContent = accOf(p) + "%";
  $("over").classList.remove("hidden");
}
function gameOverVs() {
  if (phase !== "over-wait") return;
  phase = "over"; Music.stop(); snd.over();
  const [a, b] = players;
  const win = a.score === b.score ? -1 : (a.score > b.score ? 0 : 1);
  sbNewT.length = 0; sbTab = "versus";
  const rs = players.map(p => sbAdd("versus", p, win === p.i));
  $("vTitle").textContent = win < 0 ? "🤝 SERI!" : "🏆 " + players[win].name.toUpperCase() + " MENANG!";
  $("vStats").innerHTML = players.map(p =>
    `<div class="vcol p${p.i + 1}${win === p.i ? " win" : ""}"><h3>${esc(p.name)}</h3><div class="vwho">PEMAIN ${p.i + 1}</div><div class="vscore">${p.score}</div><span>Skor akhir</span>` +
    `<div class="vrow"><b>${p.ok}</b> benar</div><div class="vrow"><b>${p.bad}</b> salah</div><div class="vrow"><b>${accOf(p)}%</b> akurasi</div>` +
    `<div class="vrank">${rankText(rs[p.i])}</div></div>`).join("");
  $("overV").classList.remove("hidden");
}

/* ===== KONTROL =====
   1 pemain : mouse / sentuh & geser, atau keyboard (← → A D, ↓ S)
   Versus   : pemain 1 (kiri) = A D S, pemain 2 (kanan) = ← → ↓; sentuh per sisi layar; mouse tidak dipakai */
const WASD = { a: "kL", d: "kR", s: "kD" }, ARROW = { ArrowLeft: "kL", ArrowRight: "kR", ArrowDown: "kD" };
function keyInfo(e) {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (WASD[k]) return [0, WASD[k]];
  if (ARROW[k]) return [mode === "versus" ? 1 : 0, ARROW[k]];
  return null;
}
addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") {   // sedang mengetik nama: jangan ganggu huruf A/D/S/M
    if (e.key === "Escape" && popOpen()) { closePops(); e.preventDefault(); }
    return;
  }
  const ki = keyInfo(e);
  if (ki) { const p = players[ki[0]]; if (p) p[ki[1]] = true; e.preventDefault(); return; }
  if (e.key === "Escape" && popOpen()) { closePops(); e.preventDefault(); }
  else if (e.key === "Enter" && (phase === "menu" || phase === "over") && e.target.tagName !== "BUTTON" && !popOpen()) {
    if (phase === "menu") openNameDlg("single"); else startGame(curMode);
    e.preventDefault();
  }
});
addEventListener("keyup", e => {
  const ki = keyInfo(e);
  if (ki && players[ki[0]]) players[ki[0]][ki[1]] = false;
});
addEventListener("blur", () => players.forEach(p => { p.kL = p.kR = p.kD = false; }));

const ptr = new Map();   // pointerId -> indeks pemain (versus, layar sentuh)
let drag = false;
function stageX(e) { const r = stage.getBoundingClientRect(); return (e.clientX - r.left) / (r.width / W); }
function moveTo(p, sx) { if (p && p.st === "play") p.x = clamp(sx - p.x0, IS / 2, p.bw - IS / 2); }
stage.addEventListener("pointerdown", e => {
  if (phase !== "run") return;
  if (mode === "versus") {
    if (e.pointerType === "mouse") return;            // mouse hanya menampilkan kursor
    const sx = stageX(e), i = sx < W / 2 ? 0 : 1;
    ptr.set(e.pointerId, i); moveTo(players[i], sx);
  } else { drag = true; moveTo(players[0], stageX(e)); }
});
stage.addEventListener("pointermove", e => {
  if (phase !== "run") return;
  if (mode === "versus") {
    if (e.pointerType === "mouse") return;
    const i = ptr.get(e.pointerId); if (i !== undefined) moveTo(players[i], stageX(e));
  } else if (drag || e.pointerType === "mouse") moveTo(players[0], stageX(e));
});
["pointerup", "pointercancel", "pointerleave"].forEach(t => stage.addEventListener(t, e => { drag = false; ptr.delete(e.pointerId); }));

$("start").addEventListener("click", () => { tone(1, .01); openNameDlg("single"); });
$("startVs").addEventListener("click", () => { tone(1, .01); openNameDlg("versus"); });
$("again").addEventListener("click", () => startGame("single"));
$("againV").addEventListener("click", () => startGame("versus"));

/* ===== MENU UTAMA & POP-UP ===== */
const POPS = ["howto", "types", "nameDlg"];
const popOpen = () => POPS.some(id => !$(id).classList.contains("hidden"));
function openPop(id) { tone(1, .01); $(id).classList.remove("hidden"); }
function closePops() { POPS.forEach(id => $(id).classList.add("hidden")); }
function toMenu() {
  closePops(); $("over").classList.add("hidden"); $("overV").classList.add("hidden"); $("menu").classList.remove("hidden");
  phase = "menu"; Music.stop(); buildBoards("single"); renderSb(); MenuMusic.start();
}
$("btnHow").addEventListener("click", () => openPop("howto"));
$("btnTypes").addEventListener("click", () => openPop("types"));
$("toMenu").addEventListener("click", toMenu);
$("toMenuV").addEventListener("click", toMenu);
$("home").addEventListener("click", () => { toMenu(); $("home").blur(); });
$("home").addEventListener("pointerdown", e => e.stopPropagation());
document.addEventListener("click", e => { if (e.target.closest && e.target.closest("button")) snd.click(); });   // sfx semua tombol
document.querySelectorAll(".close").forEach(b => b.addEventListener("click", closePops));
POPS.forEach(id => $(id).addEventListener("click", e => { if (e.target === e.currentTarget) closePops(); }));
const muteBtn = $("mute"), menuMute = $("menuMute");
function syncMute() { [muteBtn, menuMute].forEach(b => { b.classList.toggle("off", !Music.on); b.textContent = Music.on ? "🎵" : "🔇"; }); }
muteBtn.addEventListener("click", () => { Music.toggle(); syncMute(); muteBtn.blur(); });
muteBtn.addEventListener("pointerdown", e => e.stopPropagation());
menuMute.addEventListener("click", () => { Music.toggle(); syncMute(); menuMute.blur(); });
addEventListener("keydown", e => { if (e.target.tagName === "INPUT") return; if (e.key === "m" || e.key === "M") { Music.toggle(); syncMute(); } });
syncMute();

/* Jeda otomatis saat layar portrait / tab tidak aktif */
let paused = false;
function checkPause() {
  const p = document.hidden || matchMedia("(orientation:portrait)").matches;
  if (p && !paused) { paused = true; Music.stop(); MenuMusic.stop(); }
  if (!p && paused) { paused = false; last = performance.now(); if (phase === "run") Music.start(); else if (phase === "menu") MenuMusic.start(); }
}
["pointerdown", "keydown"].forEach(t => addEventListener(t, e => {
  if (phase !== "menu" || paused) return;
  if (e.type === "keydown" && e.key === "Enter") return;
  if (e.target.closest && e.target.closest("#start,#startVs")) return;
  MenuMusic.start();
}));
document.addEventListener("visibilitychange", checkPause);
addEventListener("resize", checkPause);
buildBoards("single");
renderSb();
requestAnimationFrame(loop);
})();
