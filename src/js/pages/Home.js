import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reduceMotion } from "../core/scroll";
import { contactActions, sectionReveals } from "../core/reveals";

gsap.registerPlugin(ScrollTrigger);

const homeEl = document.querySelector(".home");

class Home {
  constructor() {
    this.heroTextAnimation();
    this.homeIntro();
    sectionReveals();
    this.mobileReveals();
    contactActions();
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

  mobileReveals() {
    if (reduceMotion || window.innerWidth > 768) return;

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

new Home();
