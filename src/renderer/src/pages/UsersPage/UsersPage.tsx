import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AddUserModal from "./AddUserModal";
import ChangePasswordModal from "./ChangePasswordModal";

type LocalUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export default function UsersPage() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState<LocalUser[]>([]);
  const [staff, setStaff] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t("UsersPage.title")}</h2>
        <div>
          <button
            className="px-3 py-1 bg-emerald-600 rounded"
            onClick={() => setShowAddModal(true)}
          >
            {t("UsersPage.addUserButton")}
          </button>
        </div>
      </div>

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
      {showAddModal ? (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            load();
          }}
        />
      ) : null}
    </div>
  );
}
