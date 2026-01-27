import { useTranslation } from "react-i18next";
import { useState } from "react";
import StockBadge from "@/pages/ItemsPage/StockBadge";
import BarcodeViewerModal from "@/pages/ItemsPage/BarcodeViewerModal";
import { Item } from "@/types/DB";
import { useCart } from "@/context/CartContext";

type Props = {
  items?: Item[]; // make optional to be defensive
  isAdmin: boolean;
  onUpdateStock: (item: Item) => void;
  openPriceModal: (item: Item) => void;
  onViewDetails?: (item: Item) => void;
};

export default function ItemsTable({
  items = [], // default to empty array
  isAdmin,
  onUpdateStock,
  openPriceModal,
  onViewDetails,
}: Props) {
  const { t } = useTranslation();
  const [barcodeToView, setBarcodeToView] = useState<string | null>(null);

  const { addItem } = useCart();
  const handleAddToCart = async (item: Item) => {
    await addItem(item);
  };

  // Always return a single parent div, even for empty state
  const isEmpty = !items || items.length === 0;

  return (
    <div>
      {/* Toast is now handled globally by ToastProvider */}
      {isEmpty ? (
        <div className="text-center text-slate-400 mt-10">
          {t("ItemsPage.noItems")}
        </div>
      ) : (
        <div className="overflow-auto rounded border border-slate-700">
          <table className="w-full text-base">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
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
                <th className="px-3 py-2 text-center">
                  {t("ItemsPage.Table.headerActions")}
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
                    hover:bg-slate-600
                    transition-colors duration-200
                    text-slate-100
                  `}
                >
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2">{item.brand ?? "-"}</td>
                  <td className="px-3 py-2">
                    {item.category?.name ?? (item as any).categoryName ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₺{item.currentPrice.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <StockBadge
                      stock={item.stockQuantity}
                      min={item.minStockThreshold}
                    />
                  </td>
                  <td className="px-3 py-2 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stockQuantity < 1}
                      className={`
                          px-3 py-1 text-base rounded
                          bg-blue-600 text-white
                          hover:bg-blue-500 transition font-medium
                          ${
                            item.stockQuantity < 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }
                        `}
                    >
                      {t("ItemsPage.Actions.addToCart")}
                    </button>
                    <button
                      onClick={() => setBarcodeToView(item.barcode)}
                      className="
                        px-3 py-1 text-base rounded
                        bg-emerald-600 text-white
                        hover:bg-emerald-500 transition font-medium
                      "
                    >
                      {t("ItemsPage.Actions.viewBarcode") || "Barcode"}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onUpdateStock(item)}
                          className="
                            px-3 py-1 text-base rounded
                            bg-blue-600 text-white
                            hover:bg-blue-500 transition font-medium
                          "
                        >
                          {t("ItemsPage.Actions.updateStock")}
                        </button>
                        <button
                          onClick={() => openPriceModal(item)}
                          className="
                          px-3 py-1 text-base rounded
                          bg-amber-600 text-white
                          hover:bg-amber-500 transition font-medium
                        "
                        >
                          {t("ItemsPage.Actions.updatePrice")}
                        </button>
                        <button
                          onClick={() => onViewDetails?.(item)}
                          className="
                            px-3 py-1 text-base rounded
                            bg-slate-600 text-white
                            hover:bg-slate-500 transition font-medium
                          "
                        >
                          {t("ItemsPage.Details.view")}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {barcodeToView && (
        // lazy import viewer modal to avoid increasing bundle size unnecessarily
        // eslint-disable-next-line react/jsx-no-bind
        <BarcodeViewerModal
          value={barcodeToView}
          onClose={() => setBarcodeToView(null)}
        />
      )}
      {/* audio handled by CartProvider */}
    </div>
  );
}
