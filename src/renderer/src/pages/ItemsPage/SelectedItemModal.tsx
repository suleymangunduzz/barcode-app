import React, { useEffect, useState } from "react";
import { Item, StockMovement } from "@/types/DB";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/formatDate";

type Props = {
  item: Item;
  onClose: () => void;
};

export default function SelectedItemModal({ item, onClose }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"price" | "stock" | "sales">("price");

  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  async function fetchPriceHistory() {
    const data = await window.api.getPriceHistory(item.id);
    setPriceHistory(data || []);
  }

  async function fetchStockMovements() {
    const data = await window.api.getStockMovements(item.id);
    setStockMovements(data || []);
  }

  async function fetchSales() {
    const payload = { itemId: item.id, from, to };
    const data = await window.api.getSalesForItem(payload);
    setSales(data || []);
  }

  useEffect(() => {
    fetchPriceHistory();
    fetchStockMovements();
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 pt-12">
      <div className="bg-slate-900 p-6 rounded-lg w-[1000px] max-h-[80vh] overflow-auto border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-100">{item.name}</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTab("price")}
              className={
                tab === "price"
                  ? "px-4 py-2 rounded text-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  : "px-4 py-2 rounded text-lg bg-slate-600 text-slate-200 hover:bg-slate-500"
              }
            >
              {t("ItemsPage.Details.priceHistory")}
            </button>
            <button
              onClick={() => setTab("stock")}
              className={
                tab === "stock"
                  ? "px-4 py-2 rounded text-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  : "px-4 py-2 rounded text-lg bg-slate-600 text-slate-200 hover:bg-slate-500"
              }
            >
              {t("ItemsPage.Details.stockMovements")}
            </button>
            <button
              onClick={() => setTab("sales")}
              className={
                tab === "sales"
                  ? "px-4 py-2 rounded text-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  : "px-4 py-2 rounded text-lg bg-slate-600 text-slate-200 hover:bg-slate-500"
              }
            >
              {t("ItemsPage.Details.sales")}
            </button>
          </div>
        </div>

        {tab === "price" && (
          <div>
            <h3 className="font-medium text-slate-200 text-lg mb-2">
              {t("ItemsPage.Details.priceHistory")}
            </h3>
            <div className="overflow-auto max-h-96 border border-slate-700 rounded">
              <table className="w-full text-base">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("Common.date")}</th>
                    <th className="px-4 py-3 text-right">
                      {t("ItemsPage.Table.headerPrice")}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t("ItemsPage.Details.qty")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((r, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-700"}
                    >
                      <td className="px-4 py-3 text-slate-100">
                        {formatDate(r.date)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        ₺{r.unitPrice?.toLocaleString?.("tr-TR")}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        {r.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "stock" && (
          <div>
            <h3 className="font-medium text-slate-200 text-lg mb-2">
              {t("ItemsPage.Details.stockMovements")}
            </h3>
            <div className="overflow-auto max-h-96 border border-slate-700 rounded">
              <table className="w-full text-base">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("Common.date")}</th>
                    <th className="px-4 py-3 text-right">
                      {t("ItemsPage.Details.change")}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {t("ItemsPage.Details.reason")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.map((m) => {
                    const reasonKey = `ItemsPage.Reasons.${m.reason}`;
                    const reasonLabel = t(reasonKey, {
                      defaultValue: m.reason,
                    });
                    return (
                      <tr key={m.id} className="bg-slate-800 odd:bg-slate-700">
                        <td className="px-4 py-3 text-slate-100">
                          {formatDate(m.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-100">
                          {m.changeQuantity}
                        </td>
                        <td className="px-4 py-3 text-slate-100">
                          {reasonLabel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "sales" && (
          <div>
            <h3 className="font-medium text-slate-200 text-lg mb-2">
              {t("ItemsPage.Details.sales")}
            </h3>
            <div className="flex gap-3 items-center mb-3">
              <label className="text-lg text-slate-300">
                {t("Common.from")}
              </label>
              <input
                type="date"
                value={from || ""}
                onChange={(e) => setFrom(e.target.value || undefined)}
                className="px-3 py-2 rounded bg-slate-800 text-lg"
              />
              <label className="text-lg text-slate-300">{t("Common.to")}</label>
              <input
                type="date"
                value={to || ""}
                onChange={(e) => setTo(e.target.value || undefined)}
                className="px-3 py-2 rounded bg-slate-800 text-lg"
              />
              <button
                onClick={fetchSales}
                className="px-4 py-2 rounded bg-emerald-600 text-lg text-white hover:bg-emerald-500"
              >
                {t("Common.search")}
              </button>
            </div>

            <div className="overflow-auto max-h-96 border border-slate-700 rounded">
              <table className="w-full text-base">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("Common.date")}</th>
                    <th className="px-4 py-3 text-right">
                      {t("ItemsPage.Table.headerPrice")}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t("ItemsPage.Details.qty")}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t("ItemsPage.Details.total")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="bg-slate-800 odd:bg-slate-700">
                      <td className="px-4 py-3 text-slate-100">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        ₺
                        {s.saleItems?.[0]?.unitPrice?.toLocaleString?.("tr-TR")}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        {s.saleItems?.[0]?.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        ₺
                        {s.saleItems?.[0]?.totalPrice?.toLocaleString?.(
                          "tr-TR",
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-700 text-slate-100"
          >
            {t("Common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
