import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "@/types/prisma";

type Props = {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditCategoryModal({
  category,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(category.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError(t("CategoriesPage.errors.emptyName"));
      return;
    }

    if (name.trim() === category.name) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    const res = await window.api.updateCategory({
      id: category.id,
      name: name.trim(),
    });

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
        className="bg-slate-900 w-full max-w-sm rounded-lg p-5 space-y-4 shadow-xl"
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-white">
          {t("CategoriesPage.editModal.title")}
        </h2>

        {/* Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full px-3 py-2 rounded
            bg-slate-800 text-slate-100
            border border-slate-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded
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
              px-4 py-2 rounded
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
