import type { ImageMetadata } from "astro";

const bundled = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/design/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

export const BUNDLED_PREFIX = "bundled:";

/**
 * Design-work images seeded before the CMS ship with the site (`bundled:<file>`), so
 * they keep build-time optimisation without a manual upload. Anything else is already
 * a remote URL.
 */
export function resolveDesignImage(path: string | null): ImageMetadata | string | null {
  if (!path?.startsWith(BUNDLED_PREFIX)) return path;
  const file = path.slice(BUNDLED_PREFIX.length);
  return bundled[`../assets/design/${file}`]?.default ?? null;
}
