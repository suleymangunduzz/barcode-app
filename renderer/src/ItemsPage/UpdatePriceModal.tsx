import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "../types";

type Props = {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UpdatePriceModal({ item, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
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
      alert(t(`Errors.${res.error}`));
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded w-80">
        <h2 className="text-lg font-bold mb-3">
          {t("ItemsPage.UpdatePrice.title")}
        </h2>

        <input
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full mb-4 p-2 rounded bg-slate-700 text-white"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-600"
          >
            {t("Common.cancel")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 rounded bg-amber-600"
          >
            {t("Common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
