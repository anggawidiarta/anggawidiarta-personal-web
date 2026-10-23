import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { reduceMotion, refreshLayout } from "../core/scroll";
import { contactActions, sectionReveals } from "../core/reveals";

gsap.registerPlugin(Flip);

const lead = document.querySelector("[data-lead]");
const rows = gsap.utils.toArray("[data-post]");
const targets = lead ? [lead, ...rows] : rows;
const buttons = gsap.utils.toArray("[data-tag-filter]");
const status = document.querySelector("[data-filter-status]");

// The filter needs JS; reveal it only now that it can work.
document.querySelectorAll("[data-js-only]").forEach((el) => (el.hidden = false));

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
    .from("[data-masthead]", {
      duration: 0.8,
      yPercent: 110,
      stagger: { amount: 0.1 },
      ease: "power4.out",
    })
    .from(
      ".blog__intro > *",
      { duration: 0.7, y: 16, opacity: 0, stagger: 0.08, ease: "power3.out" },
      "-=0.5",
    );
}

// Which elements are visible for a topic: the lead stands in for the newest
// article while unfiltered, so its list row is hidden then.
const shows = (el, tag) => {
  if (el === lead) return tag === "all";
  if (tag === "all") return !el.hasAttribute("data-lead-row");
  return el.dataset.tags.split("|").includes(tag);
};
const isShown = (el) => !el.hidden;
const apply = (tag) => targets.forEach((el) => (el.hidden = !shows(el, tag)));

let activeTag = "all";
let pendingRun;

// Stop whatever is animating and snap the list to the tag already chosen, so a
// quick second click always starts from a clean, fully visible list.
function settle() {
  pendingRun = undefined;
  Flip.killFlipsOf(targets);
  gsap.killTweensOf(targets);
  targets.forEach((el) => {
    el.style.removeProperty("opacity");
    el.style.removeProperty("transform");
    el.style.removeProperty("translate");
  });
  apply(activeTag);
}

function setTag(tag, { animate = true, updateUrl = true } = {}) {
  settle();

  buttons.forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.tagFilter === tag)),
  );

  const entering = targets.filter((el) => !isShown(el) && shows(el, tag));
  const leaving = targets.filter((el) => isShown(el) && !shows(el, tag));
  activeTag = tag;

  if (status) {
    const count =
      tag === "all" ? rows.length : rows.filter((el) => shows(el, tag)).length;
    const label = buttons.find((b) => b.dataset.tagFilter === tag)?.dataset.label;
    status.textContent =
      tag === "all"
        ? `Showing all ${count} articles`
        : `Showing ${count} ${count === 1 ? "article" : "articles"}: ${label}`;
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    if (tag === "all") url.searchParams.delete("tag");
    else url.searchParams.set("tag", tag);
    history.replaceState(null, "", url);
  }

  if (!animate || reduceMotion) {
    apply(tag);
    refreshLayout();
    return;
  }

  // Staying items glide to their new positions; entering ones fade in.
  const run = () => {
    const state = Flip.getState(targets.filter(isShown));
    apply(tag);
    if (leaving.length) gsap.set(leaving, { clearProps: "opacity" });
    Flip.from(state, {
      duration: 0.5,
      ease: "power3.out",
      onComplete: refreshLayout,
    });
    if (entering.length) {
      gsap.fromTo(
        entering,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", clearProps: "opacity,transform" },
      );
    }
  };

  if (leaving.length) {
    pendingRun = run;
    gsap.to(leaving, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => pendingRun === run && run(),
    });
  } else {
    run();
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () =>
    setTag(button.dataset.tagFilter, { animate: true }),
  );
});

const initialTag = new URLSearchParams(window.location.search).get("tag");
if (initialTag && buttons.some((b) => b.dataset.tagFilter === initialTag)) {
  setTag(initialTag, { animate: false, updateUrl: false });
}

intro();
sectionReveals();
contactActions();
