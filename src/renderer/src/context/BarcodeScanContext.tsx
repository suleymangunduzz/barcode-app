import React, { createContext, useContext, useRef, useEffect } from "react";
import useBarcodeScanner from "@/hooks/useBarcodeScanner";
import { useCart } from "@/context/CartContext";
import useToast from "@/hooks/useToast";
import { useTranslation } from "react-i18next";

type ScanHandler = (barcode: string) => void;

type BarcodeScanContextType = {
  registerHandler: (h: ScanHandler) => void;
  unregisterHandler: () => void;
};

const BarcodeScanContext = createContext<BarcodeScanContextType | undefined>(
  undefined,
);

export function useBarcodeScannerRegister() {
  const ctx = useContext(BarcodeScanContext);
  if (!ctx)
    throw new Error("useBarcodeScannerRegister must be used within provider");
  return ctx;
}

export function BarcodeScanProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const handlerRef = useRef<ScanHandler | null>(null);
  const { addItemByBarcode } = useCart();

  const toast = useToast();
  const { t } = useTranslation();

  // global scanner
  useBarcodeScanner(async (barcode: string) => {
    if (!barcode) return;
    if (handlerRef.current) {
      try {
        handlerRef.current(barcode);
        return;
      } catch (err) {
        // fallthrough to default behavior
        // eslint-disable-next-line no-console
        console.error("barcode handler failed", err);
      }
    }

    // default behavior: add item to cart
    try {
      const res = await addItemByBarcode(barcode);
      if (!res.success && res.reason === "no-item") {
        toast({
          type: "error",
          message: t("ItemsPage.toast.notFound", { barcode }),
        });
      }
    } catch (err) {
      // ignore
    }
  });

  useEffect(() => {
    return () => {
      handlerRef.current = null;
    };
  }, []);

  const value = {
    registerHandler: (h: ScanHandler) => {
      handlerRef.current = h;
    },
    unregisterHandler: () => {
      handlerRef.current = null;
    },
  };

  return (
    <BarcodeScanContext.Provider value={value}>
      {children}
    </BarcodeScanContext.Provider>
  );
}

export default BarcodeScanContext;
