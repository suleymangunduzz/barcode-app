import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { enUS } from "date-fns/locale";
import { tr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import { Sale } from "@/types/prisma";
import SaleDetailsModal from "@/pages/SalesPage/SaleDetailsModal";

export default function SalesPage() {
  const { t, i18n } = useTranslation();

  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  async function fetchSales() {
    const data = await window.api.getLastSales(20);
    setSales(data);
    setFilteredSales(data);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  // Filter by date and search
  const filtered = sales.filter((sale) => {
    const matchesSearch = search
      ? sale.totalAmount.toString().includes(search)
      : true;
    const matchesFrom = fromDate ? new Date(sale.createdAt) >= fromDate : true;
    const matchesTo = toDate ? new Date(sale.createdAt) <= toDate : true;

    return matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("SalesPage.title")}</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
        <input
          type="text"
          placeholder={t("SalesPage.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
        />

        <div className="flex gap-2 items-center">
          <label className="text-base text-slate-300">
            {t("SalesPage.from")}:
          </label>
          <DatePicker
            selected={fromDate}
            onChange={(date: Date | null) => setFromDate(date)}
            locale={i18n.language === "tr" ? tr : enUS}
            className="px-3 py-2 rounded bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-base text-slate-300">
            {t("SalesPage.to")}:
          </label>
          <DatePicker
            selected={toDate}
            locale={i18n.language === "tr" ? tr : enUS}
            onChange={(date: Date | null) => setToDate(date)}
            className="px-3 py-2 rounded bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-slate-400">{t("SalesPage.noSales")}</div>
      ) : (
        <div className="overflow-auto border border-slate-700 rounded">
          <table className="w-full text-base">
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
                <th className="px-3 py-2 text-center">
                  {t("SalesPage.actions.title")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-t border-slate-700 hover:bg-slate-800"
                >
                  <td className="px-3 py-2">
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{sale.soldBy?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    ₺{sale.totalAmount.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-base font-medium transition"
                      onClick={() => setSelectedSale(sale)}
                    >
                      {t("SalesPage.actions.view")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
