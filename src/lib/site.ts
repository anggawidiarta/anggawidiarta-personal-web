// The only module that reads the homepage collections (see src/content.config.ts).
import { getCollection, type CollectionEntry } from "astro:content";

type Ordered = "projects" | "experiences" | "certifications" | "socials";

async function ordered<K extends Ordered>(collection: K) {
  const entries: CollectionEntry<K>[] = await getCollection(collection);
  return entries
    .map((entry): CollectionEntry<K>["data"] => entry.data)
    .sort((a, b) => a.position - b.position);
}

export const getProjects = () => ordered("projects");
export const getExperiences = () => ordered("experiences");
export const getCertifications = () => ordered("certifications");
export const getSocials = () => ordered("socials");

export type Profile = CollectionEntry<"settings">["data"];

const EMPTY_PROFILE: Profile = {
  about: "",
  availability: "",
  interests: "",
  contact_email: "",
  email_subject: "",
  email_body: "",
  marquee_text: "",
};

// Empty only in dev without Supabase credentials; a production build fails earlier.
export async function getProfile(): Promise<Profile> {
  const [entry] = await getCollection("settings");
  return entry?.data ?? EMPTY_PROFILE;
}

export const mailtoLink = ({ contact_email, email_subject, email_body }: Profile) => {
  const params = Object.entries({ subject: email_subject, body: email_body })
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `mailto:${contact_email}${params ? `?${params}` : ""}`;
};

/** Multi-line Studio text (e.g. the availability line) as separate lines. */
export const lines = (text: string) => text.split(/\r?\n/).filter((line) => line.trim());
