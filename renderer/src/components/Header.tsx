import { useTranslation } from "react-i18next";
import { UserRole } from "../types";

type HeaderProps = {
  role: UserRole;
  openLoginModal: () => void;
  onLogout: () => void;
};

export default function Header({
  role,
  openLoginModal,
  onLogout,
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="h-14 border-b border-border px-4 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">{t("Header.title")}</h1>
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {role === "admin" ? t("UserRole.admin") : t("UserRole.staff")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {role === "staff" && (
          <button
            type="button"
            onClick={openLoginModal}
            className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
          >
            {t("Header.loginAsAdmin")}
          </button>
        )}

        {role === "admin" && (
          <button
            type="button"
            onClick={onLogout}
            className="text-sm px-3 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-90 cursor-pointer"
          >
            {t("Header.logout")}
          </button>
        )}
      </div>
    </header>
  );
}
