import {
  ShoppingCart,
  Package,
  Tags,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { PageType, UserRole } from "../types/client";
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
      key: "sales",
      label: t("SideBar.sales"),
      icon: DollarSign,
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
      roles: ["staff", "admin"],
    },
    {
      key: "lowStock",
      label: t("SideBar.lowStock"),
      icon: AlertTriangle,
      roles: ["staff", "admin"],
    },
  ];

  return (
    <aside className="w-56 border-r border-slate-700 bg-slate-900 text-slate-100">
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
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                  ${isActive ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:bg-slate-700 hover:text-white"}
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
