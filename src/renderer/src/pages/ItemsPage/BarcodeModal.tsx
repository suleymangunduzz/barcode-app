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
  const scanner = useBarcodeScannerRegister();
  const toast = useToast();

  const { t } = useTranslation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // register scanner handler while modal is open
    const handler = (barcode: string) => {
      // If barcode already exists, show toast and don't populate
      window.api.getItemByBarcode(barcode).then((item) => {
        if (item) {
          toast({
            type: "error",
            message: t("ItemsPage.BarcodeModal.barcodeExistToast"),
          });
          return;
        }

        setValue(barcode);
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-lg w-[400px] space-y-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">Add Barcode</h2>

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

        <div className="flex justify-between">
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
