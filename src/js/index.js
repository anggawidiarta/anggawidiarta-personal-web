import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const toContactButtons = document.querySelectorAll(".contact-scroll");
const footer = document.getElementById("js-footer");
const homeEl = document.querySelector(".home");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);

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

// Smooth scrolling is skipped entirely for visitors who ask for reduced motion.
const scroll = reduceMotion
  ? null
  : new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.1,
      },
      scrollCallback: () => {
        ScrollTrigger.update();
        updateParallax();
      },
      // Drive Lenis from GSAP's ticker so ScrollTrigger and smooth scroll stay in sync
      initCustomTicker: (render) => gsap.ticker.add(render),
      destroyCustomTicker: (render) => gsap.ticker.remove(render),
    });
gsap.ticker.lagSmoothing(0);

if (reduceMotion) window.addEventListener("scroll", updateParallax, { passive: true });

const refreshLayout = () => {
  scroll?.resize();
  ScrollTrigger.refresh();
  updateParallax();
};

setTimeout(refreshLayout, 1000);
window.addEventListener("load", refreshLayout);
window.addEventListener("resize", updateParallax);

export default class Home {
  constructor(scroll) {
    this.locomotive = scroll;
    this.heroTextAnimation();
    this.homeIntro();
    this.homeAnimations();
    this.homeActions();
  }

  homeActions() {
    toContactButtons.forEach((button) => {
      button.onclick = () => {
        if (this.locomotive) this.locomotive.scrollTo(footer);
        else footer.scrollIntoView();
      };
    });
  }

  homeIntro() {
    if (reduceMotion) {
      gsap.set(homeEl, { autoAlpha: 1 });
      return;
    }

    const tl = gsap.timeline();

    gsap.to(homeEl, {
      autoAlpha: 1,
    });

    tl.from(".home__nav", {
      duration: 0.5,
      delay: 0.3,
      opacity: 0,
      yPercent: -100,
      ease: "power4.out",
    })
      .from(".hero__title [title-overflow]", {
        duration: 0.7,
        yPercent: 100,
        stagger: {
          amount: 0.2,
        },
        ease: "power4.out",
      })
      .from(
        ".hero__title .bottom__right",
        {
          duration: 1,
          yPercent: 100,
          opacity: 0,
          ease: "power4.out",
        },
        "<20%"
      )
      .set(".hero__title .overflow", { overflow: "unset" })
      .from(
        ".hero__title .mobile",
        {
          duration: 0.7,
          yPercent: 100,
          stagger: {
            amount: 0.2,
          },
          ease: "power4.out",
        },
        "-=1.4"
      );
  }

  homeAnimations() {
    gsap.to(".home__projects__line", { autoAlpha: 1, duration: reduceMotion ? 0 : 0.4 });
    if (reduceMotion) return;

    gsap.utils.toArray(".home__projects__line").forEach((el) => {
      const line = el.querySelector("span");
      gsap.from(line, {
        duration: 1.1,
        scrollTrigger: {
          trigger: el,
        },
        scaleX: 0,
        ease: "power3.out",
      });
    });

    gsap.utils.toArray("[data-fade-in]").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
        },
        duration: 0.9,
        y: 20,
        opacity: 0,
        ease: "power3.out",
      });
    });

    if (window.innerWidth <= 768) {
      gsap.utils.toArray(".home__projects__project").forEach((el) => {
        const text = el.querySelector(".title__main");
        const link = el.querySelector(".project__link");
        gsap.from([text, link], {
          scrollTrigger: {
            trigger: el,
          },
          duration: 1,
          yPercent: 100,
          stagger: {
            amount: 0.2,
          },
          ease: "power3.out",
        });
      });

      const awardsTl = gsap.timeline({
        defaults: {
          ease: "power1.out",
        },
        scrollTrigger: {
          trigger: ".home__awards",
        },
      });
      awardsTl.from(".awards__title span", {
        duration: 1,
        opacity: 0,
        yPercent: 100,
        stagger: {
          amount: 0.2,
        },
      });
    }
  }

  heroTextAnimation() {
    if (reduceMotion) return;

    gsap.to(".hero__title__dash.desktop", {
      scrollTrigger: {
        trigger: ".hero__title",
        scrub: true,
        start: "-8% 9%",
        end: "110% 20%",
      },
      scaleX: 4,
      ease: "none",
    });
  }
}

new Home(scroll);
