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
 * • No time-of-day or day-of-week gate. Scheduler can run any time.
 * • Daily   — report for yesterday.
 * • Weekly  — report for the most recent completed week (Mon–Sun).
 * • Monthly — report for the previous month.
 * • Yearly  — report for the previous year.
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
  // Report for the most recent completed week (Mon 00:00 – Sun 23:59:59)
  // The current week's Monday:
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  // If we ARE on Monday 00:00+ the previous week just ended
  // Otherwise the last completed week ended the Sunday before thisWeekStart
  const prevWeekEnd = endOfWeek(subWeeks(thisWeekStart, 1), {
    weekStartsOn: 1,
  });
  const prevWeekStart = startOfWeek(prevWeekEnd, { weekStartsOn: 1 });

  // Don't send if we're still in the same week as the period (shouldn't happen
  // but guard against startOfWeek edge)
  if (prevWeekEnd >= startOfDay(now)) {
    return { from: startOfDay(now), to: endOfDay(now), shouldRun: false };
  }

  const shouldRun = !alreadyRanForPeriod(lastRunAt, prevWeekEnd);
  return { from: prevWeekStart, to: prevWeekEnd, shouldRun };
}

function computeMonthly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Report for the previous month (any day)
  const prevMonth = subMonths(now, 1);
  const from = startOfMonth(prevMonth);
  const to = endOfMonth(prevMonth);
  const shouldRun = !alreadyRanForPeriod(lastRunAt, to);
  return { from, to, shouldRun };
}

function computeYearly(now: Date, lastRunAt: Date | null): ReportDateRange {
  // Report for the previous year (any day)
  const prevYear = subYears(now, 1);
  const from = startOfYear(prevYear);
  const to = endOfYear(prevYear);
  const shouldRun = !alreadyRanForPeriod(lastRunAt, to);
  return { from, to, shouldRun };
}
