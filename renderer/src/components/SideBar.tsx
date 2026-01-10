import { ShoppingCart, Package, Tags } from "lucide-react";
import { PageType, UserRole } from "../types";
import { useTranslation } from "react-i18next";

type SidebarProps = {
  role: UserRole;
  page: PageType;
  setPage: (page: PageType) => void;
};

export default function Sidebar({ role, page, setPage }: SidebarProps) {
  const { t } = useTranslation();

  const navItems: {
    key: PageType;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    roles: UserRole[];
  }[] = [
    {
      key: "dashboard",
      label: t("SideBar.dashboard"),
      icon: ShoppingCart,
      roles: ["staff", "admin"],
    },
    {
      key: "products",
      label: t("SideBar.products"),
      icon: Package,
      roles: ["staff", "admin"],
    },
    {
      key: "categories",
      label: t("SideBar.categories"),
      icon: Tags,
      roles: ["admin"],
    },
  ];

  return (
    <aside className="w-56 border-r border-border bg-background">
      <div className="p-4 text-lg font-semibold">{t("SideBar.title")}</div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = page === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer
                  transition-colors
                  ${
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
      </nav>
    </aside>
  );
}
