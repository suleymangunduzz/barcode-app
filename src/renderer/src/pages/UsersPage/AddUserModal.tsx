import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AddUserModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [error, setError] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  async function handleCreate() {
    setError(null);
    if (!name.trim() || !email.trim() || !password)
      return setError(t("UsersPage.Errors.missingFields"));
    setLoadingLocal(true);
    try {
      const res = await window.api.createUserByAdmin({
        name,
        email,
        password,
        role,
      });
      if (!res?.success) setError(res?.error || t("UsersPage.Errors.unknown"));
      else {
        onSaved();
        onClose();
      }
    } catch (e) {
      setError(t("UsersPage.Errors.unknown"));
    }
    setLoadingLocal(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 p-4 rounded w-[420px]">
        <h3 className="text-lg font-semibold mb-2">
          {t("UsersPage.addModal.title")}
        </h3>
        <div className="flex flex-col gap-2">
          <label className="text-sm">{t("UsersPage.addModal.name")}</label>
          <input
            className="p-2 rounded bg-slate-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="text-sm">{t("UsersPage.addModal.email")}</label>
          <input
            className="p-2 rounded bg-slate-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-sm">{t("UsersPage.addModal.password")}</label>
          <input
            type="password"
            className="p-2 rounded bg-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="text-sm">{t("UsersPage.addModal.role")}</label>
          <select
            className="p-2 rounded bg-slate-700"
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "admin")}
          >
            <option value="staff">{t("UserRole.staff")}</option>
            <option value="admin">{t("UserRole.admin")}</option>
          </select>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 mt-3">
            <button
              className="px-3 py-1 bg-slate-600 rounded"
              onClick={onClose}
            >
              {t("Common.cancel")}
            </button>
            <button
              className="px-3 py-1 bg-emerald-600 rounded"
              onClick={handleCreate}
              disabled={loadingLocal}
            >
              {t("Common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
