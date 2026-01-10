type Props = {
  stock: number;
  min: number;
};

export default function StockBadge({ stock, min }: Props) {
  if (stock === 0) {
    return (
      <span className="px-2 py-0.5 text-xs rounded bg-red-600 text-white">
        Tükendi
      </span>
    );
  }

  if (stock <= min) {
    return (
      <span className="px-2 py-0.5 text-xs rounded bg-yellow-500 text-black">
        Az stok ({stock})
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 text-xs rounded bg-green-600 text-white">
      Var ({stock})
    </span>
  );
}
