export type ClassValue = string | false | null | undefined;

/** Join conditional Tailwind class names without adding another runtime dependency. */
export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}

export function getInitials(name?: string) {
  if (!name?.trim()) return "PC";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

export function formatTime(value?: string | Date | null) {
  if (!value) return "—";

  if (typeof value === "string" && /^\d{1,2}:\d{2}([\s][AaPp][Mm])?$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
