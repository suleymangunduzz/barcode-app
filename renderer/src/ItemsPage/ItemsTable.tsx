import { useTranslation } from "react-i18next";
import { Item } from "../types";
import StockBadge from "./StockBadge";

type Props = {
  items: Item[];
};

export default function ItemsTable({ items }: Props) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="text-center text-slate-400 mt-10">
        {t("ItemsPage.noItems")}
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-3 py-2 text-left">
              {t("ItemsPage.Table.headerBarcode")}
            </th>
            <th className="px-3 py-2 text-left">
              {t("ItemsPage.Table.headerName")}
            </th>
            <th className="px-3 py-2 text-left">
              {t("ItemsPage.Table.headerBrand")}
            </th>
            <th className="px-3 py-2 text-left">
              {t("ItemsPage.Table.headerCategory")}
            </th>
            <th className="px-3 py-2 text-right">
              {t("ItemsPage.Table.headerPrice")}
            </th>
            <th className="px-3 py-2 text-center">
              {t("ItemsPage.Table.headerStock")}
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t border-slate-700 hover:bg-slate-800"
            >
              <td className="px-3 py-2">{item.barcode}</td>
              <td className="px-3 py-2 font-medium">{item.name}</td>
              <td className="px-3 py-2">{item.brand ?? "-"}</td>
              <td className="px-3 py-2">{item.category?.name ?? "-"}</td>
              <td className="px-3 py-2 text-right">
                ₺{item.currentPrice.toLocaleString("tr-TR")}
              </td>
              <td className="px-3 py-2 text-center">
                <StockBadge
                  stock={item.stockQuantity}
                  min={item.minStockThreshold}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
