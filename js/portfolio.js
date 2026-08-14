// Portfolio video lightbox: plain script, no imports needed. Loaded
// `defer` so it never blocks the critical render path (headline/CTA/form).
//
// Nothing about the videos loads until a user clicks a play button — the
// shared <video> below starts with no `src` and preload="none", so no
// bytes or metadata are requested up front.

const lightbox = document.getElementById("video-lightbox");
const video = document.getElementById("video-lightbox-video");
const closeTriggers = lightbox.querySelectorAll("[data-lightbox-close]");

let lastFocusedEl = null;

function openLightbox(triggerBtn) {
  const card = triggerBtn.closest(".portfolio-card");
  const src = triggerBtn.dataset.videoSrc;
  const poster = triggerBtn.dataset.videoPoster;

  lastFocusedEl = triggerBtn;
  video.poster = poster || "";
  video.src = src;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  video.play().catch(() => {
    // Autoplay can be blocked (e.g. no prior user gesture context) —
    // the native controls remain fully usable either way.
  });
  lightbox.querySelector(".video-lightbox-close").focus();
}

function closeLightbox() {
  video.pause();
  video.removeAttribute("src");
  video.load(); // releases the buffered/decoded resource
  lightbox.hidden = true;
  document.body.style.overflow = "";
  if (lastFocusedEl) lastFocusedEl.focus();
}

document.querySelectorAll(".portfolio-play").forEach((btn) => {
  btn.addEventListener("click", () => openLightbox(btn));
});

closeTriggers.forEach((el) => el.addEventListener("click", closeLightbox));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});
