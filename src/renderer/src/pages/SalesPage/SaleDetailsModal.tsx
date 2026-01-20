import { useTranslation } from "react-i18next";
import { Sale } from "@/types/DB";

type Props = {
  sale: Sale;
  onClose: () => void;
};

export default function SaleDetailsModal({ sale, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-lg p-5 space-y-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            {t("SalesPage.details.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-base text-slate-200">
          <div>
            <strong>{t("SalesPage.details.date")}:</strong>{" "}
            {new Date(sale.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>{t("SalesPage.details.soldBy")}:</strong>{" "}
            {sale.soldBy?.name ?? "-"}
          </div>
          <div>
            <strong>{t("SalesPage.details.total")}:</strong> ₺
            {sale.totalAmount.toLocaleString("tr-TR")}
          </div>

          <div className="mt-3 border-t border-slate-700 pt-2">
            <strong>{t("SalesPage.details.items")}:</strong>
            <ul className="list-disc list-inside">
              {sale.saleItems.map((si) => (
                <li key={si.id}>
                  {si.itemName} × {si.quantity} = ₺
                  {si.totalPrice.toLocaleString("tr-TR")}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 font-medium"
          >
            {t("Common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
