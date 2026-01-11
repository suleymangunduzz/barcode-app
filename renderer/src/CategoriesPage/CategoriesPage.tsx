import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "../types";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";

export default function CategoriesPage({ isAdmin }: { isAdmin?: boolean }) {
  const { t } = useTranslation();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  async function fetchCategories() {
    const data = await window.api.getAllCategories();
    setAllCategories(data);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return allCategories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allCategories, search]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("CategoriesPage.title")}</h1>

        {isAdmin && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm"
          >
            {t("CategoriesPage.actions.add")}
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={t("CategoriesPage.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded bg-slate-800 text-white"
      />

      {/* Empty state */}
      {filteredCategories.length === 0 ? (
        <div className="text-slate-400">{t("CategoriesPage.noCategories")}</div>
      ) : (
        <div className="border border-slate-700 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="text-left px-3 py-2">
                  {t("CategoriesPage.table.name")}
                </th>
                {isAdmin && (
                  <th className="text-right px-3 py-2">
                    {t("CategoriesPage.table.actions")}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t border-slate-700 hover:bg-slate-800"
                >
                  <td className="px-3 py-2">{category.name}</td>

                  {isAdmin && (
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => setEditCategory(category)}
                        className="text-xs px-2 py-1 rounded bg-amber-600 text-white"
                      >
                        {t("CategoriesPage.actions.edit")}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddCategoryModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            fetchCategories();
          }}
        />
      )}

      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSuccess={() => {
            setEditCategory(null);
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}
