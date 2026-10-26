import { z } from "astro/zod";

export type FieldType = "text" | "textarea" | "url" | "email" | "year";

export interface Field {
  name: string;
  label: string;
  type?: FieldType;
  maxLength: number;
  required?: boolean;
  hint?: string;
  rows?: number;
}

type Row = Record<string, unknown>;

export const formText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export interface Section {
  slug: string;
  table: string;
  title: string;
  singular: string;
  fields: Field[];
  summary: (row: Row) => { primary: string; secondary: string };
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const joined = (...parts: unknown[]) => parts.filter(Boolean).join(" · ");

const yearField = (hint: string): Field => ({
  name: "year",
  label: "Year",
  type: "year",
  maxLength: 4,
  hint,
});

export const SECTIONS: Section[] = [
  {
    slug: "projects",
    table: "projects",
    title: "Projects",
    singular: "Project",
    fields: [
      {
        name: "title",
        label: "Title",
        maxLength: 160,
        required: true,
        hint: "Shown in capitals, e.g. INSIDE UMKM — WEB PLATFORM FOR SMEs.",
      },
      {
        name: "category",
        label: "Category",
        maxLength: 40,
        required: true,
        hint: "e.g. Web development",
      },
      {
        name: "technology",
        label: "Technology",
        maxLength: 60,
        required: true,
        hint: "e.g. Next.js & Laravel",
      },
      {
        name: "url",
        label: "Link",
        type: "url",
        maxLength: 500,
        required: true,
        hint: "A GitHub link shows “View code”, anything else “View site”.",
      },
      yearField("Optional. Shown under the project number."),
    ],
    summary: (row) => ({
      primary: text(row.title),
      secondary: joined(row.category, row.technology, row.year),
    }),
  },
  {
    slug: "experience",
    table: "experiences",
    title: "Experience",
    singular: "Role",
    fields: [
      { name: "role", label: "Role", maxLength: 120, required: true },
      { name: "organization", label: "Organization", maxLength: 120, required: true },
      {
        name: "period",
        label: "Period",
        maxLength: 40,
        hint: "Optional, e.g. 2023 — Now. Shown right-aligned.",
      },
    ],
    summary: (row) => ({
      primary: text(row.role),
      secondary: joined(row.organization, row.period),
    }),
  },
  {
    slug: "certifications",
    table: "certifications",
    title: "Certifications",
    singular: "Certification",
    fields: [
      { name: "name", label: "Name", maxLength: 160, required: true },
      { name: "issuer", label: "Issuer", maxLength: 80, hint: "Optional, e.g. Microsoft" },
      {
        name: "credential_url",
        label: "Credential link",
        type: "url",
        maxLength: 500,
        hint: "Optional. With a link, the row opens the credential.",
      },
      yearField("Optional."),
    ],
    summary: (row) => ({ primary: text(row.name), secondary: joined(row.issuer, row.year) }),
  },
  {
    slug: "socials",
    table: "social_links",
    title: "Social links",
    singular: "Link",
    fields: [
      {
        name: "label",
        label: "Label",
        maxLength: 24,
        required: true,
        hint: "Shown in the footer pills, e.g. GITHUB",
      },
      { name: "url", label: "Link", type: "url", maxLength: 500, required: true },
    ],
    summary: (row) => ({
      primary: text(row.label),
      secondary: text(row.url).replace(/^https:\/\//, ""),
    }),
  },
];

export const findSection = (slug: string | undefined) => SECTIONS.find((s) => s.slug === slug);

export const PROFILE_FIELDS: Field[] = [
  {
    name: "about",
    label: "About",
    type: "textarea",
    rows: 4,
    maxLength: 600,
    required: true,
    hint: "The paragraph beside the hero.",
  },
  {
    name: "availability",
    label: "Availability",
    type: "textarea",
    rows: 2,
    maxLength: 80,
    hint: "The nav line. Each line here is a line there. Leave empty to hide it.",
  },
  {
    name: "interests",
    label: "Interests",
    type: "textarea",
    rows: 4,
    maxLength: 600,
    hint: "Leave empty to hide the Interests block.",
  },
];

export const CONTACT_FIELDS: Field[] = [
  { name: "contact_email", label: "Email", type: "email", maxLength: 200, required: true },
  {
    name: "email_subject",
    label: "Email subject",
    maxLength: 120,
    hint: "Prefilled when a visitor clicks the marquee or “Write an email”.",
  },
  { name: "email_body", label: "Email body", type: "textarea", rows: 4, maxLength: 1000 },
  {
    name: "marquee_text",
    label: "Marquee text",
    maxLength: 200,
    required: true,
    hint: "The scrolling line above the email address.",
  },
];

const HTTPS = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const blankToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

function fieldSchema(field: Field) {
  if (field.type === "year") {
    return z.preprocess(
      blankToNull,
      z.coerce
        .number()
        .int("Use a four-digit year")
        .min(1990, "Use a year from 1990 on")
        .max(2100, "Use a four-digit year")
        .nullable(),
    );
  }

  let schema = z
    .string({ error: `${field.label} is required` })
    .trim()
    .max(field.maxLength, `Keep it under ${field.maxLength} characters`);
  if (field.type === "url") schema = schema.regex(HTTPS, "Use a full link starting with https://");
  if (field.type === "email") schema = schema.regex(EMAIL, "Use a valid email address");

  // Optional text is stored as null; profile text columns are not nullable, so they keep "".
  return z.preprocess(blankToNull, field.required ? schema : schema.nullable());
}

const formSchema = (fields: Field[]) =>
  z.object(Object.fromEntries(fields.map((field) => [field.name, fieldSchema(field)])));

export type FieldErrors = Record<string, string>;

/** Validates the submitted fields; values come back as typed so a failed form keeps them. */
export function parseFields(fields: Field[], form: FormData) {
  const values = Object.fromEntries(
    fields.map((field) => [field.name, formText(form.get(field.name))]),
  );
  const result = formSchema(fields).safeParse(values);
  const errors: FieldErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const name = String(issue.path[0] ?? "");
      errors[name] ??= issue.message;
    }
  }
  return { values, data: result.success ? (result.data as Row) : null, errors };
}

export const SITE_NOTICES: Record<string, { text: string; tone: "success" | "info" | "error" }> = {
  "site-triggered": {
    text: "Publishing. The site is rebuilding; changes appear in a minute or two.",
    tone: "success",
  },
  "site-skipped": {
    text: "The rebuild hook is not configured, so changes go live with your next deploy.",
    tone: "info",
  },
  "site-failed": {
    text: "The rebuild could not be started. Try again, or redeploy from Vercel.",
    tone: "error",
  },
};

/** A redirect target from a form, limited to Studio pages so it can't send the admin elsewhere. */
export function studioPath(value: FormDataEntryValue | null, origin: string) {
  try {
    const url = new URL(formText(value), origin);
    if (
      url.origin === origin &&
      (url.pathname === "/studio" || url.pathname.startsWith("/studio/"))
    ) {
      url.searchParams.delete("notice");
      return `${url.pathname}${url.search}`;
    }
  } catch { }
  return "/studio";
}

export const withNotice = (path: string, notice: string) =>
  `${path}${path.includes("?") ? "&" : "?"}notice=${notice}`;

type Tone = "success" | "info" | "error";

export function sectionNotice(
  section: Section,
  key: string | null,
): { text: string; tone: Tone } | null {
  const name = section.singular;
  const notices: Record<string, { text: string; tone: Tone }> = {
    added: { text: `${name} added. Publish the site to put it live.`, tone: "success" },
    saved: { text: `${name} saved. Publish the site to put it live.`, tone: "success" },
    deleted: { text: `${name} deleted. Publish the site to take it down.`, tone: "success" },
    moved: { text: "Order updated.", tone: "success" },
    hidden: {
      text: `${name} hidden. Publish the site to take it off the homepage.`,
      tone: "success",
    },
    shown: {
      text: `${name} shown. Publish the site to put it back on the homepage.`,
      tone: "success",
    },
    failed: { text: "Couldn't apply that change. Try again.", tone: "error" },
  };
  return (key && notices[key]) || null;
}
