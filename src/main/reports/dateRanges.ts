import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
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
 * • No time-of-day gate. Scheduler can run any time.
 * • Daily   — send the next day for the previous day.
 * • Weekly  — send on Monday for the previous week (Mon–Sun).
 * • Monthly — send on the 1st for the previous month.
 * • Yearly  — send on Jan 1 for the previous year.
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

function alreadyRanForPeriod(lastRunAt: Date | null, periodEnd: Date): boolean {
  return lastRunAt !== null && lastRunAt >= periodEnd;
}

function computeDaily(now: Date, lastRunAt: Date | null): ReportDateRange {
  const targetDay = subDays(now, 1);
  const from = startOfDay(targetDay);
  const to = endOfDay(targetDay);
  const shouldRun = !alreadyRanForPeriod(lastRunAt, to);
  return { from, to, shouldRun };
}

function computeWeekly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Send on Monday (getDay() === 1) for previous week
  if (now.getDay() !== 1) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  const prevWeek = subWeeks(now, 1);
  const from = startOfWeek(prevWeek, { weekStartsOn: 1 }); // Monday 00:00
  const to = endOfWeek(prevWeek, { weekStartsOn: 1 }); // Sunday 23:59:59
  const shouldRun = !alreadyRanForPeriod(lastRunAt, to);
  return { from, to, shouldRun };
}

function computeMonthly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Send on the 1st for previous month
  if (now.getDate() !== 1) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  const prevMonth = subMonths(now, 1);
  const from = startOfMonth(prevMonth);
  const to = endOfMonth(prevMonth);
  const shouldRun = !alreadyRanForPeriod(lastRunAt, to);
  return { from, to, shouldRun };
}

function computeYearly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Send on Jan 1 for previous year
  if (now.getMonth() !== 0 || now.getDate() !== 1) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  const prevYear = subYears(now, 1);
  const from = startOfYear(prevYear);
  const to = endOfYear(prevYear);
  const shouldRun = !alreadyRanForPeriod(lastRunAt, to);
  return { from, to, shouldRun };
}
