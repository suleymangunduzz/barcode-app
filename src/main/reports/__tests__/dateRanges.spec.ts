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
   SHARED: time-of-day gate (< 22:00 → never run)
   ================================================================ */
describe("computeReportDateRange – time-of-day gate", () => {
  it.each(["daily", "weekly", "monthly", "yearly"])(
    "returns shouldRun=false for type=%s when hour < 22",
    (type) => {
      // Monday 15:00
      const now = d(2026, 2, 9, 15, 0);
      const result = computeReportDateRange(type, now, null);
      expect(result.shouldRun).toBe(false);
    },
  );

  it("returns shouldRun=false for unknown type even at 23:00", () => {
    const result = computeReportDateRange("biweekly", d(2026, 2, 9, 23), null);
    expect(result.shouldRun).toBe(false);
  });
});

/* ================================================================
   DAILY
   ================================================================ */
describe("computeReportDateRange – daily", () => {
  it("should run when hour >= 22 and never run before", () => {
    const now = d(2026, 2, 9, 22, 30); // Monday 22:30
    const result = computeReportDateRange("daily", now, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfDay(now));
    expect(result.to).toEqual(endOfDay(now));
  });

  it("should run at exactly 22:00", () => {
    const now = d(2026, 2, 9, 22, 0);
    const result = computeReportDateRange("daily", now, null);
    expect(result.shouldRun).toBe(true);
  });

  it("should NOT run at 21:59", () => {
    const now = d(2026, 2, 9, 21, 59);
    const result = computeReportDateRange("daily", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran today", () => {
    const now = d(2026, 2, 9, 23, 0);
    const lastRun = d(2026, 2, 9, 22, 5);
    const result = computeReportDateRange("daily", now, lastRun);
    expect(result.shouldRun).toBe(false);
  });

  it("should run if last run was yesterday", () => {
    const now = d(2026, 2, 9, 22, 30);
    const lastRun = d(2026, 2, 8, 22, 30);
    const result = computeReportDateRange("daily", now, lastRun);
    expect(result.shouldRun).toBe(true);
  });

  it("range covers full day", () => {
    const now = d(2026, 2, 9, 23, 0);
    const { from, to } = computeReportDateRange("daily", now, null);
    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
    expect(to.getHours()).toBe(23);
    expect(to.getMinutes()).toBe(59);
  });
});

/* ================================================================
   WEEKLY
   ================================================================ */
describe("computeReportDateRange – weekly", () => {
  // 2026-02-08 is a Sunday
  const sunday = d(2026, 2, 8, 22, 30);
  // 2026-02-09 is a Monday
  const monday = d(2026, 2, 9, 22, 30);

  it("should run on Sunday at 22:30 with no previous run", () => {
    const result = computeReportDateRange("weekly", sunday, null);

    expect(result.shouldRun).toBe(true);
    // from = Monday 00:00 of that week (Feb 2)
    expect(result.from).toEqual(startOfWeek(sunday, { weekStartsOn: 1 }));
    // to = Sunday 23:59:59 (Feb 8)
    expect(result.to).toEqual(endOfWeek(sunday, { weekStartsOn: 1 }));
  });

  it("should NOT run on Monday (not Sunday)", () => {
    const result = computeReportDateRange("weekly", monday, null);
    expect(result.shouldRun).toBe(false);
  });

  it.each([2, 3, 4, 5, 6])("should NOT run on weekday index %i", (day) => {
    // Build a date for the corresponding day in the same week
    // Feb 2=Mon(1), Feb 3=Tue(2), …, Feb 7=Sat(6)
    const date = d(2026, 2, 2 + day - 1, 22, 30);
    const result = computeReportDateRange("weekly", date, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran this week", () => {
    const lastRun = d(2026, 2, 8, 22, 0); // earlier on same Sunday
    const result = computeReportDateRange("weekly", sunday, lastRun);
    expect(result.shouldRun).toBe(false);
  });

  it("should run if last run was in the previous week", () => {
    const lastRun = d(2026, 2, 1, 22, 30); // previous Sunday
    const result = computeReportDateRange("weekly", sunday, lastRun);
    expect(result.shouldRun).toBe(true);
  });

  it("range covers full Mon–Sun week", () => {
    const result = computeReportDateRange("weekly", sunday, null);
    // from should be Monday
    expect(result.from.getDay()).toBe(1); // Monday
    // to should be Sunday
    expect(result.to.getDay()).toBe(0); // Sunday
    expect(result.to.getHours()).toBe(23);
    expect(result.to.getMinutes()).toBe(59);
  });
});

/* ================================================================
   MONTHLY
   ================================================================ */
describe("computeReportDateRange – monthly", () => {
  it("should run on last day of month (Feb 28, non-leap year) at 22:00", () => {
    // 2026 is not a leap year, so Feb has 28 days
    const now = d(2026, 2, 28, 22, 0);
    const result = computeReportDateRange("monthly", now, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfMonth(now));
    expect(result.to).toEqual(endOfMonth(now));
  });

  it("should run on last day of month (Jan 31)", () => {
    const now = d(2026, 1, 31, 23, 0);
    const result = computeReportDateRange("monthly", now, null);
    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(d(2026, 1, 1, 0, 0));
  });

  it("should run on last day of a 30-day month (Apr 30)", () => {
    const now = d(2026, 4, 30, 22, 0);
    const result = computeReportDateRange("monthly", now, null);
    expect(result.shouldRun).toBe(true);
  });

  it("should run on Feb 29 in a leap year", () => {
    // 2028 is a leap year
    const now = d(2028, 2, 29, 22, 0);
    const result = computeReportDateRange("monthly", now, null);
    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfMonth(now));
    expect(result.to).toEqual(endOfMonth(now));
  });

  it("should NOT run on a non-last day", () => {
    const now = d(2026, 2, 15, 22, 0);
    const result = computeReportDateRange("monthly", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran this month", () => {
    const now = d(2026, 1, 31, 23, 0);
    const lastRun = d(2026, 1, 31, 22, 0);
    const result = computeReportDateRange("monthly", now, lastRun);
    expect(result.shouldRun).toBe(false);
  });

  it("should run if last run was previous month", () => {
    const now = d(2026, 2, 28, 22, 0);
    const lastRun = d(2026, 1, 31, 22, 30);
    const result = computeReportDateRange("monthly", now, lastRun);
    expect(result.shouldRun).toBe(true);
  });

  it("range covers full month", () => {
    const now = d(2026, 3, 31, 22, 0); // March 31
    const { from, to } = computeReportDateRange("monthly", now, null);
    expect(from.getDate()).toBe(1);
    expect(from.getMonth()).toBe(2); // March (0-based)
    expect(to.getDate()).toBe(31);
    expect(to.getHours()).toBe(23);
    expect(to.getMinutes()).toBe(59);
  });
});

/* ================================================================
   YEARLY
   ================================================================ */
describe("computeReportDateRange – yearly", () => {
  it("should run on December 31 at 22:00 with no prior run", () => {
    const now = d(2026, 12, 31, 22, 0);
    const result = computeReportDateRange("yearly", now, null);

    expect(result.shouldRun).toBe(true);
    expect(result.from).toEqual(startOfYear(now));
    expect(result.to).toEqual(endOfYear(now));
  });

  it("should NOT run on any other day", () => {
    const now = d(2026, 6, 15, 22, 0);
    const result = computeReportDateRange("yearly", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run on December 30", () => {
    const now = d(2026, 12, 30, 23, 0);
    const result = computeReportDateRange("yearly", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run on January 1 (wrong day)", () => {
    const now = d(2026, 1, 1, 23, 0);
    const result = computeReportDateRange("yearly", now, null);
    expect(result.shouldRun).toBe(false);
  });

  it("should NOT run if already ran this year", () => {
    const now = d(2026, 12, 31, 23, 0);
    const lastRun = d(2026, 12, 31, 22, 5);
    const result = computeReportDateRange("yearly", now, lastRun);
    expect(result.shouldRun).toBe(false);
  });

  it("should run if last run was previous year", () => {
    const now = d(2026, 12, 31, 22, 0);
    const lastRun = d(2025, 12, 31, 23, 0);
    const result = computeReportDateRange("yearly", now, lastRun);
    expect(result.shouldRun).toBe(true);
  });

  it("range covers full year", () => {
    const now = d(2026, 12, 31, 22, 0);
    const { from, to } = computeReportDateRange("yearly", now, null);
    expect(from.getMonth()).toBe(0); // January
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(11); // December
    expect(to.getDate()).toBe(31);
    expect(to.getHours()).toBe(23);
    expect(to.getMinutes()).toBe(59);
  });
});

/* ================================================================
   EDGE CASES
   ================================================================ */
describe("computeReportDateRange – edge cases", () => {
  it("handles empty string type", () => {
    const result = computeReportDateRange("", d(2026, 2, 9, 23), null);
    expect(result.shouldRun).toBe(false);
  });

  it("handles mixed-case type", () => {
    const result = computeReportDateRange("Daily", d(2026, 2, 9, 22), null);
    expect(result.shouldRun).toBe(true);
  });

  it("handles type with extra whitespace", () => {
    const result = computeReportDateRange("  daily  ", d(2026, 2, 9, 22), null);
    expect(result.shouldRun).toBe(true);
  });

  it("weekly report on a Sunday that straddles two months", () => {
    // 2026-03-01 is a Sunday
    const now = d(2026, 3, 1, 22, 0);
    const result = computeReportDateRange("weekly", now, null);
    expect(result.shouldRun).toBe(true);
    // The week started on Monday Feb 23
    expect(result.from.getMonth()).toBe(1); // February
    expect(result.from.getDate()).toBe(23);
    // Ends on Sunday Mar 1
    expect(result.to.getMonth()).toBe(2); // March
    expect(result.to.getDate()).toBe(1);
  });

  it("monthly report on Feb 28 in a leap year should NOT run (29 is last day)", () => {
    // 2028 is a leap year – Feb has 29 days
    const now = d(2028, 2, 28, 22, 0);
    const result = computeReportDateRange("monthly", now, null);
    expect(result.shouldRun).toBe(false);
  });
});
