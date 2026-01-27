import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useToast from "@/hooks/useToast";

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
  const toast = useToast();

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
      if (!res?.success) {
        const rawErr = res?.error;
        let msg = t("UsersPage.Errors.unknown");
        if (typeof rawErr === "string") {
          const key = `UsersPage.Errors.${rawErr}`;
          const translated = t(key);
          // if translation exists, use it, otherwise use raw error string
          msg = translated === key ? rawErr : translated;
        } else if (rawErr) {
          msg = String(rawErr);
        }
        setError(msg);
        toast({ type: "error", message: msg });
      } else {
        const successMsg = t("UsersPage.toast.addSuccess");
        toast({ type: "success", message: successMsg });
        onSaved();
        onClose();
      }
    } catch (e) {
      const msg = t("UsersPage.Errors.unknown");
      setError(msg);
      toast({ type: "error", message: msg });
    }
    setLoadingLocal(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 p-6 rounded w-full max-w-lg">
        <h3 className="text-xl md:text-2xl font-bold mb-3">
          {t("UsersPage.addModal.title")}
        </h3>
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium">
            {t("UsersPage.addModal.name")}
          </label>
          <input
            className="p-3 rounded text-lg bg-slate-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="text-base font-medium">
            {t("UsersPage.addModal.email")}
          </label>
          <input
            className="p-3 rounded text-lg bg-slate-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-base font-medium">
            {t("UsersPage.addModal.password")}
          </label>
          <input
            type="password"
            className="p-3 rounded text-lg bg-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="text-base font-medium">
            {t("UsersPage.addModal.role")}
          </label>
          <select
            className="p-3 rounded text-lg bg-slate-700"
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "admin")}
          >
            <option value="staff">{t("UserRole.staff")}</option>
            <option value="admin">{t("UserRole.admin")}</option>
          </select>

          {error && <div className="text-red-400 text-base">{error}</div>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 bg-slate-600 rounded text-base font-medium hover:bg-slate-500 transition"
              onClick={onClose}
            >
              {t("Common.cancel")}
            </button>
            <button
              className="px-4 py-2 bg-emerald-600 rounded text-base font-medium hover:bg-emerald-500 transition"
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
