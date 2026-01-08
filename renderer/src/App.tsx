import { useEffect, useState } from "react";
import AdminLogin from "./components/LoginModal";

function App() {
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const session = await window.api.getSession();
      setRole(session.role);
    }
    fetchSession();
  }, []);

  const handleAdminLogin = async () => {
    setShowLogin(true);
  };

  const onLoginSuccess = () => {
    setRole("admin");
    setShowLogin(false);
  };

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
      </header>

      <main>
        {role === "staff" && (
          <div>
            <button
              className="bg-blue-500 px-3 py-1 rounded"
              onClick={handleAdminLogin}
            >
              Admin Login
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
