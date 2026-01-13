import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onSignup: () => void;
  onClose: () => void;
};

export default function SignupModal({ onSignup, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { t } = useTranslation();

  const handleSubmit = async () => {
    const result = await window.api.signupFirstAdmin({ name, email, password });
    if (result.success) onSignup();
    else alert(result.error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-lg w-96">
        <h2 className="text-xl mb-4">{t("SignupModal.title")}</h2>
        <input
          className="w-full p-2 mb-2 rounded bg-slate-700"
          placeholder={t("SignupModal.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-2 rounded bg-slate-700"
          placeholder={t("SignupModal.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 rounded bg-slate-700"
          type="password"
          placeholder={t("SignupModal.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button className="bg-slate-600 px-4 py-2 rounded" onClick={onClose}>
            {t("Common.cancel")}
          </button>
          <button
            className="bg-blue-600 px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            {t("SignupModal.signupButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
