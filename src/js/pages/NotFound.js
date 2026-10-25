import gsap from "gsap";
import { reduceMotion } from "../core/scroll";
import { contactActions, sectionReveals } from "../core/reveals";

const requested = document.querySelector("[data-requested]");
const path = `${location.pathname}${location.search}`;
if (requested && path !== "/404" && path !== "/404/") {
  requested.textContent = path.length > 80 ? `${path.slice(0, 80)}…` : path;
  requested.hidden = false;
}

function intro() {
  if (reduceMotion) return;

  gsap.from(".home__nav", {
    duration: 0.5,
    delay: 0.2,
    opacity: 0,
    yPercent: -100,
    ease: "power4.out",
  });
  gsap
    .timeline({ delay: 0.2 })
    .from("[data-digits]", { duration: 0.8, yPercent: 110, ease: "power4.out" })
    .from(".not-found__strike", { duration: 0.9, scaleX: 0, ease: "power3.out" }, "-=0.2")
    .from(
      ".not-found__intro > *",
      { duration: 0.7, y: 16, opacity: 0, stagger: 0.08, ease: "power3.out" },
      "-=0.6",
    );
}

intro();
sectionReveals();
contactActions();
