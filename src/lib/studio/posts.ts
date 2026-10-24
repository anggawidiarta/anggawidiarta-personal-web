import { z } from "astro/zod";
import { MAX_SLUG_LENGTH, MAX_TAG_LENGTH, MAX_TAGS, SLUG } from "./rules";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only paths the upload endpoint produces: <covers|body>/<post id>/<file id>.<ext>
const COVER_PATH =
  /^(covers|body)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|avif|gif)$/;

/** A draft's placeholder slug, replaced from the title until the author edits it. */
export const draftSlug = () => `untitled-${crypto.randomUUID().slice(0, 6)}`;

const tag = z
  .string()
  .trim()
  .min(1)
  .max(MAX_TAG_LENGTH)
  .regex(/^[^,|]+$/, "Tags cannot contain commas or pipes");

/** Fields the editor may change. Every field is optional so autosave can send a subset. */
export const postPatch = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z
      .string()
      .regex(SLUG, "Use lowercase letters, numbers and single hyphens")
      .max(MAX_SLUG_LENGTH),
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

export const firstIssue = (error: z.ZodError) => {
  const issue = error.issues[0];
  return issue ? { field: String(issue.path[0] ?? ""), message: issue.message } : null;
};

/** "a", "a and b", "a, b and c" */
export const joinList = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
