import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "../types";

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
      reason
    );
    if (response.success) {
      onSuccess();
      onClose();
    } else {
      setError(t("ItemsPage.Errors.updateFailed"));
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded p-4 space-y-4">
        <h2 className="text-lg font-bold">{t("ItemsPage.Modal.title")}</h2>

        <div className="text-sm text-slate-400">{item.name}</div>

        <div>
          <label className="block text-sm mb-1">
            {t("ItemsPage.Modal.currentStock")}
          </label>
          <div className="bg-slate-800 px-3 py-2 rounded">
            {item.stockQuantity}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            {t("ItemsPage.Modal.changeQuantity")}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 rounded bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            {t("ItemsPage.Modal.reason")}
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800"
          >
            <option value="">{t("ItemsPage.Modal.selectReason")}</option>
            <option value="restock">{t("ItemsPage.Reasons.restock")}</option>
            <option value="manual_adjustment">
              {t("ItemsPage.Reasons.manualAdjustment")}
            </option>
          </select>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-slate-700">
            {t("Common.cancel")}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
          >
            {t("Common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
