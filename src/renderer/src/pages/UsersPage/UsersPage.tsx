import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type LocalUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

function ChangePasswordModal({
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

export default function UsersPage() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState<LocalUser[]>([]);
  const [staff, setStaff] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);

  async function load() {
    setLoading(true);
    const a = await window.api.getUsersByRole("admin");
    const s = await window.api.getUsersByRole("staff");
    setAdmins(a.users || []);
    setStaff(s.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("UsersPage.title")}</h2>

      <div className="mb-6">
        <h3 className="font-medium">{t("UsersPage.adminsTitle")}</h3>
        <div className="mt-2 bg-slate-800 rounded">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm">
                <th className="p-2">{t("UsersPage.table.name")}</th>
                <th>{t("UsersPage.table.email")}</th>
                <th>{t("UsersPage.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(admins || []).map((u) => (
                <tr key={u.id} className="border-t border-slate-700">
                  <td className="p-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      className="px-2 py-1 bg-slate-600 rounded"
                      onClick={() => setSelectedUser(u)}
                    >
                      {t("UsersPage.actions.changePassword")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-medium">{t("UsersPage.staffTitle")}</h3>
        <div className="mt-2 bg-slate-800 rounded">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm">
                <th className="p-2">{t("UsersPage.table.name")}</th>
                <th>{t("UsersPage.table.email")}</th>
                <th>{t("UsersPage.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(staff || []).map((u) => (
                <tr key={u.id} className="border-t border-slate-700">
                  <td className="p-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      className="px-2 py-1 bg-slate-600 rounded"
                      onClick={() => setSelectedUser(u)}
                    >
                      {t("UsersPage.actions.changePassword")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser ? (
        <ChangePasswordModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSaved={() => load()}
        />
      ) : null}
    </div>
  );
}
