const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** e.g. 23 OCT 2026 */
export const formatDate = (value: string | Date) =>
  dateFormat.format(new Date(value)).replace(/,/g, "").toUpperCase();
