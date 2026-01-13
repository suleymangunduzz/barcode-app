import { useEffect, useState } from "react";

import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import Sidebar from "./components/SideBar";
import Header from "./components/Header";
import { PageType, UserRole } from "./types/client";
import Dashboard from "./components/Dashboard";
import ItemsPage from "./ItemsPage";
import CategoriesPage from "./CategoriesPage";
import LowStockPage from "./LowStockPage";
import SalesPage from "./SalesPage";

function App() {
  const [role, setRole] = useState<UserRole>("staff");
  const [page, setPage] = useState<PageType>("dashboard");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    async function fetchSessionAndCheckAdmin() {
      const { role } = await window.api.getSession();
      setRole(role);

      const { needed } = await window.api.isFirstAdminNeeded();
      if (needed) {
        setShowSignup(true);
      }
    }
    fetchSessionAndCheckAdmin();
  }, []);

  const onLoginSuccess = () => {
    setRole("admin");
    setShowLogin(false);
  };

  const onSignupSuccess = () => {
    setRole("admin");
    setShowSignup(false);
  };

  const onLogout = async () => {
    window.api.logout();
    setRole("staff");
  };

  return (
    <div className="h-screen flex bg-slate-900 text-slate-100">
      <Sidebar role={role} page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <Header
          role={role}
          openLoginModal={() => setShowLogin(true)}
          onLogout={onLogout}
        />

        {showSignup && (
          <SignupModal
            onSignup={onSignupSuccess}
            onClose={() => setShowSignup(false)}
          />
        )}

        {showLogin && !showSignup && (
          <LoginModal
            onLogin={onLoginSuccess}
            onClose={() => setShowLogin(false)}
          />
        )}

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
