const ICONS = {
  success: '<path d="M4 12.5l5 5L20 6.5"/>',
  error: '<path d="M12 7v6M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
  info: '<path d="M12 11v6M12 7h.01"/><circle cx="12" cy="12" r="9"/>',
};
const TITLES = { success: "Success", error: "Something went wrong", info: "Note" };
const DURATION = { success: 6000, info: 8000, error: 0 };

const tone = {
  success: "border-gold text-gold",
  error: "border-ash text-ash",
  info: "border-boulder text-boulder",
};

function dismiss(el) {
  if (el.dataset.leaving) return;
  el.dataset.leaving = "true";
  el.style.transition = "opacity 0.25s ease-out, transform 0.25s ease-out";
  el.style.opacity = "0";
  el.style.transform = "translateY(0.8rem)";
  setTimeout(() => el.remove(), 260);
}

/**
 * Show a Studio notification. Errors stay until dismissed; others close on their own.
 * @param {string} message
 * @param {"success" | "error" | "info"} [kind]
 */
export function toast(message, kind = "info") {
  const region = document.querySelector("[data-toaster]");
  if (!region || !message) return;

  const el = document.createElement("div");
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  el.className = `pointer-events-auto flex animate-toast-in items-start gap-[1.2rem] border-2 bg-ink p-[1.4rem] font-sauce motion-reduce:animate-none ${tone[kind]}`;
  el.innerHTML = `
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-[1px] shrink-0">${ICONS[kind]}</svg>
    <div class="min-w-0 flex-1">
      <p class="text-[12px] leading-[1.3] uppercase"></p>
      <p class="mt-[4px] text-[max(14px,1.5rem)] leading-[1.4] text-ash [word-break:break-word]"></p>
    </div>
    <button type="button" aria-label="Dismiss notification" class="-m-[4px] cursor-pointer p-[4px] text-boulder transition-colors duration-200 fine:hover:text-gold">
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>`;
  const [title, body] = el.querySelectorAll("p");
  title.textContent = TITLES[kind];
  body.textContent = message;
  el.querySelector("button").addEventListener("click", () => dismiss(el));

  // Keep the stack short: a new toast replaces the oldest beyond three.
  while (region.children.length >= 3) region.firstElementChild.remove();
  region.append(el);

  if (DURATION[kind]) setTimeout(() => dismiss(el), DURATION[kind]);
}
