import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
} from "date-fns";

export interface ReportDateRange {
  from: Date;
  to: Date;
  shouldRun: boolean;
}

/**
 * Compute the date range and whether a report should fire for the given
 * schedule `type`, current time `now`, and optional `lastRunAt` timestamp.
 *
 * Rules
 * ─────
 * • Reports only trigger during the last 2 hours of the relevant day (≥ 22:00).
 * • Daily   — every day; range = start-of-day → end-of-day.
 * • Weekly  — every Sunday; range = Monday 00:00 → Sunday 23:59:59.
 * • Monthly — last day of the month; range = 1st 00:00 → last-day 23:59:59.
 * • Yearly  — December 31; range = Jan 1 00:00 → Dec 31 23:59:59.
 *
 * If the report was already sent during the current period (`lastRunAt`
 * falls inside or after the period start) it will NOT run again.
 */
export function computeReportDateRange(
  type: string,
  now: Date,
  lastRunAt: Date | null,
): ReportDateRange {
  const NO_RUN: ReportDateRange = {
    from: startOfDay(now),
    to: endOfDay(now),
    shouldRun: false,
  };

  // Only run in the last 2 hours of the day (22:00–23:59)
  if (now.getHours() < 22) return NO_RUN;

  const normalizedType = (type || "").toLowerCase().trim();

  switch (normalizedType) {
    case "daily":
      return computeDaily(now, lastRunAt);
    case "weekly":
      return computeWeekly(now, lastRunAt);
    case "monthly":
      return computeMonthly(now, lastRunAt);
    case "yearly":
      return computeYearly(now, lastRunAt);
    default:
      return NO_RUN;
  }
}

/* ── helpers ─────────────────────────────────────────────────────── */

function alreadyRanInPeriod(
  lastRunAt: Date | null,
  periodStart: Date,
): boolean {
  return lastRunAt !== null && lastRunAt >= periodStart;
}

function computeDaily(now: Date, lastRunAt: Date | null): ReportDateRange {
  const from = startOfDay(now);
  const to = endOfDay(now);
  const shouldRun = !alreadyRanInPeriod(lastRunAt, from);
  return { from, to, shouldRun };
}

function computeWeekly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Send on Sunday (getDay() === 0)
  if (now.getDay() !== 0) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  // Week runs Monday → Sunday
  const from = startOfWeek(now, { weekStartsOn: 1 }); // Monday 00:00
  const to = endOfWeek(now, { weekStartsOn: 1 }); // Sunday 23:59:59
  const shouldRun = !alreadyRanInPeriod(lastRunAt, from);
  return { from, to, shouldRun };
}

function computeMonthly(now: Date, lastRunAt: Date | null): ReportDateRange {
  const monthEnd = endOfMonth(now);

  // Only run on the last day of the month
  if (now.getDate() !== monthEnd.getDate()) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  const from = startOfMonth(now);
  const to = monthEnd;
  const shouldRun = !alreadyRanInPeriod(lastRunAt, from);
  return { from, to, shouldRun };
}

function computeYearly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Only run on December 31
  if (now.getMonth() !== 11 || now.getDate() !== 31) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  const from = startOfYear(now);
  const to = endOfYear(now);
  const shouldRun = !alreadyRanInPeriod(lastRunAt, from);
  return { from, to, shouldRun };
}
