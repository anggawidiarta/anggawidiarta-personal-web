import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reduceMotion, scrollToTarget } from "./scroll";

gsap.registerPlugin(ScrollTrigger);

export function contactActions() {
  const footer = document.getElementById("js-footer");
  document.querySelectorAll(".contact-scroll").forEach((button) => {
    button.onclick = () => scrollToTarget(footer);
  });
}

export function sectionReveals(scope = document) {
  gsap.to(scope.querySelectorAll(".home__projects__line"), {
    autoAlpha: 1,
    duration: reduceMotion ? 0 : 0.4,
  });
  if (reduceMotion) return;

  gsap.utils.toArray(".home__projects__line", scope).forEach((el) => {
    const line = el.querySelector("span");
    gsap.from(line, {
      duration: 1.1,
      scrollTrigger: { trigger: el },
      scaleX: 0,
      ease: "power3.out",
    });
  });

  gsap.utils.toArray("[data-rise]", scope).forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 90%" },
      duration: 0.9,
      yPercent: 110,
      ease: "power4.out",
    });
  });

  gsap.utils.toArray("[data-fade-in]", scope).forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el },
      duration: 0.9,
      y: 20,
      opacity: 0,
      ease: "power3.out",
    });
  });
}
