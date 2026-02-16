import Database from "better-sqlite3";
import { generateSalesReportForRange } from "../ipcHandlers/reports";
import { computeReportDateRange } from "./dateRanges";

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
        const lastRun = s.lastRunAt ? new Date(s.lastRunAt) : null;
        const { from, to, shouldRun } = computeReportDateRange(
          s.type,
          now,
          lastRun,
        );

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

          // only mark as run if the email was actually sent
          // store the period end (e.g., yesterday/week/month/year end)
          if (res.emailed) {
            db.prepare(
              "UPDATE ReportSchedule SET lastRunAt = ? WHERE id = ?",
            ).run(to.toISOString(), s.id);
          }
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
