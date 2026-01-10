import { useEffect, useState } from "react";

import LoginModal from "./components/LoginModal";
import Sidebar from "./components/SideBar";
import Header from "./components/Header";
import { PageType, UserRole } from "./types";

function App() {
  const [role, setRole] = useState<UserRole>("staff");
  const [page, setPage] = useState<PageType>("dashboard");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const session = await window.api.getSession();
      setRole(session.role);
    }
    fetchSession();
  }, []);

  const onLoginSuccess = () => {
    setRole("admin");
    setShowLogin(false);
  };

  const onLogout = async () => {
    try {
      await window.api.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setRole("staff");
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      <Sidebar role={role} page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <Header
          role={role}
          openLoginModal={() => setShowLogin(true)}
          onLogout={onLogout}
        />
        {showLogin && (
          <LoginModal
            onLogin={onLoginSuccess}
            onClose={() => setShowLogin(false)}
          />
        )}
        <main className="flex-1 p-4">
          {page === "dashboard" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Dashboard</h2>
              {role === "staff" && (
                <p>Staff can create sales and search products here.</p>
              )}
              {role === "admin" && (
                <p>Admin can edit stock, categories, prices, etc.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-900 text-white p-4">
      {showLogin && (
        <AdminLogin
          onLogin={onLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      <header className="mb-4">
        <h1 className="text-2xl font-bold">Barcode System</h1>
        <p>Current role: {role}</p>
        {role === "admin" && (
          <button
            type="button"
            className="mt-2 bg-red-500 px-3 py-1 rounded cursor-pointer"
            onClick={onLogout}
          >
            Cikis Yap
          </button>
        )}
      </header>

      <main>
        {role === "staff" && (
          <div>
            <button
              className="bg-blue-500 px-3 py-1 rounded"
              onClick={handleAdminLogin}
            >
              Oturum Ac
            </button>

            <p>Staff can create sales and search products here.</p>
          </div>
        )}

        {role === "admin" && (
          <div>
            <p>Admin can edit stock, categories, prices, etc.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
