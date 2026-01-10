import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Minus, Trash2 } from "lucide-react";

import {
  increaseItem,
  decreaseItem,
  removeItem,
  calculateTotal,
  clearCart,
} from "../utils/cart";
import useBarcodeScanner from "../hooks/useBarcodeScanner";
import { CartItem } from "../types";

export default function Dashboard() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSaleInProgress, setIsSaleInProgress] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const totalAmount = calculateTotal(cartItems);

  const fetchItemAndAddToCart = async (barcode: string) => {
    const item = await window.api.getItemByBarcode(barcode);

    if (!item) {
      console.warn("❌ Item not found:", barcode);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);

      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                totalPrice: (i.quantity + 1) * i.unitPrice,
              }
            : i
        );
      }

      return [
        ...prev,
        {
          itemId: item.id,
          barcode: item.barcode,
          name: item.name,
          unitPrice: item.currentPrice,
          quantity: 1,
          totalPrice: item.currentPrice,
        },
      ];
    });
  };

  useBarcodeScanner(async (barcode) => {
    // Fetch item details by barcode
  });

  const handleBarcodeInputBlur = async (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    const barcode = event.target.value.trim();

    if (!barcode) {
      event.target.value = "";
      return;
    }

    try {
      await fetchItemAndAddToCart(barcode);
    } catch (error) {
      console.error("Error fetching item by barcode:", error);
    } finally {
      event.target.value = "";
    }
  };

  const handleIncrease = (itemId: number) => {
    setCartItems((prev) => increaseItem(prev, itemId));
  };

  const handleDecrease = (itemId: number) => {
    setCartItems((prev) => decreaseItem(prev, itemId));
  };

  const handleRemove = (itemId: number) => {
    setCartItems((prev) => removeItem(prev, itemId));
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) return;

    setIsSaleInProgress(true);

    try {
      const { role: userRole } = await window.api.getSession();

      const { users } = await window.api.getUsersByRole(userRole);
      const userId = users.length > 0 ? users[0].id : undefined;

      const response = await window.api.completeSale(cartItems, userId);

      if (response.success) {
        alert(t("Dashboard.saleSuccess"));
        setCartItems([]); // Clear cart
      } else {
        alert(t("Dashboard.saleError"));
      }
    } catch (error) {
      console.error("Complete sale failed:", error);
      alert(t("Dashboard.saleError"));
    } finally {
      setIsSaleInProgress(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{t("Dashboard.title")}</h2>

      <input
        ref={barcodeInputRef}
        type="text"
        name="barcode"
        placeholder={t("Dashboard.barcodePlaceholder")}
        onBlur={handleBarcodeInputBlur}
        className="w-full h-12 px-4 rounded border border-border bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Sale cart */}
      <div className="flex-1 border border-border rounded bg-background flex flex-col">
        {/* Cart header */}
        <div className="border-b border-border px-4 py-2 font-medium">
          {t("Dashboard.cart")}
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground mt-8 mb-8">
              {t("Dashboard.emptyCart")}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="px-4 py-2">
                    {t("Dashboard.SaleTable.product")}
                  </th>
                  <th className="px-4 py-2">
                    {t("Dashboard.SaleTable.quantity")}
                  </th>
                  <th className="px-4 py-2">
                    {t("Dashboard.SaleTable.price")}
                  </th>
                  <th className="px-4 py-2">
                    {t("Dashboard.SaleTable.total")}
                  </th>
                  <th className="px-4 py-2 text-right">
                    {t("Dashboard.SaleTable.action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(
                  ({ itemId, name, quantity, unitPrice, totalPrice }) => (
                    <tr key={itemId} className="border-b border-border">
                      <td className="px-4 py-2">{name}</td>

                      <td className="px-4 py-2 flex items-center gap-2">
                        <button
                          onClick={() => handleDecrease(itemId)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-6 text-center">{quantity}</span>

                        <button
                          onClick={() => handleIncrease(itemId)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Plus size={16} />
                        </button>
                      </td>

                      <td className="px-4 py-2">₺ {unitPrice}</td>
                      <td className="px-4 py-2">₺ {totalPrice}</td>

                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemove(itemId)}
                          className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Cart footer */}
        <div className="border-t border-border p-4 flex items-center justify-between">
          <div className="text-lg font-semibold">
            {t("Dashboard.total")}: ₺ {totalAmount}
          </div>

          <button
            onClick={() => setCartItems(clearCart())}
            className="px-6 py-2 rounded bg-destructive text-destructive-foreground"
          >
            {t("Dashboard.clearCart")}
          </button>

          <button
            disabled={cartItems.length === 0 || isSaleInProgress}
            className={`px-6 py-2 rounded ${
              cartItems.length === 0 || isSaleInProgress
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground"
            }`}
            onClick={handleCompleteSale}
          >
            {t("Dashboard.completeSale")}
          </button>
        </div>
      </div>
    </div>
  );
}
