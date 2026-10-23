import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// locomotive-scroll v5 only supports vertical parallax, so the horizontal
// `data-parallax-x` effect from v4 is reproduced here.
const parallaxItems = gsap.utils.toArray("[data-parallax-x]").map((el) => ({
  el,
  speed: parseFloat(el.dataset.parallaxX) / 10,
  fromTop: el.dataset.parallaxStart === "top",
  setX: gsap.quickSetter(el, "x", "px"),
}));

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

function updateParallax() {
  const enabled = !reduceMotion && !isTouchDevice && window.innerWidth > 768;
  const viewportHeight = window.innerHeight;

  parallaxItems.forEach(({ el, speed, fromTop, setX }) => {
    if (!enabled) return setX(0);

    if (fromTop) return setX(window.scrollY * -speed);

    const rect = el.getBoundingClientRect();
    const distance = viewportHeight / 2 - (rect.top + rect.height / 2);
    setX(distance * -speed);
  });
}

// Pages can hook extra per-frame work (reading progress, ...) into the scroll loop.
const scrollListeners = new Set();
export const onScroll = (fn) => {
  scrollListeners.add(fn);
  return () => scrollListeners.delete(fn);
};

// Smooth scrolling is skipped entirely for visitors who ask for reduced motion.
export const scroll = reduceMotion
  ? null
  : new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.1,
      },
      scrollCallback: () => {
        ScrollTrigger.update();
        updateParallax();
        scrollListeners.forEach((fn) => fn());
      },
      // Drive Lenis from GSAP's ticker so ScrollTrigger and smooth scroll stay in sync
      initCustomTicker: (render) => gsap.ticker.add(render),
      destroyCustomTicker: (render) => gsap.ticker.remove(render),
    });
gsap.ticker.lagSmoothing(0);

if (reduceMotion) {
  window.addEventListener("scroll", updateParallax, { passive: true });
}

export const refreshLayout = () => {
  scroll?.resize();
  ScrollTrigger.refresh();
  updateParallax();
};

// Scroll to an element, smooth when Locomotive is running, native otherwise.
export const scrollToTarget = (target, offset = 0) => {
  if (!target) return;
  if (scroll) scroll.scrollTo(target, { offset });
  else {
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top });
  }
};

setTimeout(refreshLayout, 1000);
window.addEventListener("load", refreshLayout);
window.addEventListener("resize", updateParallax);
