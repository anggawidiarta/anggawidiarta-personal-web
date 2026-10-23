import { z } from "astro/zod";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Only paths the upload endpoint produces: <covers|body>/<post id>/<file id>.<ext>
const COVER_PATH =
  /^(covers|body)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|avif|gif)$/;

export const MAX_TAGS = 8;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const;

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120)
    .replace(/-$/, "");

/** A draft's placeholder slug, replaced from the title until the author edits it. */
export const draftSlug = () => `untitled-${crypto.randomUUID().slice(0, 6)}`;

const tag = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .regex(/^[^,|]+$/, "Tags cannot contain commas or pipes");

/** Fields the editor may change. Every field is optional so autosave can send a subset. */
export const postPatch = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z.string().regex(SLUG, "Use lowercase letters, numbers and single hyphens").max(120),
    description: z.string().trim().max(200, "Keep the description under 200 characters"),
    body: z.string().max(200_000),
    tags: z.array(tag).max(MAX_TAGS),
    coverPath: z.string().regex(COVER_PATH, "Invalid cover image").nullable(),
    coverAlt: z.string().trim().max(200).nullable(),
    /** Explicit "Update live": allows editing a published article and rebuilds the site. */
    live: z.boolean(),
  })
  .partial()
  .strict();

export type PostPatch = z.infer<typeof postPatch>;

/** Maps editor field names to database columns. */
export function toColumns(patch: PostPatch) {
  const columns: Record<string, unknown> = {};
  if (patch.title !== undefined) columns.title = patch.title;
  if (patch.slug !== undefined) columns.slug = patch.slug;
  if (patch.description !== undefined) columns.description = patch.description;
  if (patch.body !== undefined) columns.body = patch.body;
  if (patch.tags !== undefined) columns.tags = [...new Set(patch.tags)];
  if (patch.coverPath !== undefined) columns.cover_path = patch.coverPath;
  if (patch.coverAlt !== undefined) columns.cover_alt = patch.coverAlt;
  return columns;
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** First readable message from a zod error, e.g. for an inline field hint. */
export const firstIssue = (error: z.ZodError) => {
  const issue = error.issues[0];
  return issue ? { field: String(issue.path[0] ?? ""), message: issue.message } : null;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** e.g. 23 OCT 2026 */
export const formatStudioDate = (value: string | Date) =>
  dateFormat.format(new Date(value)).replace(/,/g, "").toUpperCase();

/** "a", "a and b", "a, b and c" */
export const joinList = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
