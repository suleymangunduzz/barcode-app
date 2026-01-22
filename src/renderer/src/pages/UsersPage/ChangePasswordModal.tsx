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
      <div className="bg-slate-800 p-4 rounded w-[420px]">
        <h3 className="text-lg font-semibold mb-2">
          {t("UsersPage.changePasswordFor", { name: user.name })}
        </h3>
        <p className="text-sm text-slate-400 mb-3">
          {isTargetStaff
            ? t("UsersPage.modalDescriptionStaff")
            : t("UsersPage.modalDescriptionAdmin")}
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm">
            {t("UsersPage.adminCurrentPassword")}
          </label>
          <input
            type="password"
            className="p-2 rounded bg-slate-700"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />

          <label className="text-sm">
            {isTargetStaff
              ? t("UsersPage.newPasswordForStaff")
              : t("UsersPage.newPassword")}
          </label>
          <input
            type="password"
            className="p-2 rounded bg-slate-700"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label className="text-sm">
            {isTargetStaff
              ? t("UsersPage.confirmPasswordForStaff")
              : t("UsersPage.confirmPassword")}
          </label>
          <input
            type="password"
            className="p-2 rounded bg-slate-700"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

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
