import { useTranslation } from "react-i18next";

type Props = {
  stock: number;
  min: number;
};

export default function StockBadge({ stock, min }: Props) {
  const { t } = useTranslation();

  if (stock === 0) {
    return (
      <span className="px-2 py-0.5 text-sm rounded bg-red-600 text-white">
        {t("ItemsPage.Table.stockSoldOut")}
      </span>
    );
  }

  if (stock <= min) {
    return (
      <span className="px-2 py-0.5 text-sm rounded bg-yellow-500 text-black">
        {t("ItemsPage.Table.stockLow", { stock })}
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 text-sm rounded bg-green-600 text-white">
      {t("ItemsPage.Table.stockAvailable", { stock })}
    </span>
  );
}
