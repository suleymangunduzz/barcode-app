import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Minus, Trash2 } from "lucide-react";

import { calculateTotal } from "@/utils/cart";
// barcode scanning handled globally by BarcodeScanProvider
import { useCart } from "@/context/CartContext";
import useToast from "@/hooks/useToast";

export default function Dashboard() {
  const {
    cartItems,
    addItemByBarcode,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleClearCart,
  } = useCart();
  const [isSaleInProgress, setIsSaleInProgress] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const toast = useToast();

  const totalAmount = calculateTotal(cartItems);

  // scanning is handled globally by BarcodeScanProvider

  const handleBarcodeInputBlur = async (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    const barcode = event.target.value.trim();
    if (!barcode) {
      event.target.value = "";
      return;
    }
    try {
      await addItemByBarcode(barcode);
    } finally {
      event.target.value = "";
    }
  };

  const handleCompleteSale = async () => {
    if (!cartItems.length) return;
    setIsSaleInProgress(true);

    try {
      const { role: userRole } = await window.api.getSession();
      const { users } = await window.api.getUsersByRole(userRole);
      const userId = users.length ? users[0].id : undefined;

      const response = await window.api.completeSale(cartItems, userId);

      if (response.success) {
        handleClearCart();
        toast({ type: "success", message: t("Dashboard.saleSuccess") });
      } else if (response.error === "INSUFFICIENT_STOCK") {
        toast({
          type: "error",
          message: t("Dashboard.insufficientStock", {
            itemName: response.itemName,
          }),
        });
      } else {
        toast({ type: "error", message: t("Dashboard.saleError") });
      }
    } catch {
      toast({ type: "error", message: t("Dashboard.saleError") });
    } finally {
      setIsSaleInProgress(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      <h2 className="text-2xl font-bold">{t("Dashboard.title")}</h2>

      {/* Barcode input */}
      <input
        ref={barcodeInputRef}
        type="text"
        name="barcode"
        placeholder={t("Dashboard.barcodePlaceholder")}
        onBlur={handleBarcodeInputBlur}
        className="
          w-full h-12 px-4 rounded
          bg-slate-800 text-white
          border border-slate-700
          focus:outline-none focus:ring-2 focus:ring-emerald-500
        "
      />

      {/* Sale cart */}
      <div className="flex-1 border border-slate-700 rounded bg-slate-900 flex flex-col">
        {/* Cart header */}
        <div className="border-b border-slate-700 px-4 py-2 font-medium bg-slate-800">
          {t("Dashboard.cart")}
        </div>

        {/* Cart body */}
        <div className="flex-1 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 mt-8 mb-8">
              {t("Dashboard.emptyCart")}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-4 py-2 text-left">
                    {t("Dashboard.SaleTable.product")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t("Dashboard.SaleTable.quantity")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t("Dashboard.SaleTable.price")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t("Dashboard.SaleTable.total")}
                  </th>
                  <th className="px-4 py-2 text-right">
                    {t("Dashboard.SaleTable.action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(
                  ({ itemId, name, quantity, unitPrice, totalPrice }, idx) => (
                    <tr
                      key={itemId}
                      className={`
                      border-b border-slate-700
                      ${idx % 2 === 0 ? "bg-slate-800" : "bg-slate-700"}
                      hover:bg-slate-600 transition-colors duration-200
                    `}
                    >
                      <td className="px-4 py-2 font-medium">{name}</td>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <button
                          onClick={() => handleDecrease(itemId)}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => handleIncrease(itemId)}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        ₺{unitPrice.toLocaleString("tr-TR")}
                      </td>
                      <td className="px-4 py-2">
                        ₺{totalPrice.toLocaleString("tr-TR")}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemove(itemId)}
                          className="p-1 rounded bg-red-600 text-white hover:bg-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Cart footer */}
        <div className="border-t border-slate-700 p-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-lg font-semibold">
            {t("Dashboard.total")}: ₺{totalAmount.toLocaleString("tr-TR")}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              disabled={cartItems.length === 0 || isSaleInProgress}
              onClick={handleClearCart}
              className={`px-6 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition font-medium ${
                cartItems.length === 0 || isSaleInProgress
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {t("Dashboard.clearCart")}
            </button>

            <button
              disabled={cartItems.length === 0 || isSaleInProgress}
              onClick={handleCompleteSale}
              className={`
                px-6 py-2 rounded font-medium
                transition
                ${
                  cartItems.length === 0 || isSaleInProgress
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }
              `}
            >
              {t("Dashboard.completeSale")}
            </button>
          </div>
        </div>
      </div>

      {/* audio handled by CartProvider */}
    </div>
  );
}
