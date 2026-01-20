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
  if (!ctx) {
    // Gracefully return no-op handlers when provider is missing (prevents runtime crashes
    // in environments like tests or if provider wasn't mounted).
    return {
      registerHandler: () => {},
      unregisterHandler: () => {},
    } as BarcodeScanContextType;
  }
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
  const lastToastRef = useRef<{ barcode: string; ts: number } | null>(null);

  function sanitizeBarcode(input: string) {
    if (!input) return "";
    // remove non-printable/control characters, trim, and limit length
    const cleaned = input.replace(/[^\x20-\x7E]/g, "").trim();
    const max = 24;
    if (cleaned.length <= max) return cleaned;
    return cleaned.slice(0, 12) + "…" + cleaned.slice(-8);
  }

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

    // default behavior: add item to cart; show toast if not found
    try {
      const res = await addItemByBarcode(barcode);
      if (!res.success && res.reason === "no-item") {
        const disp = sanitizeBarcode(barcode);

        // suppress repeated identical toasts within short window
        const now = Date.now();
        if (
          lastToastRef.current?.barcode === disp &&
          now - lastToastRef.current.ts < 2500
        ) {
          return;
        }
        lastToastRef.current = { barcode: disp, ts: now };

        toast({
          type: "error",
          message: t("ItemsPage.toast.notFound", { barcode: disp }),
          duration: 2500,
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
