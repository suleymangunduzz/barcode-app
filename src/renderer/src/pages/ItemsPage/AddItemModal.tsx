import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "@/types/DB";
import BarcodeModal from "@/pages/ItemsPage/BarcodeModal";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddItemModal({ onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [barcode, setBarcode] = useState<string>("");
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    barcode: "",
    name: "",
    brand: "",
    model: "",
    categoryId: "",
    currentPrice: "",
    stockQuantity: "0",
    minStockThreshold: "0",
  });

  useEffect(() => {
    window.api.getAllCategories().then(setCategories);
  }, []);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Client-side validation
    if (!barcode) {
      setError(
        t("ItemsPage.AddModal.errors.noBarcode") || "Barcode is required",
      );
      return;
    }

    if (!form.name) {
      setError(t("ItemsPage.AddModal.errors.noName") || "Name is required");
      return;
    }

    const price = Number(form.currentPrice);
    if (!form.currentPrice || Number.isNaN(price) || price <= 0) {
      setError(
        t("ItemsPage.AddModal.errors.invalidPrice") ||
          "Price must be greater than 0",
      );
      return;
    }

    setError(null);

    await window.api.addNewItem({
      barcode,
      name: form.name,
      brand: form.brand || null,
      model: form.model || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      currentPrice: Number(form.currentPrice),
      stockQuantity: Number(form.stockQuantity),
      minStockThreshold: Number(form.minStockThreshold),
    });

    onSuccess();
  }

  const inputClass =
    "w-full px-3 py-2 rounded bg-slate-800 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {isBarcodeModalOpen && (
        <BarcodeModal
          onClose={() => setIsBarcodeModalOpen(false)}
          onConfirm={setBarcode}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-6 rounded-lg w-[420px] space-y-4 border border-slate-700 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-100">
          {t("ItemsPage.AddModal.title")}
        </h2>

        <div className="flex gap-2">
          <input
            disabled
            value={barcode}
            placeholder={t("ItemsPage.AddModal.fields.barcode")}
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />

          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="px-3 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 transition whitespace-nowrap"
          >
            {barcode
              ? t("ItemsPage.AddModal.changeBarcode")
              : t("ItemsPage.AddModal.addBarcode")}
          </button>
        </div>

        <input
          required
          placeholder={t("ItemsPage.AddModal.fields.name")}
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder={t("ItemsPage.AddModal.fields.brand")}
          value={form.brand}
          onChange={(e) => updateField("brand", e.target.value)}
          className={inputClass}
        />

        <input
          placeholder={t("ItemsPage.AddModal.fields.model")}
          value={form.model}
          onChange={(e) => updateField("model", e.target.value)}
          className={inputClass}
        />

        <select
          value={form.categoryId}
          onChange={(e) => updateField("categoryId", e.target.value)}
          className={`${inputClass} cursor-pointer`}
          required
        >
          <option value="">{t("ItemsPage.AddModal.fields.noCategory")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          required
          placeholder={t("ItemsPage.AddModal.fields.price")}
          value={form.currentPrice}
          onChange={(e) => updateField("currentPrice", e.target.value)}
          className={inputClass}
        />

        <div>
          <label className="block text-base font-medium text-slate-300 mb-1">
            {t("ItemsPage.AddModal.fields.stockLabel")}
          </label>
          <input
            required
            type="number"
            placeholder={t("ItemsPage.AddModal.fields.stock")}
            value={form.stockQuantity}
            onChange={(e) => updateField("stockQuantity", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {t("ItemsPage.AddModal.fields.minStockLabel")}
          </label>
          <input
            required
            type="number"
            placeholder={t("ItemsPage.AddModal.fields.minStock")}
            value={form.minStockThreshold}
            onChange={(e) => updateField("minStockThreshold", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
          {error && (
            <div className="self-start text-sm text-red-400 mr-auto">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
          >
            {t("Common.cancel")}
          </button>
          <button
            type="submit"
            disabled={
              !barcode ||
              !form.name ||
              !form.currentPrice ||
              Number(form.currentPrice) <= 0
            }
            className={`px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition font-semibold shadow-sm ${!barcode || !form.name || !form.currentPrice || Number(form.currentPrice) <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {t("Common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
