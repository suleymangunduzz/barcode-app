import { useEffect, useState } from "react";

import ItemsToolbar from "./ItemsToolbar";
import ItemsTable from "./ItemsTable";
import UpdateStockModal from "./UpdateStockModal";
import { Item } from "../types";
import UpdatePriceModal from "./UpdatePriceModal";
import { useTranslation } from "react-i18next";

export default function ItemsPage({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [priceModalItem, setPriceModalItem] = useState<Item | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
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
            i.brand.toLowerCase().includes(lower)
        )
      );
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">{t("ItemsPage.title")}</h2>
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
    </div>
  );
}
