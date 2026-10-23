// Progressive enhancement for the sign-in form. Everything here is optional:
// without JS the form still posts and the password field stays masked.

const form = document.querySelector("[data-login-form]");
const submit = form?.querySelector("[data-submit]");
const password = form?.querySelector("#password");
const toggle = form?.querySelector("[data-toggle-password]");
const capsHint = form?.querySelector("[data-caps-hint]");

if (form && submit && password) {
  // Only the leaf spans hold text; the wrapper spans must keep their children.
  const labels = [...submit.querySelectorAll("span")].filter((el) => !el.children.length);
  const idleLabels = [...labels].map((el) => el.textContent);

  const setBusy = (busy) => {
    if (busy) submit.setAttribute("aria-disabled", "true");
    else submit.removeAttribute("aria-disabled");
    labels.forEach((el, i) => (el.textContent = busy ? "Signing in…" : idleLabels[i]));
  };

  // One submission at a time: a second click while the first is in flight is ignored.
  form.addEventListener("submit", (event) => {
    if (submit.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }
    setBusy(true);
  });

  // Back/forward cache can restore the page in its busy state.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) setBusy(false);
  });

  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      const show = password.type === "password";
      password.type = show ? "text" : "password";
      toggle.textContent = show ? "Hide" : "Show";
      toggle.setAttribute("aria-pressed", String(show));
    });
  }

  if (capsHint) {
    const update = (event) => {
      const on = event.getModifierState?.("CapsLock") ?? false;
      capsHint.textContent = on ? "Caps Lock is on" : "";
    };
    password.addEventListener("keydown", update);
    password.addEventListener("keyup", update);
    password.addEventListener("blur", () => (capsHint.textContent = ""));
  }
}
