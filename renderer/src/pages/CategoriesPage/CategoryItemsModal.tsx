import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Category, Item } from "@/types/prisma";
import { useCart } from "@/context/CartContext";

type Props = {
  category: Category;
  onClose: () => void;
};

export default function CategoryItemsModal({ category, onClose }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");

  const { addItem } = useCart();

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

  const handleAdd = async (item: Item) => {
    await addItem(item);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-3xl max-h-[80vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{category.name}</h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none transition"
            aria-label={t("Common.close")}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-700">
          <input
            type="text"
            placeholder={t("CategoriesPage.items.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-5 py-3">
          {filteredItems.length === 0 ? (
            <div className="text-slate-400 text-base">
              {t("CategoriesPage.items.noItems")}
            </div>
          ) : (
            <table className="w-full text-base border-collapse">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-300 border-b border-slate-700">
                  <th className="text-left px-3 py-2 font-medium">
                    {t("CategoriesPage.items.name")}
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    {t("CategoriesPage.items.barcode")}
                  </th>
                  <th className="text-right px-3 py-2 font-medium">
                    {t("CategoriesPage.items.stock")}
                  </th>
                  <th className="text-right px-3 py-2 font-medium">
                    {t("CategoriesPage.items.price")}
                  </th>
                  <th className="">{t("CategoriesPage.items.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800 hover:bg-slate-800/60 transition"
                  >
                    <td className="px-3 py-2 text-slate-100">{item.name}</td>
                    <td className="px-3 py-2 text-slate-300">{item.barcode}</td>
                    <td className="px-3 py-2 text-right text-slate-100">
                      {item.stockQuantity}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-100">
                      ₺{item.currentPrice}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-100">
                      <button
                        onClick={() => handleAdd(item)}
                        className="text-base px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition font-medium"
                      >
                        {t("CategoriesPage.items.addToCart")}
                      </button>
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
