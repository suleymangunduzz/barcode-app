import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export default function ItemsToolbar({ value, onChange, onClear }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("ItemsPage.searchPlaceholder")}
        className="w-full h-10 px-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="px-3 h-10 rounded bg-slate-700 hover:bg-slate-600"
        >
          {t("ItemsPage.clearSearch")}
        </button>
      )}
    </div>
  );
}
