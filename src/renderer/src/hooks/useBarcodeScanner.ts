import { useEffect, useRef } from "react";

type BarcodeHandler = (barcode: string) => void;

export default function useBarcodeScanner(onScan: BarcodeHandler) {
  const bufferRef = useRef("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Enter = end of barcode
      if (e.key === "Enter") {
        if (bufferRef.current.length > 0) {
          onScan(bufferRef.current);
          bufferRef.current = "";
        }
        return;
      }

      // Only accept visible characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan]);
}
