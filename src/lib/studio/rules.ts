export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SLUG_LENGTH = 120;
export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 30;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
} as const;

export const IMAGE_ACCEPT = Object.keys(IMAGE_EXTENSIONS).join(",");

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-$/, "");

export const mediaUrl = (supabaseUrl: string, path: string) =>
  `${supabaseUrl}/storage/v1/object/public/blog-media/${path}`;
