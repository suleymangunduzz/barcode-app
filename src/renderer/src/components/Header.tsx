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
    <header className="h-24 border-b border-border px-6 flex items-center justify-between bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{t("Header.title")}</h1>

        <span className="text-base px-3 py-1 rounded bg-muted text-muted-foreground">
          {role === "admin" ? t("UserRole.admin") : t("UserRole.staff")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPage("dashboard")}
          aria-label={t("Header.cart", {
            count: cartItems.reduce((s, i) => s + i.quantity, 0),
          })}
          className="relative overflow-visible flex items-center gap-3 px-2 py-1 rounded hover:bg-muted cursor-pointer"
        >
          <ShoppingCart size={30} className="text-foreground" />
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 text-sm rounded-full bg-red-600 text-white font-medium">
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="text-lg px-4 py-2 rounded bg-destructive text-destructive-foreground hover:opacity-90 cursor-pointer"
        >
          {t("Header.logout")}
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className="text-base px-3 py-2 rounded border border-border hover:bg-muted cursor-pointer"
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
