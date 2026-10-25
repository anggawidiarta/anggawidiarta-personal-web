import { IMAGE_EXTENSIONS, MAX_UPLOAD_BYTES } from "./rules";

export type ImageType = keyof typeof IMAGE_EXTENSIONS;

/** Identifies the real format from the first bytes; the declared type is not trusted. */
export function sniffImage(bytes: Uint8Array): ImageType | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

export interface DesignImageInput {
  alt: string;
  /** The image the item keeps when no new file is uploaded (null once removed). */
  kept: string | null;
  file: { bytes: Uint8Array; type: ImageType } | null;
  errors: Record<string, string>;
}

/** Reads and checks the image half of a design-work form. Nothing is uploaded here. */
export async function readDesignImage(form: FormData, currentPath: string | null): Promise<DesignImageInput> {
  const alt = String(form.get("image_alt") ?? "").trim();
  const kept = form.get("remove_image") === "on" ? null : currentPath;
  const upload = form.get("image");
  const errors: Record<string, string> = {};
  let file: DesignImageInput["file"] = null;

  if (upload instanceof File && upload.size > 0) {
    if (upload.size > MAX_UPLOAD_BYTES) {
      errors.image = "Images can be up to 4 MB. Resize it and choose it again.";
    } else {
      const bytes = new Uint8Array(await upload.arrayBuffer());
      const type = sniffImage(bytes);
      if (type) file = { bytes, type };
      else errors.image = "Use a JPEG, PNG, WebP, AVIF or GIF image.";
    }
  }

  const hasImage = Boolean(file || kept || errors.image);
  if (hasImage && !alt) errors.image_alt = "Describe the image for visitors who can't see it.";
  else if (alt.length > 200) errors.image_alt = "Keep it under 200 characters";

  return { alt, kept, file, errors };
}

export const imagePath = (folder: string, type: ImageType) =>
  `${folder}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[type]}`;
