import { useEffect, useState } from "react";

import LoginModal from "./components/LoginModal";
import Sidebar from "./components/SideBar";
import Header from "./components/Header";
import { PageType, UserRole } from "./types";
import Dashboard from "./components/Dashboard";

function App() {
  const [role, setRole] = useState<UserRole>("staff");
  const [page, setPage] = useState<PageType>("dashboard");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const { role } = await window.api.getSession();
      setRole(role);
    }
    fetchSession();
  }, []);

  const onLoginSuccess = () => {
    setRole("admin");
    setShowLogin(false);
  };

  const onLogout = async () => {
    window.api.logout();
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
          {page === "dashboard" && <Dashboard />}
        </main>
      </div>
    </div>
  );
}

export default App;
