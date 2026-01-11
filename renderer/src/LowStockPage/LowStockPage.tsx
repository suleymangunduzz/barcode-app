import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "../types/prisma";

export default function LowStockPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    async function fetchLowStock() {
      const data = await window.api.getLowStockItems();
      setItems(data);
    }
    fetchLowStock();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("LowStockPage.title")}</h1>

      {items.length === 0 ? (
        <div className="text-slate-400">{t("LowStockPage.noItems")}</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="text-left px-3 py-2">
                  {t("LowStockPage.table.name")}
                </th>
                <th className="text-left px-3 py-2">
                  {t("LowStockPage.table.category")}
                </th>
                <th className="text-right px-3 py-2">
                  {t("LowStockPage.table.stock")}
                </th>
                <th className="text-right px-3 py-2">
                  {t("LowStockPage.table.minStock")}
                </th>
                <th className="text-right px-3 py-2">
                  {t("LowStockPage.table.price")}
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-700">
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.category?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-right text-red-400 font-semibold">
                    {item.stockQuantity}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.minStockThreshold}
                  </td>
                  <td className="px-3 py-2 text-right">₺{item.currentPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
