import { useEffect, useState } from "react";

import ItemsToolbar from "./ItemsToolbar";
import ItemsTable from "./ItemsTable";
import { Item } from "../types";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");

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
      <ItemsToolbar
        value={search}
        onChange={handleSearch}
        onClear={() => {
          setSearch("");
          setFilteredItems(items);
        }}
      />

      <ItemsTable items={filteredItems} />
    </div>
  );
}
