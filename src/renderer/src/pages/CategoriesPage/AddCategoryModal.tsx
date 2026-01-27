import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddCategoryModal({ onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError(t("CategoriesPage.errors.emptyName"));
      return;
    }

    setLoading(true);
    setError(null);

    const res = await window.api.createCategory({ name: name.trim() });

    setLoading(false);

    if (!res.success) {
      setError(t(`CategoriesPage.errors.${res.error}`));
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 w-full max-w-md rounded-lg p-6 space-y-5 shadow-xl"
      >
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {t("CategoriesPage.addModal.title")}
        </h2>

        {/* Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("CategoriesPage.addModal.placeholder")}
          className="
            w-full px-4 py-3 rounded text-lg
            bg-slate-800 text-slate-100
            border border-slate-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />

        {/* Error */}
        {error && (
          <div className="text-red-400 text-lg bg-red-900/30 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="
              px-5 py-2.5 rounded text-lg
              bg-slate-700 text-slate-200
              hover:bg-slate-600
              transition
            "
          >
            {t("Common.cancel")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              px-5 py-2.5 rounded text-lg
              bg-emerald-600 text-white
              hover:bg-emerald-500
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
