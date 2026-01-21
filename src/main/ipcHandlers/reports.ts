import { ipcMain, BrowserWindow, app } from "electron";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { format } from "date-fns";
import sendTestEmail from "./send_test_email";

type SqliteDb = ReturnType<typeof Database>;

export function registerReportHandlers(db: SqliteDb) {
  ipcMain.handle("sendTestEmail", () => {
    sendTestEmail();

    // Just a dummy handler to test email sending from renderer
    return { success: true };
  });

  ipcMain.handle("reports:getSchedules", () =>
    db.prepare("SELECT * FROM ReportSchedule ORDER BY id ASC").all(),
  );

  ipcMain.handle(
    "reports:saveSchedule",
    (
      _event,
      payload: {
        id?: number;
        type: string;
        email?: string | null;
        enabled: boolean;
        subject?: string;
      },
    ) => {
      if (payload.id) {
        db.prepare(
          `UPDATE ReportSchedule SET type = ?, email = ?, enabled = ?, subject = ? WHERE id = ?`,
        ).run(
          payload.type,
          payload.email,
          payload.enabled ? 1 : 0,
          payload.subject || null,
          payload.id,
        );
      } else {
        db.prepare(
          `INSERT INTO ReportSchedule (type, email, enabled, subject) VALUES (?, ?, ?, ?)`,
        ).run(
          payload.type,
          payload.email,
          payload.enabled ? 1 : 0,
          payload.subject || null,
        );
      }

      return { success: true };
    },
  );

  ipcMain.handle(
    "reports:toggleSchedule",
    (_event, { id, enabled }: { id: number; enabled: boolean }) => {
      db.prepare("UPDATE ReportSchedule SET enabled = ? WHERE id = ?").run(
        enabled ? 1 : 0,
        id,
      );
      return { success: true };
    },
  );

  ipcMain.handle(
    "reports:generateSalesReport",
    async (_event, { from, to }: { from: string; to: string }) => {
      const sales = db
        .prepare(
          `SELECT s.*, u.name as soldByName FROM Sale s LEFT JOIN User u ON s.soldById = u.id WHERE s.createdAt >= ? AND s.createdAt <= ? ORDER BY s.createdAt ASC`,
        )
        .all(from, to) as any[];

      for (const sale of sales) {
        sale.saleItems = db
          .prepare("SELECT * FROM SaleItem WHERE saleId = ?")
          .all(sale.id) as any[];
      }

      const total = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      // build simple HTML
      const rowsHtml = sales
        .map((s) => {
          const itemsHtml = s.saleItems
            .map(
              (si: any) =>
                `<tr><td>${si.itemName}</td><td>${si.quantity}</td><td>₺${si.totalPrice.toLocaleString("tr-TR")}</td></tr>`,
            )
            .join("");
          return `
            <h3>Sale #${s.id} - ${s.soldByName || "-"} - ${s.createdAt}</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
              <thead><tr><th style="border:1px solid #ddd;padding:6px;text-align:left">Item</th><th style="border:1px solid #ddd;padding:6px;text-align:right">Qty</th><th style="border:1px solid #ddd;padding:6px;text-align:right">Total</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          `;
        })
        .join("\n");

      const title = `Sales Report ${format(new Date(from), "yyyy-MM-dd")} → ${format(new Date(to), "yyyy-MM-dd")}`;

      const html = `
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #222 }
            h1 { font-size: 18px }
            table { width: 100%; border-collapse: collapse }
            th, td { border: 1px solid #ddd; padding: 6px }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div>Total: ₺${total.toLocaleString("tr-TR")}</div>
          <hr />
          ${rowsHtml || "<p>No sales in the selected range.</p>"}
        </body>
        </html>
      `;

      // create a hidden BrowserWindow to render HTML and print to PDF
      const win = new BrowserWindow({
        show: false,
        webPreferences: { offscreen: true },
      });
      const dataUrl =
        "data:text/html;charset=utf-8," + encodeURIComponent(html);
      await win.loadURL(dataUrl);
      const pdfData = await win.webContents.printToPDF({});
      const outPath = path.join(
        app.getPath("temp"),
        `sales-report-${Date.now()}.pdf`,
      );
      fs.writeFileSync(outPath, pdfData);
      win.destroy();

      return { path: outPath };
    },
  );
}
