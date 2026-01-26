export function formatDate(d?: string | number | Date, locale?: string) {
  if (!d) return "";
  const date = new Date(d);
  const loc =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  const datePart = date.toLocaleDateString(loc, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(loc, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}
