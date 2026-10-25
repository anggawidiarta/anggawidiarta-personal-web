import { marked } from "marked";
import {
  MAX_SLUG_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_UPLOAD_BYTES,
  SLUG,
  slugify,
} from "../../lib/studio/rules";
import { toast } from "../studio-toast";

const AUTOSAVE_MS = 1500;

const root = document.querySelector("[data-editor]");
if (root) init(root);

function init(root) {
  const id = root.dataset.postId;
  const live = () => root.dataset.status === "published";
  const $ = (selector) => root.querySelector(selector);

  const field = Object.fromEntries(
    ["title", "slug", "description", "tags", "coverAlt", "body"].map((name) => [
      name,
      $(`[data-field="${name}"]`),
    ]),
  );
  const statusEl = $("[data-save-status]");
  const retryEl = $("[data-retry]");
  const noticeEl = $("[data-notice]");
  const uploadStatus = $("[data-upload-status]");
  const previewEl = $("[data-preview]");
  const previewTitle = $("[data-preview-title]");
  const slugHint = $("[data-slug-hint]");
  const slugError = $('[data-field-error="slug"]');
  const tagsHint = $("[data-tags-hint]");
  const countEl = $("[data-count]");
  const coverPreview = $("[data-cover-preview]");
  const coverFile = $("[data-cover-file]");
  const bodyFile = $("[data-body-file]");

  let coverPath = root.dataset.coverPath || null;
  let slugFollowsTitle = root.dataset.slugFollowsTitle === "true";
  let revision = 0;
  let savedRevision = 0;
  let saving = false;
  let timer;
  let lastError = "";

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const dirty = () => revision !== savedRevision;

  function setStatus(state, message = "") {
    const prefix = live() ? "Live · " : "";
    const text = {
      saved: live() ? "Live" : "Saved",
      saving: `${prefix}Saving…`,
      unsaved: `${prefix}Unsaved changes`,
      error: message || "Couldn't save",
    }[state];
    statusEl.textContent = text;
    statusEl.dataset.state = state;
    retryEl.hidden = state !== "error";
  }

  function showNotice(message) {
    noticeEl.textContent = message;
  }

  function parseTags() {
    const seen = new Set();
    return field.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (!tag || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function validateTags() {
    const tags = parseTags();
    const tooMany = tags.length > MAX_TAGS;
    const tooLong = tags.some((tag) => tag.length > MAX_TAG_LENGTH);
    tagsHint.textContent = tooMany
      ? `Use up to ${MAX_TAGS} tags.`
      : tooLong
        ? `Each tag can be up to ${MAX_TAG_LENGTH} characters.`
        : `Separate with commas. Up to ${MAX_TAGS}.`;
    return !tooMany && !tooLong;
  }

  function validateSlug() {
    const value = field.slug.value;
    const ok = SLUG.test(value) && value.length <= MAX_SLUG_LENGTH;
    slugError.textContent = ok ? "" : "Use lowercase letters, numbers and single hyphens.";
    field.slug.setAttribute("aria-invalid", ok ? "false" : "true");
    if (ok && !live()) slugHint.textContent = `Address: /journal/${value}`;
    return ok;
  }

  let previewTimer;
  function renderPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      previewTitle.textContent = field.title.value || "Untitled";
      previewEl.innerHTML = marked.parse(field.body.value || "", { gfm: true });
    }, 150);
  }

  function collect() {
    const payload = {
      description: field.description.value,
      body: field.body.value,
      coverPath,
      coverAlt: field.coverAlt.value.trim() || null,
    };
    // Skip fields that are mid-edit and invalid; the status line says why.
    if (field.title.value.trim()) payload.title = field.title.value;
    if (validateSlug()) payload.slug = field.slug.value;
    if (validateTags()) payload.tags = parseTags();
    return payload;
  }

  function changed() {
    revision += 1;
    setStatus("unsaved");
    renderPreview();
    if (!live()) {
      clearTimeout(timer);
      timer = setTimeout(() => save(), AUTOSAVE_MS);
    }
  }

  async function save({ liveUpdate = false } = {}) {
    clearTimeout(timer);
    while (saving) await sleep(60);
    if (!liveUpdate && !dirty()) return { ok: true };

    saving = true;
    const sent = revision;
    setStatus("saving");
    try {
      const response = await fetch(`/studio/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liveUpdate ? { ...collect(), live: true } : collect()),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.field === "slug") slugError.textContent = data.error;
        lastError =
          response.status === 401
            ? "Session expired. Sign in again"
            : data.error || "Couldn't save";
        setStatus("error", lastError);
        return { ok: false, data };
      }

      slugError.textContent = "";
      savedRevision = sent;
      if (dirty()) {
        setStatus("unsaved");
        if (!live()) timer = setTimeout(() => save(), AUTOSAVE_MS);
      } else {
        setStatus("saved");
      }
      return { ok: true, data };
    } catch {
      lastError = "Couldn't save. Check your connection";
      setStatus("error", lastError);
      return { ok: false };
    } finally {
      saving = false;
    }
  }

  async function upload(file, kind) {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images can be up to 4 MB. Resize it and try again.");
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    form.append("postId", id);
    const response = await fetch("/studio/api/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Couldn't upload the image.");
    return data;
  }

  function insertAtCursor(textarea, text, selectFrom = 0, selectTo = 0) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const lead = before && !before.endsWith("\n") ? "\n\n" : "";
    textarea.setRangeText(`${lead}${text}\n`, start, end, "end");
    if (selectTo > selectFrom) {
      const base = start + lead.length;
      textarea.setSelectionRange(base + selectFrom, base + selectTo);
    }
    textarea.focus();
    changed();
  }

  async function insertImages(files) {
    for (const file of files) {
      uploadStatus.textContent = `Uploading ${file.name}…`;
      try {
        const { url } = await upload(file, "body");
        const alt = "Describe the image";
        insertAtCursor(field.body, `![${alt}](${url})`, 2, 2 + alt.length);
        uploadStatus.textContent = "Image added. Replace the alt text.";
      } catch (error) {
        uploadStatus.textContent = error.message;
      }
    }
  }

  const imagesFrom = (list) => [...(list ?? [])].filter((file) => file.type.startsWith("image/"));

  field.body.addEventListener("paste", (event) => {
    const files = imagesFrom(event.clipboardData?.files);
    if (!files.length) return;
    event.preventDefault();
    insertImages(files);
  });
  field.body.addEventListener("dragover", (event) => {
    if (imagesFrom(event.dataTransfer?.files).length || event.dataTransfer?.types.includes("Files")) {
      event.preventDefault();
    }
  });
  field.body.addEventListener("drop", (event) => {
    const files = imagesFrom(event.dataTransfer?.files);
    if (!files.length) return;
    event.preventDefault();
    insertImages(files);
  });
  bodyFile.addEventListener("change", () => {
    insertImages(imagesFrom(bodyFile.files));
    bodyFile.value = "";
  });

  function showCover(url) {
    coverPreview.hidden = !url;
    if (url) coverPreview.src = url;
    $('[data-action="cover-remove"]').hidden = !url;
    $('[data-action="cover-upload"]').querySelectorAll("span span").forEach((el) => {
      if (!el.children.length) el.textContent = url ? "Replace" : "Upload cover";
    });
  }

  coverFile.addEventListener("change", async () => {
    const [file] = imagesFrom(coverFile.files);
    coverFile.value = "";
    if (!file) return;
    showNotice("Uploading cover…");
    try {
      const { path, url } = await upload(file, "cover");
      coverPath = path;
      showCover(url);
      showNotice("Cover added. Add alt text for it below.");
      changed();
      field.coverAlt.focus();
    } catch (error) {
      showNotice(error.message);
    }
  });

  field.title.addEventListener("input", () => {
    if (slugFollowsTitle) {
      const next = slugify(field.title.value);
      if (next) field.slug.value = next;
      validateSlug();
    }
    changed();
  });
  field.slug.addEventListener("input", () => {
    slugFollowsTitle = false;
    validateSlug();
    changed();
  });
  field.description.addEventListener("input", () => {
    countEl.textContent = String(field.description.value.length);
    changed();
  });
  field.tags.addEventListener("input", () => {
    validateTags();
    changed();
  });
  field.coverAlt.addEventListener("input", changed);
  field.body.addEventListener("input", changed);

  // Save when leaving a field so an edit never waits on the timer.
  root.addEventListener("focusout", (event) => {
    if (live() || !dirty()) return;
    if (event.target instanceof HTMLElement && event.target.matches("[data-field]")) save();
  });

  async function post(url) {
    const response = await fetch(url, { method: "POST" });
    return { ok: response.ok, data: await response.json().catch(() => ({})) };
  }

  // Leaving the page after success keeps the button in its loading state until the new page paints.
  let leaving = false;
  const go = (href) => {
    leaving = true;
    location.href = href;
  };
  const fail = (message) => toast(message, "error");

  const actions = {
    async publish() {
      const saved = await save();
      if (!saved.ok) return fail(lastError || "Couldn't save your changes, so nothing was published.");
      const { ok, data } = await post(`/studio/api/posts/${id}/publish`);
      if (!ok) return fail(data.error || "Couldn't publish. Try again.");
      go(`/studio/posts/${id}?notice=published-${data.rebuild}`);
    },
    async "update-live"() {
      const saved = await save({ liveUpdate: true });
      if (!saved.ok) return fail(lastError || saved.data?.error || "Couldn't update the live article.");
      go(`/studio/posts/${id}?notice=updated-${saved.data?.rebuild ?? "skipped"}`);
    },
    async unpublish() {
      const { ok, data } = await post(`/studio/api/posts/${id}/unpublish`);
      if (!ok) return fail(data.error || "Couldn't unpublish. Try again.");
      // It is a draft now, so pending edits save like any draft (no second rebuild).
      root.dataset.status = "draft";
      const saved = await save();
      if (!saved.ok) return fail("Unpublished, but your last edits did not save. Retry saving.");
      go(`/studio/posts/${id}?notice=unpublished-${data.rebuild}`);
    },
    "cover-upload": () => coverFile.click(),
    "cover-remove"() {
      coverPath = null;
      showCover("");
      changed();
    },
    "body-image": () => bodyFile.click(),
  };

  // Delete needs two deliberate clicks; it reverts on its own after a few seconds.
  const deleteButton = $('[data-action="delete"]');
  let deleteTimer;
  deleteButton.addEventListener("click", async () => {
    if (deleteButton.dataset.armed !== "true") {
      deleteButton.dataset.armed = "true";
      deleteButton.textContent = "Confirm delete";
      showNotice("Click Confirm delete to remove this article for good.");
      deleteTimer = setTimeout(disarm, 4000);
      return;
    }
    clearTimeout(deleteTimer);
    deleteButton.disabled = true;
    const response = await fetch(`/studio/api/posts/${id}`, { method: "DELETE" });
    if (response.ok) {
      savedRevision = revision;
      location.href = "/studio?notice=deleted";
    } else {
      const data = await response.json().catch(() => ({}));
      deleteButton.disabled = false;
      disarm();
      fail(data.error || "Couldn't delete the article.");
    }
  });
  function disarm() {
    deleteButton.dataset.armed = "false";
    deleteButton.textContent = "Delete article";
    if (noticeEl.textContent.startsWith("Click Confirm delete")) showNotice("");
  }

  const BUSY_LABEL = { publish: "Publishing", "update-live": "Updating", unpublish: "Unpublishing" };
  let busy = false;

  function setBusy(button, on) {
    const peers = root.querySelectorAll("[data-action]");
    peers.forEach((el) => (on ? el.setAttribute("aria-disabled", "true") : el.removeAttribute("aria-disabled")));
    const label = BUSY_LABEL[button.dataset.action];
    if (!label) return;
    if (on) {
      button.dataset.loading = "true";
      button.setAttribute("aria-busy", "true");
      button.removeAttribute("aria-disabled");
      button.dataset.idle = button.innerHTML;
      button.innerHTML = `<span class="inline-flex items-center gap-[8px]"><span aria-hidden="true" class="size-[12px] animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:hidden"></span>${label}…</span>`;
    } else {
      delete button.dataset.loading;
      button.removeAttribute("aria-busy");
      button.innerHTML = button.dataset.idle ?? button.innerHTML;
    }
  }

  root.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
    if (!target || target === deleteButton) return;
    const run = actions[target.dataset.action];
    if (!run || busy) return;
    busy = true;
    setBusy(target, true);
    try {
      await run();
    } catch {
      fail("Couldn't reach the server. Check your connection and try again.");
    } finally {
      busy = false;
      if (!leaving) setBusy(target, false);
    }
  });

  retryEl.addEventListener("click", () => save({ liveUpdate: live() }));

  root.querySelectorAll("[data-view-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      root.dataset.view = button.dataset.viewToggle;
      root.querySelectorAll("[data-view-toggle]").forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
    });
  });

  // Ctrl/Cmd+S: drafts save now; a live article must be updated on purpose.
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (live()) showNotice("This article is live. Use Update live to save your changes.");
      else save();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (dirty() || saving) event.preventDefault();
  });

  validateTags();
  renderPreview();
  setStatus("saved");

  if (root.dataset.notice) {
    toast(root.dataset.notice, root.dataset.noticeTone || "info");
    const url = new URL(location.href);
    url.searchParams.delete("notice");
    history.replaceState(null, "", url);
  }
}
