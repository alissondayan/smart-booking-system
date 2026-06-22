export function formatDateTime(value: string, timeZone = "UTC", locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}
