import { useTranslation } from "react-i18next";
import { UserRole, PageType } from "@/types/client";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

type HeaderProps = {
  role: UserRole;
  onLogout: () => void;
  setPage: (p: PageType) => void;
};

export default function Header({ role, onLogout, setPage }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { cartItems } = useCart();

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === "tr" ? "en" : "tr");
  };

  return (
    <header className="h-20 border-b border-border px-4 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">{t("Header.title")}</h1>

        <span className="text-sm px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {role === "admin" ? t("UserRole.admin") : t("UserRole.staff")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage("dashboard")}
          aria-label={t("Header.cart", {
            count: cartItems.reduce((s, i) => s + i.quantity, 0),
          })}
          className="relative overflow-visible flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
        >
          <ShoppingCart size={25} className="text-foreground" />
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center h-5 min-w-[1.5rem] px-1 text-xs rounded-full bg-destructive text-white font-medium whitespace-nowrap">
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="text-base px-3 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-90 cursor-pointer"
        >
          {t("Header.logout")}
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className="text-sm px-2 py-1 rounded border border-border hover:bg-muted cursor-pointer"
          title="Change language"
        >
          {`${t("Header.language")}: ${
            currentLang === "tr" ? "Türkçe" : "English"
          }`}
        </button>
      </div>
    </header>
  );
}
