import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Category, Item } from "../types";

type Props = {
  category: Category;
  onClose: () => void;
};

export default function CategoryItemsModal({ category, onClose }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchItems() {
      const data = await window.api.getItemsByCategory(category.id);
      setItems(data);
    }
    fetchItems();
  }, [category.id]);

  const filteredItems = useMemo(() => {
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.barcode.includes(search)
    );
  }, [items, search]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded p-4 w-[700px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">{category.name}</h2>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={t("CategoriesPage.items.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 px-3 py-2 rounded bg-slate-700 text-white"
        />

        {/* Table */}
        <div className="overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="text-slate-400 text-sm">
              {t("CategoriesPage.items.noItems")}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-700 text-slate-300">
                <tr>
                  <th className="text-left px-2 py-1">
                    {t("CategoriesPage.items.name")}
                  </th>
                  <th className="text-left px-2 py-1">
                    {t("CategoriesPage.items.barcode")}
                  </th>
                  <th className="text-right px-2 py-1">
                    {t("CategoriesPage.items.stock")}
                  </th>
                  <th className="text-right px-2 py-1">
                    {t("CategoriesPage.items.price")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-700">
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1">{item.barcode}</td>
                    <td className="px-2 py-1 text-right">
                      {item.stockQuantity}
                    </td>
                    <td className="px-2 py-1 text-right">
                      ₺{item.currentPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
