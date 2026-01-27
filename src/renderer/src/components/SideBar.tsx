import {
  ShoppingCart,
  Package,
  Tags,
  AlertTriangle,
  DollarSign,
  BarChart,
  Users,
} from "lucide-react";
import { PageType, UserRole } from "@/types/client";
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
      key: "reports",
      label: t("SideBar.reports"),
      icon: BarChart,
      roles: ["admin"],
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
    {
      key: "users",
      label: t("SideBar.users"),
      icon: Users,
      roles: ["admin"],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-900 text-slate-100">
      <div className="p-4 text-xl md:text-2xl font-bold">
        {t("SideBar.title")}
      </div>

      <nav className="flex flex-col gap-2 px-3">
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
                  flex items-center gap-4 px-4 py-3 rounded-lg text-base md:text-lg cursor-pointer transition-colors
                  ${
                    isActive
                      ? "bg-emerald-600 text-white font-medium"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }
                `}
              >
                <Icon size={24} />
                <span className="text-base md:text-lg font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
      </nav>
    </aside>
  );
}
