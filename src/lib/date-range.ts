export type DateRangeKey = "7d" | "30d" | "90d" | "this_month";

export const DATE_RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "this_month", label: "This month" },
];

export function normalizeDateRange(range?: string): DateRangeKey {
  if (range === "7d" || range === "90d" || range === "this_month") return range;
  return "30d";
}

export function parseDateRange(range: string = "30d"): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const endDate = now;

  if (range === "7d") {
    return {
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate,
    };
  }
  if (range === "90d") {
    return {
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      endDate,
    };
  }
  if (range === "this_month") {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate,
    };
  }

  return {
    startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    endDate,
  };
}
