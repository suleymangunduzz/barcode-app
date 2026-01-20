import { useEffect, useState } from "react";

import ItemsToolbar from "@/pages/ItemsPage/ItemsToolbar";
import ItemsTable from "@/pages/ItemsPage/ItemsTable";
import UpdateStockModal from "@/pages/ItemsPage/UpdateStockModal";
import UpdatePriceModal from "@/pages/ItemsPage/UpdatePriceModal";
import { useTranslation } from "react-i18next";
import { Item } from "@/types/DB";
import AddItemModal from "@/pages/ItemsPage/AddItemModal";

export default function ItemsPage({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [priceModalItem, setPriceModalItem] = useState<Item | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    async function fetchItems() {
      const data = await window.api.getAllItems();
      setItems(data);
      setFilteredItems(data);
    }
    fetchItems();
  }, []);

  function handleSearch(value: string) {
    setSearch(value);

    if (!value.trim()) {
      setFilteredItems(items);
      return;
    }

    // barcode = numbers only
    const isBarcode = /^\d+$/.test(value);

    if (isBarcode) {
      const found = items.filter((i) => i.barcode === value);
      setFilteredItems(found);
    } else {
      const lower = value.toLowerCase();
      setFilteredItems(
        items.filter(
          (i) =>
            i.name.toLowerCase().includes(lower) ||
            i.brand.toLowerCase().includes(lower),
        ),
      );
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">{t("ItemsPage.title")}</h2>
        {isAdmin && (
          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition"
            onClick={() => setShowAddModal(true)}
          >
            {t("ItemsPage.addNew")}
          </button>
        )}
      </div>
      <ItemsToolbar
        value={search}
        onChange={handleSearch}
        onClear={() => {
          setSearch("");
          setFilteredItems(items);
        }}
      />

      <ItemsTable
        items={filteredItems}
        isAdmin={isAdmin}
        onUpdateStock={(item) => setSelectedItem(item)}
        openPriceModal={(item) => setPriceModalItem(item)}
      />

      {selectedItem && (
        <UpdateStockModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={async () => {
            const data = await window.api.getAllItems();
            setItems(data);
            setFilteredItems(data);
          }}
        />
      )}
      {priceModalItem && (
        <UpdatePriceModal
          item={priceModalItem}
          onClose={() => setPriceModalItem(null)}
          onSuccess={async () => {
            const data = await window.api.getAllItems();
            setItems(data);
            setFilteredItems(data);
          }}
        />
      )}

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            const data = await window.api.getAllItems();
            setItems(data);
            setFilteredItems(data);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
