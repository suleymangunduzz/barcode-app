import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartItem } from "@/types/client";
import { Item } from "@/types/prisma";
import {
  increaseItem,
  decreaseItem,
  removeItem,
  clearCart,
} from "@/utils/cart";
import useBarcodeBeep from "@/hooks/useBarcodeBeep";
import useToast from "@/hooks/useToast";
import { useTranslation } from "react-i18next";

type AddResult =
  | { success: true }
  | { success: false; reason: "no-item" | "insufficient-stock" };

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Item) => Promise<AddResult>;
  addItemByBarcode: (barcode: string) => Promise<AddResult>;
  handleIncrease: (itemId: number) => void;
  handleDecrease: (itemId: number) => void;
  handleRemove: (itemId: number) => void;
  handleClearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const { audioRef, playBeep } = useBarcodeBeep();
  const toast = useToast();
  const { t } = useTranslation();

  const addItem = async (item: Item): Promise<AddResult> => {
    const cartItem = cartItems.find((i) => i.itemId === item.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    if (item.stockQuantity - cartQuantity < 1) {
      // central toast for insufficient stock
      toast({
        type: "error",
        message: t("ItemsPage.toast.insufficientStock", { name: item.name }),
      });
      return { success: false, reason: "insufficient-stock" };
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

    try {
      await playBeep();
    } catch {}

    // central success toast
    toast({
      type: "success",
      message: t("ItemsPage.toast.addedToCart", { name: item.name }),
    });
    return { success: true };
  };

  const addItemByBarcode = async (barcode: string): Promise<AddResult> => {
    const item = await window.api.getItemByBarcode(barcode);
    if (!item) return { success: false, reason: "no-item" };
    return addItem(item);
  };

  const handleIncrease = (itemId: number) =>
    setCartItems((prev) => increaseItem(prev, itemId));
  const handleDecrease = (itemId: number) =>
    setCartItems((prev) => decreaseItem(prev, itemId));
  const handleRemove = (itemId: number) =>
    setCartItems((prev) => removeItem(prev, itemId));
  const handleClearCart = () => setCartItems(clearCart());

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        addItemByBarcode,
        handleIncrease,
        handleDecrease,
        handleRemove,
        handleClearCart,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src="/sounds/barcode-beep.mp3"
        preload="auto"
        className="hidden"
      />
    </CartContext.Provider>
  );
}
