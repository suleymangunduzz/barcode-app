import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useToast from "@/hooks/useToast";
import { toEAN13 } from "@/utils/ean13";
import JsBarcode from "jsbarcode";

type Props = {
  value: string;
  onClose: () => void;
};

export default function BarcodeViewerModal({ value, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const toast = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!mounted) return;
        if (svgRef.current) {
          // choose format: try EAN-13 when appropriate, otherwise use CODE128
          const isNumeric = /^[0-9]+$/.test(value);
          let renderValue = value;
          let format: string = "code128";

          if (isNumeric) {
            if (value.length === 13) {
              format = "ean13";
            } else if (value.length === 12) {
              const ean = toEAN13(value);
              if (ean) {
                renderValue = ean;
                format = "ean13";
              }
            }
          }

          JsBarcode(svgRef.current, renderValue, {
            format,
            displayValue: true,
            fontSize: 14,
            height: 60,
            width: 2,
            margin: 8,
          });

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
            // ignore getBBox errors
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
      img.crossOrigin = "anonymous";
      img.src = svgBase64;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = (e) => reject(e);
      });

      const canvas = document.createElement("canvas");
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
      <div className="bg-slate-900 p-6 rounded-lg w-[560px] space-y-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">
          {t("ItemsPage.BarcodeModal.title")}
        </h2>

        <div className="w-full">
          <div className="flex justify-center mt-3 w-full">
            <svg
              ref={svgRef}
              className="bg-white p-2 rounded w-full h-40"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              {t("ItemsPage.BarcodeModal.download") || "Download PNG"}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Common.close")}
              className="px-3 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 font-semibold"
            >
              {t("Common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
