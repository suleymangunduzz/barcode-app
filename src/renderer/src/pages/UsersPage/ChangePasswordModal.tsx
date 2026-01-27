import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type LocalUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export default function ChangePasswordModal({
  user,
  onClose,
  onSaved,
}: {
  user: LocalUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const isTargetStaff = user.role === "staff";
  const [adminPassword, setAdminPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (!adminPassword)
      return setError(t("UsersPage.Errors.missingAdminPassword"));
    if (!newPassword) return setError(t("UsersPage.Errors.missingNewPassword"));
    if (newPassword !== confirm)
      return setError(t("UsersPage.Errors.passwordMismatch"));

    setLoading(true);
    try {
      const res = await window.api.changeUserPasswordByAdmin({
        adminPassword,
        targetUserId: user.id,
        newPassword,
      });

      if (!res?.success) {
        setError(res?.error || t("UsersPage.Errors.unknown"));
      } else {
        onSaved();
        onClose();
      }
    } catch (e) {
      setError(t("UsersPage.Errors.unknown"));
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 p-6 rounded w-full max-w-lg">
        <h3 className="text-xl md:text-2xl font-bold mb-3">
          {t("UsersPage.changePasswordFor", { name: user.name })}
        </h3>
        <p className="text-base text-slate-400 mb-4">
          {isTargetStaff
            ? t("UsersPage.modalDescriptionStaff")
            : t("UsersPage.modalDescriptionAdmin")}
        </p>
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium">
            {t("UsersPage.adminCurrentPassword")}
          </label>
          <input
            type="password"
            className="p-3 rounded text-lg bg-slate-700"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />

          <label className="text-base font-medium">
            {isTargetStaff
              ? t("UsersPage.newPasswordForStaff")
              : t("UsersPage.newPassword")}
          </label>
          <input
            type="password"
            className="p-3 rounded text-lg bg-slate-700"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label className="text-base font-medium">
            {isTargetStaff
              ? t("UsersPage.confirmPasswordForStaff")
              : t("UsersPage.confirmPassword")}
          </label>
          <input
            type="password"
            className="p-3 rounded text-lg bg-slate-700"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

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
              onClick={handleSave}
              disabled={loading}
            >
              {t("Common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
