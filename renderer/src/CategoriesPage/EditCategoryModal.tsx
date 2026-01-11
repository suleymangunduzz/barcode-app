import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "../types/prisma";

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
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded p-4 w-80">
        <h2 className="text-lg font-bold mb-3">
          {t("CategoriesPage.editModal.title")}
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-700 text-white"
        />

        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

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
            className="px-3 py-1 rounded bg-amber-600 text-white"
          >
            {t("Common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
