import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import Sidebar from "@/components/SideBar";
import Header from "@/components/Header";
import { PageType, UserRole } from "@/types/client";
import Dashboard from "@/components/Dashboard";
import ItemsPage from "@/pages/ItemsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import LowStockPage from "@/pages/LowStockPage";
import SalesPage from "@/pages/SalesPage";

function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [page, setPage] = useState<PageType>("dashboard");
  const [showSignupStaff, setShowSignupStaff] = useState(false);
  const [showAdminSignup, setShowAdminSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    async function fetchSessionAndCheckAdmin() {
      setIsLoading(true);
      const { role } = await window.api.getSession();
      setRole(role);

      const { needed } = await window.api.isFirstAdminNeeded();
      if (needed) {
        setShowAdminSignup(true);
      }

      const { count: userCount } = await window.api.getUserCount();

      if (userCount < 2) {
        setShowSignupStaff(true);
      }
      setIsLoading(false);
    }
    fetchSessionAndCheckAdmin();
  }, []);

  const onLogout = async () => {
    window.api.logout();
    setRole(null);
  };

  if (isLoading) {
    return null;
  }

  if (showAdminSignup) {
    return (
      <SignupModal onSuccess={() => setShowAdminSignup(false)} role="admin" />
    );
  }

  if (showSignupStaff) {
    return (
      <SignupModal onSuccess={() => setShowSignupStaff(false)} role="staff" />
    );
  }

  if (role === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        {t("LoginModal.shouldLoginText")}
        <LoginModal onLogin={(user) => setRole(user.role)} />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-900 text-slate-100">
      <Sidebar role={role} page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <Header role={role} onLogout={onLogout} setPage={setPage} />

        <main className="flex-1 p-4 overflow-auto">
          {page === "dashboard" && <Dashboard />}
          {page === "products" && <ItemsPage isAdmin={role === "admin"} />}
          {page === "categories" && (
            <CategoriesPage isAdmin={role === "admin"} />
          )}
          {page === "lowStock" && <LowStockPage />}
          {page === "sales" && <SalesPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
