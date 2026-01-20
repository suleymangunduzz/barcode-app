import { CartItem } from "@/types/client";

export function increaseItem(items: CartItem[], itemId: number): CartItem[] {
  return items.map((item) =>
    item.itemId === itemId
      ? {
          ...item,
          quantity: item.quantity + 1,
          totalPrice: (item.quantity + 1) * item.unitPrice,
        }
      : item
  );
}

export function decreaseItem(items: CartItem[], itemId: number): CartItem[] {
  return items
    .map((item) =>
      item.itemId === itemId
        ? {
            ...item,
            quantity: item.quantity - 1,
            totalPrice: (item.quantity - 1) * item.unitPrice,
          }
        : item
    )
    .filter((item) => item.quantity > 0);
}

export function removeItem(items: CartItem[], itemId: number): CartItem[] {
  return items.filter((item) => item.itemId !== itemId);
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.totalPrice, 0);
}

export function clearCart() {
  return [];
}
