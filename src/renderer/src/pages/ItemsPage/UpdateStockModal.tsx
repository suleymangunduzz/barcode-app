import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "@/types/DB";
import useToast from "@/hooks/useToast";

type Props = {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UpdateStockModal({ item, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  async function handleSubmit() {
    if (!quantity || !reason) {
      setError(t("ItemsPage.Errors.missingFields"));
      return;
    }

    setLoading(true);
    setError("");

    const response = await window.api.updateItemStock(
      item.id,
      quantity,
      reason,
    );

    if (response.success) {
      toast({ type: "success", message: t("ItemsPage.UpdateStock.success") });
      onSuccess();
      onClose();
    } else {
      setError(t("ItemsPage.Errors.updateFailed"));
      toast({ type: "error", message: t("ItemsPage.UpdateStock.error") });
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-lg p-6 space-y-4 shadow-xl">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white">
          {t("ItemsPage.Modal.title")}
        </h2>

        {/* Item name */}
        <div className="text-lg text-slate-300">{item.name}</div>

        {/* Current stock */}
        <div>
          <label className="block text-lg mb-1 text-slate-200">
            {t("ItemsPage.Modal.currentStock")}
          </label>
          <div className="bg-slate-700 px-4 py-3 rounded text-white font-semibold text-lg">
            {item.stockQuantity}
          </div>
        </div>

        {/* Change quantity */}
        <div>
          <label className="block text-lg mb-1 text-slate-200">
            {t("ItemsPage.Modal.changeQuantity")}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="
              w-full px-4 py-3 rounded
              bg-slate-700 text-white text-lg
              border border-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-lg mb-1 text-slate-200">
            {t("ItemsPage.Modal.reason")}
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="
              w-full px-4 py-3 rounded
              bg-slate-700 text-white text-lg
              border border-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            <option value="">{t("ItemsPage.Modal.selectReason")}</option>
            <option value="restock">{t("ItemsPage.Reasons.restock")}</option>
            <option value="manual_adjustment">
              {t("ItemsPage.Reasons.manualAdjustment")}
            </option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="text-lg text-white bg-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded
              bg-slate-600 text-white text-lg
              hover:bg-slate-500
              transition
            "
          >
            {t("Common.cancel")}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-4 py-2 rounded
              bg-blue-600 text-white text-lg
              hover:bg-blue-500
              transition
              font-semibold
              disabled:opacity-60
            "
          >
            {t("Common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
