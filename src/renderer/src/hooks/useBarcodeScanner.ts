import { useEffect, useRef } from "react";

type BarcodeHandler = (barcode: string) => void;

export default function useBarcodeScanner(onScan: BarcodeHandler) {
  const bufferRef = useRef("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Ignore keystrokes that originate from form controls or editable elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          (target as HTMLElement).isContentEditable
        ) {
          return;
        }
      }

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
