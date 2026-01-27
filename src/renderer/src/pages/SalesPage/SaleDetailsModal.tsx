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
      <div className="bg-slate-900 w-full max-w-lg rounded-lg p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {t("SalesPage.details.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-bold text-lg"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-lg text-slate-200">
          <div>
            <strong className="font-semibold">
              {t("SalesPage.details.date")}:
            </strong>{" "}
            <span className="ml-1">
              {new Date(sale.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <strong className="font-semibold">
              {t("SalesPage.details.soldBy")}:
            </strong>{" "}
            <span className="ml-1">{sale.soldBy?.name ?? "-"}</span>
          </div>
          <div>
            <strong className="font-semibold">
              {t("SalesPage.details.total")}:
            </strong>{" "}
            <span className="ml-1 text-2xl md:text-3xl font-bold">
              ₺{sale.totalAmount.toLocaleString("tr-TR")}
            </span>
          </div>

          <div className="mt-4 border-t border-slate-700 pt-3">
            <strong className="font-semibold">
              {t("SalesPage.details.items")}:
            </strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-lg">
              {sale.saleItems.map((si) => (
                <li key={si.id} className="py-0.5">
                  <span className="font-medium">{si.itemName}</span>
                  <span className="ml-2 text-slate-300">× {si.quantity}</span>
                  <span className="ml-3 font-semibold">
                    = ₺{si.totalPrice.toLocaleString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 font-semibold text-lg"
          >
            {t("Common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
