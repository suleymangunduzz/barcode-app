import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import CategoryItemsModal from "./CategoryItemsModal";
import { Category } from "@/types/prisma";

export default function CategoriesPage({ isAdmin }: { isAdmin?: boolean }) {
  const { t } = useTranslation();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [viewItemsCategory, setViewItemsCategory] = useState<Category | null>(
    null
  );

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
        <h2 className="text-2xl font-bold">{t("CategoriesPage.title")}</h2>

        {isAdmin && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition"
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
        className="
          w-full mb-4 px-3 py-2 rounded
          bg-slate-800 text-slate-100
          border border-slate-700
          focus:outline-none focus:ring-2 focus:ring-emerald-500
        "
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
                <th className="text-right px-3 py-2">
                  {t("CategoriesPage.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category, index) => (
                <tr
                  key={category.id}
                  className={`
                    border-t border-slate-700
                    ${index % 2 === 0 ? "bg-slate-800" : "bg-slate-700"}
                    hover:bg-slate-600 transition-colors duration-200
                    text-slate-100
                  `}
                >
                  <td className="px-3 py-2">{category.name}</td>

                  <td className="px-3 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setViewItemsCategory(category)}
                      className="
                        text-sm px-3 py-1 rounded
                        bg-blue-600 text-white
                        hover:bg-blue-500 transition font-medium
                      "
                    >
                      {t("CategoriesPage.actions.viewItems")}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => setEditCategory(category)}
                        className="
                          text-sm px-3 py-1 rounded
                          bg-amber-600 text-white
                          hover:bg-amber-500 transition font-medium
                        "
                      >
                        {t("CategoriesPage.actions.edit")}
                      </button>
                    )}
                  </td>
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

      {viewItemsCategory && (
        <CategoryItemsModal
          category={viewItemsCategory}
          onClose={() => setViewItemsCategory(null)}
        />
      )}
    </div>
  );
}
