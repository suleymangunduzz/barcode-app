import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sale } from "../types/prisma";

const LAST_SALES_COUNT = 20;

export default function SalesPage() {
  const { t } = useTranslation();

  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function fetchSales() {
    const data = await window.api.getLastSales(LAST_SALES_COUNT);
    setSales(data);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        // Filter by total search
        if (search.trim()) {
          return s.totalAmount.toString().includes(search);
        }
        return true;
      })
      .filter((s) => {
        // Filter by date
        const saleDate = new Date(s.createdAt).setHours(0, 0, 0, 0);
        const from = fromDate ? new Date(fromDate).getTime() : -Infinity;
        const to = toDate ? new Date(toDate).getTime() : Infinity;
        return saleDate >= from && saleDate <= to;
      });
  }, [sales, search, fromDate, toDate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("SalesPage.title")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder={t("SalesPage.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-slate-700 text-white w-40"
        />
        <div className="flex gap-2">
          <label className="text-sm text-slate-400">
            {t("SalesPage.from")}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          <label className="text-sm text-slate-400">{t("SalesPage.to")}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white"
          />
        </div>
      </div>

      {/* Table */}
      {filteredSales.length === 0 ? (
        <div className="text-slate-400">{t("SalesPage.noSales")}</div>
      ) : (
        <div className="overflow-auto border border-slate-700 rounded">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-3 py-2 text-left">
                  {t("SalesPage.table.date")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("SalesPage.table.soldBy")}
                </th>
                <th className="px-3 py-2 text-right">
                  {t("SalesPage.table.total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-t border-slate-700 hover:bg-slate-800"
                >
                  <td className="px-3 py-2">
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{sale.soldBy?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    ₺{sale.totalAmount.toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
