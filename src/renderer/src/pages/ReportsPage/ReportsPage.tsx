import { useTranslation } from "react-i18next";

export default function ReportsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">{t("ReportsPage.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("ReportsPage.empty", "No reports yet.")}
      </p>
    </div>
  );
}
