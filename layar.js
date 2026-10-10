/* layar.js — layar penuh, notifikasi untuk HP, dan penyesuaian orientasi */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const de = document.documentElement;
const canFS = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); // iPhone Safari = false
const isMobile = matchMedia("(pointer:coarse)").matches || /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const quiet = r => { if (r && r.catch) r.catch(() => {}); };

function enter() { try { quiet((de.requestFullscreen || de.webkitRequestFullscreen).call(de)); } catch (e) {} }
function exit() { try { quiet((document.exitFullscreen || document.webkitExitFullscreen).call(document)); } catch (e) {} }
function toggle() { isFS() ? exit() : enter(); }

/* ===== Notifikasi awal untuk HP / tablet ===== */
const note = $("mobnote");
function hideNote() { note.classList.add("hidden"); }
if (isMobile && !isFS()) {
  note.classList.remove("hidden");
  if (!canFS) {
    $("mnTitle").textContent = "Putar ke landscape";
    $("mnText").innerHTML = "Game ini hanya bisa dimainkan jika perangkat berada di posisi <b>landscape</b> (miring).";
  }
}
$("mnOk").addEventListener("click", hideNote);

/* ===== Tombol layar penuh ===== */
const btns = document.querySelectorAll("[data-fs]");
btns.forEach(b => {
  if (!canFS) { b.style.display = "none"; return; }
  b.addEventListener("click", () => { b.dataset.fs === "enter" ? enter() : toggle(); b.blur(); });
  if (b.id === "fs") b.addEventListener("pointerdown", e => e.stopPropagation());
});

function onChange() {
  const f = isFS();
  btns.forEach(b => { b.classList.toggle("on", f); if (b.id === "fs" || b.id === "menuFs") b.title = f ? "Keluar layar penuh (F)" : "Layar penuh (F)"; });
  try { if (f) quiet(screen.orientation.lock("landscape")); else screen.orientation.unlock(); } catch (e) {}
  if (f) hideNote();
  setTimeout(() => dispatchEvent(new Event("resize")), 200); // hitung ulang skala & status jeda
}
document.addEventListener("fullscreenchange", onChange);
document.addEventListener("webkitfullscreenchange", onChange);

addEventListener("keydown", e => {
  if ((e.key === "f" || e.key === "F") && canFS && !e.ctrlKey && !e.metaKey && !e.altKey) { toggle(); e.preventDefault(); }
});
})();
