import { useTranslation } from "react-i18next";
import StockBadge from "./StockBadge";
import { Item } from "../types/prisma";

type Props = {
  items: Item[];
  isAdmin: boolean;
  onUpdateStock: (item: Item) => void;
  openPriceModal: (item: Item) => void;
};

export default function ItemsTable({
  items,
  isAdmin,
  onUpdateStock,
  openPriceModal,
}: Props) {
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
            {isAdmin && (
              <th className="px-3 py-2 text-center">
                {t("ItemsPage.Table.headerActions")}
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={`
                border-t border-slate-700
                ${index % 2 === 0 ? "bg-slate-800" : "bg-slate-700"}
                hover:bg-slate-600
                transition-colors duration-200
                text-slate-100
              `}
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
              {isAdmin && (
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onUpdateStock(item)}
                    className="
                      px-3 py-1 text-sm rounded
                      bg-blue-600 text-white
                      hover:bg-blue-500 transition font-medium
                    "
                  >
                    {t("ItemsPage.Actions.updateStock")}
                  </button>
                  <button
                    onClick={() => openPriceModal(item)}
                    className="
                      px-3 py-1 text-sm rounded
                      bg-amber-600 text-white
                      hover:bg-amber-500 transition font-medium ml-2
                    "
                  >
                    {t("ItemsPage.Actions.updatePrice")}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
