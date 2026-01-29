import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "@/types/DB";
import useToast from "@/hooks/useToast";

type Props = {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UpdatePriceModal({ item, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [price, setPrice] = useState(item.currentPrice);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await window.api.updateItemPrice({
      itemId: item.id,
      newPrice: price,
    });

    setLoading(false);

    if (!res.success) {
      toast({ type: "error", message: t(`Errors.${res.error}`) });
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 w-full max-w-sm rounded-lg p-6 space-y-4 shadow-xl"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-white">
          {t("ItemsPage.UpdatePrice.title")}
        </h2>

        {/* Item name */}
        <div className="text-lg text-slate-300">{item.name}</div>

        {/* Price input */}
        <div>
          <label className="block text-lg mb-1 text-slate-200">
            {t("ItemsPage.UpdatePrice.price")}
          </label>
          <input
            type="number"
            step="1"
            value={price}
            min={1}
            max={100_000}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="
              w-full px-4 py-3 rounded
              bg-slate-700 text-white text-lg
              border border-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

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
            type="submit"
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
      </form>
    </div>
  );
}
