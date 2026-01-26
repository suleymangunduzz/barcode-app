import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { generateUniqueBarcode } from "@/utils/generateUniqueBarcode";
import { useBarcodeScannerRegister } from "@/context/BarcodeScanContext";
import useToast from "@/hooks/useToast";

type BarcodeModalProps = {
  initialValue?: string;
  onClose: () => void;
  onConfirm: (barcode: string) => void;
};

export default function BarcodeModal({
  initialValue = "",
  onClose,
  onConfirm,
}: BarcodeModalProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scanner = useBarcodeScannerRegister();
  const toast = useToast();

  const { t } = useTranslation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // register scanner handler while modal is open
    const handler = (barcode: string) => {
      // sanitize scanned input: reject strings that look like emails, contain spaces
      // or disallowed characters (likely not valid barcodes). This prevents
      // accidental population with sensitive data (e.g., login credentials).
      const cleaned = (barcode || "").trim();
      // Basic checks: no whitespace, no @ (emails), allowed chars only
      const allowed = /^[A-Za-z0-9\-\._]+$/;
      if (
        !cleaned ||
        /\s/.test(cleaned) ||
        cleaned.includes("@") ||
        !allowed.test(cleaned) ||
        cleaned.length > 128
      ) {
        // show a validation error instead of populating the field
        toast({
          type: "error",
          message: t("ItemsPage.BarcodeModal.invalidFormat"),
        });
        return;
      }

      // If barcode already exists, show toast and don't populate
      window.api.getItemByBarcode(cleaned).then((item) => {
        if (item) {
          toast({
            type: "error",
            message: t("ItemsPage.BarcodeModal.barcodeExistToast"),
          });
          return;
        }

        setValue(cleaned);
        setError(null);
        // focus input so user sees value
        inputRef.current?.focus();
      });
    };

    scanner.registerHandler(handler);
    return () => {
      scanner.unregisterHandler();
    };
  }, [scanner]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!value) {
        if (svgRef.current) svgRef.current.innerHTML = "";
        return;
      }

      try {
        const mod = await import("jsbarcode");
        const JsBarcode = (mod as any).default ?? mod;
        if (!mounted) return;
        if (svgRef.current) {
          JsBarcode(svgRef.current, value, {
            format: "ean13",
            displayValue: true,
            fontSize: 14,
            height: 60,
            width: 2,
            margin: 8,
          });

          // ensure the SVG scales to fill the reserved container without
          // changing layout. Use the rendered bbox to set a viewBox so CSS
          // width/height:100% will scale the content to the container.
          try {
            const bbox = svgRef.current.getBBox();
            if (bbox.width && bbox.height) {
              svgRef.current.setAttribute(
                "viewBox",
                `0 0 ${Math.round(bbox.width)} ${Math.round(bbox.height)}`,
              );
            }
            svgRef.current.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svgRef.current.setAttribute("width", "100%");
            svgRef.current.setAttribute("height", "100%");
            svgRef.current.style.display = "block";
          } catch (e) {
            // getBBox can throw in some SVG contexts; ignore and fall back
          }
        }
      } catch (e) {
        console.error("Barcode render error", e);
        toast({
          type: "error",
          message:
            t("ItemsPage.BarcodeModal.renderError") ||
            "Unable to render barcode",
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [value]);

  async function validateBarcode(barcode: string) {
    if (!barcode) return false;

    const item = await window.api.getItemByBarcode(barcode);
    if (item) {
      return false;
    }

    return true;
  }

  async function handleConfirm() {
    const isValid = await validateBarcode(value);

    if (!isValid) {
      setError(t("ItemsPage.BarcodeModal.barcodeExistError"));
      return;
    }
    onConfirm(value);
    onClose();
  }

  async function handleGenerate() {
    try {
      const barcode = await generateUniqueBarcode();
      setValue(barcode);
      setError(null);
    } catch (err) {
      setError(t("ItemsPage.BarcodeModal.barcodeNotGeneratedError"));
    }
  }

  function handleClear() {
    setValue("");
    setError(null);
    inputRef.current?.focus();
  }

  async function handleDownload() {
    if (!svgRef.current || !value) {
      toast({
        type: "error",
        message:
          t("ItemsPage.BarcodeModal.noBarcode") || "No barcode to download",
      });
      return;
    }

    try {
      const svgEl = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const svgBase64 = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      const img = new Image();
      // set crossOrigin to avoid tainting if needed
      img.crossOrigin = "anonymous";
      img.src = svgBase64;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = (e) => reject(e);
      });

      const canvas = document.createElement("canvas");
      // set canvas size to a reasonable scale
      const scale = 3;
      const bbox = svgEl.getBBox();
      canvas.width = Math.max(1, Math.round(bbox.width * scale));
      canvas.height = Math.max(1, Math.round(bbox.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngData = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = pngData;
      a.download = `${value}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Download error", e);
      toast({
        type: "error",
        message:
          t("ItemsPage.BarcodeModal.downloadError") ||
          "Unable to download barcode",
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-lg w-[600px] space-y-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">
          {t("ItemsPage.BarcodeModal.title")}
        </h2>

        <input
          ref={inputRef}
          value={value}
          disabled
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder={t("ItemsPage.BarcodeModal.scan")}
          className="w-full px-3 py-2 rounded bg-slate-800 text-slate-100 border border-slate-700"
        />

        {error && <p className="text-base text-red-400">{error}</p>}

        <div className="flex justify-center mt-3 w-full">
          <svg
            ref={svgRef}
            className="bg-white p-2 rounded w-full h-40"
            aria-hidden
          />
        </div>

        <div className="flex justify-between gap-10">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-3 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              {t("ItemsPage.BarcodeModal.generate")}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              {t("ItemsPage.BarcodeModal.clear")}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              {t("ItemsPage.BarcodeModal.download") || "Download PNG"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded bg-slate-700"
            >
              {t("Common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-2 rounded bg-emerald-600 text-white"
            >
              {t("Common.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
