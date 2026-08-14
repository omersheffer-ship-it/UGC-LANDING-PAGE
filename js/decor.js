// Decorative background parallax. Builds no DOM (the SVG shapes are
// already static markup in index.html) — this only listens for scroll
// and nudges a CSS custom property, so it's cheap and safe to defer.
//
// Respects prefers-reduced-motion: if the user has it set, the scroll
// listener is never attached at all, and the shapes stay at their
// static CSS tilt (see the prefers-reduced-motion block in styles.css).

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  const shapes = document.querySelectorAll(".decor-shape");
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      shapes.forEach((el, i) => {
        const speed = 0.03 + (i % 3) * 0.02;
        el.style.setProperty("--parallax-y", `${y * speed}px`);
      });
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}
