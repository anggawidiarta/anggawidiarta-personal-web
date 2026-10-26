import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { reduceMotion, scrollToTarget } from "../core/scroll";
import { contactActions, sectionReveals } from "../core/reveals";

gsap.registerPlugin(ScrollTrigger, SplitText);

const SCROLL_OFFSET = -24;
const article = document.querySelector("[data-article]");
const tocLinks = gsap.utils.toArray("[data-toc-link]");

function intro() {
  if (reduceMotion) return;

  gsap.from(".home__nav", {
    duration: 0.5,
    delay: 0.2,
    opacity: 0,
    yPercent: -100,
    ease: "power4.out",
  });

  // The title is split into masked lines once the display face is ready,
  // so line breaks are measured with the real glyphs.
  void document.fonts.ready.then(() => {
    SplitText.create(".article__title", {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          duration: 0.8,
          yPercent: 110,
          stagger: 0.09,
          ease: "power4.out",
        }),
    });
  });

  gsap.from(".article__meta > *", {
    duration: 0.8,
    delay: 0.45,
    y: 16,
    opacity: 0,
    stagger: 0.1,
    ease: "power3.out",
  });
}

function readingProgress() {
  const bar = document.querySelector("[data-progress]");
  const label = document.querySelector("[data-progress-label]");
  if (!article || !bar) return;

  gsap.to(bar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: article,
      start: "top 70%",
      end: "bottom 70%",
      scrub: true,
      onUpdate: (self) => {
        if (label) label.textContent = `${Math.round(self.progress * 100)}%`;
      },
    },
  });
}

function contents() {
  if (!tocLinks.length) return;

  const entries = [];
  tocLinks.forEach((link) => {
    const id = decodeURIComponent(link.hash.slice(1));
    const heading = document.getElementById(id);
    if (!heading) return;
    entries.push({ id, heading });

    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToTarget(heading, SCROLL_OFFSET);
      history.replaceState(null, "", link.hash);
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      link.closest("details")?.removeAttribute("open");
    });
  });

  const unique = [...new Map(entries.map((e) => [e.id, e])).values()];
  const setActive = (id) =>
    tocLinks.forEach((link) => {
      if (decodeURIComponent(link.hash.slice(1)) === id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

  unique.forEach(({ id, heading }, i) => {
    const next = unique[i + 1];
    ScrollTrigger.create({
      trigger: heading,
      start: "top 35%",
      endTrigger: next ? next.heading : article,
      end: next ? "top 35%" : "bottom 35%",
      onToggle: (self) => self.isActive && setActive(id),
    });
  });

  // Arriving on a #hash: the smooth-scroll layer initialises after the browser's own jump.
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener("load", () => scrollToTarget(target, SCROLL_OFFSET), {
      once: true,
    });
  }
}

intro();
readingProgress();
contents();
sectionReveals();
contactActions();
