import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartItem } from "@/types/client";
import { Item } from "@/types/prisma";
import {
  increaseItem,
  decreaseItem,
  removeItem,
  clearCart,
} from "@/utils/cart";

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Item) => void;
  addItemByBarcode: (barcode: string) => Promise<void>;
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

  const addItem = (item: Item) => {
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

  const addItemByBarcode = async (barcode: string) => {
    const item = await window.api.getItemByBarcode(barcode);
    if (!item) return;
    addItem(item);
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
    </CartContext.Provider>
  );
}
