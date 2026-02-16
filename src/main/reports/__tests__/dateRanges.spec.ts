import { describe, it, expect } from "vitest";
import { computeReportDateRange } from "../dateRanges";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

/* ────────────────────────────────────────────────────────────────
   Helper: build a Date at a specific date/time quickly.
   month is 1-based for readability (1 = Jan … 12 = Dec).
   ──────────────────────────────────────────────────────────────── */
function d(year: number, month: number, day: number, hour = 0, min = 0): Date {
  return new Date(year, month - 1, day, hour, min);
}

/* ================================================================
   SHARED: unknown types
   ================================================================ */
describe("computeReportDateRange – unknown type", () => {
  it("returns shouldRun=false for unknown type", () => {
    const result = computeReportDateRange(
      "biweekly",
      d(2026, 2, 9, 10, 0),
      null,
    );
    expect(result.shouldRun).toBe(false);
  });
});

/* ================================================================
   DAILY
   ================================================================ */
describe("computeReportDateRange – daily", () => {
  it("should run any time and send previous day", () => {
    const now = d(2026, 2, 9, 10, 0); // Monday 10:00
    const result = computeReportDateRange("daily", now, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfDay(d(2026, 2, 8)));
    expect(result.to).toEqual(endOfDay(d(2026, 2, 8)));
  });

  it("should NOT run if already ran for previous day", () => {
    const now = d(2026, 2, 9, 10, 0);
    const lastRun = endOfDay(d(2026, 2, 8));
    const result = computeReportDateRange("daily", now, lastRun);
    expect(result.shouldRun).toBe(false);
  });
});

/* ================================================================
   WEEKLY
   ================================================================ */
describe("computeReportDateRange – weekly", () => {
  // 2026-02-09 is a Monday
  const monday = d(2026, 2, 9, 10, 0);
  const tuesday = d(2026, 2, 10, 10, 0);

  it("should run on Monday for previous week", () => {
    const result = computeReportDateRange("weekly", monday, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(
      startOfWeek(d(2026, 2, 2), { weekStartsOn: 1 }),
    );
    expect(result.to).toEqual(endOfWeek(d(2026, 2, 8), { weekStartsOn: 1 }));
  });

  it("should NOT run on other weekdays", () => {
    const result = computeReportDateRange("weekly", tuesday, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran for previous week", () => {
    const lastRun = endOfWeek(d(2026, 2, 8), { weekStartsOn: 1 });
    const result = computeReportDateRange("weekly", monday, lastRun);
    expect(result.shouldRun).toBe(false);
  });
});

/* ================================================================
   MONTHLY
   ================================================================ */
describe("computeReportDateRange – monthly", () => {
  it("should run on the 1st for previous month", () => {
    const now = d(2026, 3, 1, 10, 0);
    const result = computeReportDateRange("monthly", now, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfMonth(d(2026, 2, 1)));
    expect(result.to).toEqual(endOfMonth(d(2026, 2, 1)));
  });

  it("should NOT run on a non-1st day", () => {
    const now = d(2026, 2, 15, 10, 0);
    const result = computeReportDateRange("monthly", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran for previous month", () => {
    const now = d(2026, 3, 1, 10, 0);
    const lastRun = endOfMonth(d(2026, 2, 1));
    const result = computeReportDateRange("monthly", now, lastRun);
    expect(result.shouldRun).toBe(false);
  });
});

/* ================================================================
   YEARLY
   ================================================================ */
describe("computeReportDateRange – yearly", () => {
  it("should run on Jan 1 for previous year", () => {
    const now = d(2026, 1, 1, 10, 0);
    const result = computeReportDateRange("yearly", now, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfYear(d(2025, 1, 1)));
    expect(result.to).toEqual(endOfYear(d(2025, 12, 31)));
  });

  it("should NOT run on any other day", () => {
    const now = d(2026, 6, 15, 10, 0);
    const result = computeReportDateRange("yearly", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran for previous year", () => {
    const now = d(2026, 1, 1, 10, 0);
    const lastRun = endOfYear(d(2025, 12, 31));
    const result = computeReportDateRange("yearly", now, lastRun);
    expect(result.shouldRun).toBe(false);
  });
});

/* ================================================================
   EDGE CASES
   ================================================================ */
describe("computeReportDateRange – edge cases", () => {
  it("handles empty string type", () => {
    const result = computeReportDateRange("", d(2026, 2, 9, 10), null);
    expect(result.shouldRun).toBe(false);
  });

  it("handles mixed-case type", () => {
    const result = computeReportDateRange("Daily", d(2026, 2, 9, 10), null);
    expect(result.shouldRun).toBe(true);
  });

  it("handles type with extra whitespace", () => {
    const result = computeReportDateRange("  daily  ", d(2026, 2, 9, 10), null);
    expect(result.shouldRun).toBe(true);
  });

  it("weekly report on a Monday that straddles two months", () => {
    // 2026-03-02 is a Monday
    const now = d(2026, 3, 2, 10, 0);
    const result = computeReportDateRange("weekly", now, null);
    expect(result.shouldRun).toBe(true);
    // The previous week started on Monday Feb 23
    expect(result.from.getMonth()).toBe(1); // February
    expect(result.from.getDate()).toBe(23);
    // Ends on Sunday Mar 1
    expect(result.to.getMonth()).toBe(2); // March
    expect(result.to.getDate()).toBe(1);
  });
});
