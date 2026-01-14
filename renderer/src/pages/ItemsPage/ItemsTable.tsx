import { useTranslation } from "react-i18next";
import StockBadge from "@/pages/ItemsPage/StockBadge";
import { Item } from "@/types/prisma";
import useToast from "@/hooks/useToast";
import { useCart } from "@/context/CartContext";
import useBarcodeBeep from "@/hooks/useBarcodeBeep";

type Props = {
  items?: Item[]; // make optional to be defensive
  isAdmin: boolean;
  onUpdateStock: (item: Item) => void;
  openPriceModal: (item: Item) => void;
  addToCart: (item: Item) => void | Promise<void>;
};

export default function ItemsTable({
  items = [], // default to empty array
  isAdmin,
  onUpdateStock,
  openPriceModal,
  addToCart,
}: Props) {
  const { t } = useTranslation();

  const { cartItems } = useCart();
  const toast = useToast();

  const { playBeep, audioRef } = useBarcodeBeep();

  const handleAddToCart = async (item: Item) => {
    // Find how many of this item are already in the cart
    const cartItem = cartItems.find((ci) => ci.itemId === item.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    // If not enough stock for the requested quantity (cart + 1), block
    if (item.stockQuantity - cartQuantity < 1) {
      toast({
        type: "error",
        message: t("ItemsPage.toast.insufficientStock", { name: item.name }),
      });
      return;
    }
    await addToCart(item);
    toast({
      type: "success",
      message: t("ItemsPage.toast.addedToCart", { name: item.name }),
    });
    await playBeep();
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
                  <td className="px-3 py-2 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stockQuantity < 1}
                      className={`
                          px-3 py-1 text-sm rounded
                          bg-blue-600 text-white
                          hover:bg-blue-500 transition font-medium
                          ${item.stockQuantity < 1 ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                      {t("ItemsPage.Actions.addToCart")}
                    </button>
                    {isAdmin && (
                      <>
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
                          hover:bg-amber-500 transition font-medium
                        "
                        >
                          {t("ItemsPage.Actions.updatePrice")}
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
      <audio
        ref={audioRef}
        src="/sounds/barcode-beep.mp3"
        preload="auto"
        className="hidden"
      />
    </div>
  );
}
