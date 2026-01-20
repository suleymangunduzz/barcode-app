import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "@/types/DB";

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
        <div className="overflow-auto rounded border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="text-left px-3 py-2">
                  {t("LowStockPage.table.barcode")}
                </th>
                <th className="text-left px-3 py-2">
                  {t("LowStockPage.table.name")}
                </th>
                <th className="text-left px-3 py-2">
                  {t("LowStockPage.table.brand")}
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
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`
                    border-t border-slate-700
                    ${index % 2 === 0 ? "bg-slate-800" : "bg-slate-700"}
                    hover:bg-slate-600 transition-colors duration-200
                    text-slate-100
                  `}
                >
                  <td className="px-3 py-2">{item.barcode}</td>
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2">{item.brand ?? "-"}</td>
                  <td className="px-3 py-2">{item.category?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-right text-red-500 font-semibold">
                    {item.stockQuantity}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.minStockThreshold}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₺{item.currentPrice.toLocaleString("tr-TR")}
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
