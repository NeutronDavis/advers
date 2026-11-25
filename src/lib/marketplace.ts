export const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Available now",
  BUSY: "Limited availability",
  UNAVAILABLE: "Unavailable",
};

export function availabilityBadgeClass(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "badge badge-success badge-sm";
    case "BUSY":
      return "badge badge-warning badge-sm";
    case "UNAVAILABLE":
      return "badge badge-ghost badge-sm";
    default:
      return "badge badge-ghost badge-sm";
  }
}

export function slugifyHandle(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "booster";
}

export function displayHandle(handle: string | null, id: string): string {
  return handle || id;
}

export const MARKETPLACE_PAGE_SIZE = 12;
