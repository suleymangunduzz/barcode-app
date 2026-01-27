import Database from "better-sqlite3";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
} from "date-fns";
import { generateSalesReportForRange } from "../ipcHandlers/reports";

type SqliteDb = ReturnType<typeof Database>;

export function startReportScheduler(db: SqliteDb, intervalMs = 5 * 60 * 1000) {
  console.log("[ReportsScheduler] Starting scheduler, intervalMs=", intervalMs);

  const checkAndSend = async () => {
    try {
      const schedules = db
        .prepare("SELECT * FROM ReportSchedule WHERE enabled = 1")
        .all() as any[];
      const now = new Date();

      for (const s of schedules) {
        const type = (s.type || "").toLowerCase();
        const lastRun = s.lastRunAt ? new Date(s.lastRunAt) : null;

        const inLastTwoHours = now.getHours() >= 24 - 2; // >=22
        if (!inLastTwoHours) continue; // only run in last 2 hours of day

        let shouldRun = false;
        let from: Date = startOfDay(now);
        let to: Date = endOfDay(now);

        if (type === "daily") {
          // daily: full today
          from = startOfDay(now);
          to = endOfDay(now);
          // avoid multiple sends in same day
          if (lastRun && lastRun >= startOfDay(now)) shouldRun = false;
          else shouldRun = true;
        } else if (type === "weekly") {
          // weekly: full week up to today
          from = startOfWeek(now);
          to = endOfDay(now);
          // send only on Sunday (0)
          if (now.getDay() !== 0) {
            shouldRun = false;
          } else {
            if (lastRun && lastRun >= startOfWeek(now)) shouldRun = false;
            else shouldRun = true;
          }
        } else if (type === "monthly") {
          // last day of month
          const tomorrow = new Date(now);
          tomorrow.setDate(now.getDate() + 1);
          const isLastDay = tomorrow.getDate() === 1;
          if (!isLastDay) {
            shouldRun = false;
          } else {
            from = startOfMonth(now);
            to = endOfDay(now);
            if (lastRun && lastRun >= startOfMonth(now)) shouldRun = false;
            else shouldRun = true;
          }
        } else if (type === "yearly") {
          // last day of year
          const isLastDayOfYear = now.getMonth() === 11 && now.getDate() === 31;
          if (!isLastDayOfYear) {
            shouldRun = false;
          } else {
            from = startOfYear(now);
            to = endOfDay(now);
            if (lastRun && lastRun >= startOfYear(now)) shouldRun = false;
            else shouldRun = true;
          }
        } else {
          // unknown type -> skip
          shouldRun = false;
        }

        if (!shouldRun) continue;

        try {
          console.log(
            `[ReportsScheduler] Sending report for schedule id=${s.id} type=${s.type} email=${s.email}`,
          );
          const res = await generateSalesReportForRange(
            db,
            from.toISOString(),
            to.toISOString(),
            s.email,
            s.subject,
          );
          console.log(
            `[ReportsScheduler] Report result for id=${s.id}: emailed=${res.emailed}`,
          );

          // update lastRunAt
          db.prepare(
            "UPDATE ReportSchedule SET lastRunAt = ? WHERE id = ?",
          ).run(new Date().toISOString(), s.id);
        } catch (err) {
          console.error(
            "[ReportsScheduler] Error sending report for schedule",
            s.id,
            err,
          );
        }
      }
    } catch (err) {
      console.error("[ReportsScheduler] Error in scheduler tick", err);
    }
  };

  // run once immediately, then interval
  void checkAndSend();
  const timer = setInterval(checkAndSend, intervalMs);

  return () => clearInterval(timer);
}
