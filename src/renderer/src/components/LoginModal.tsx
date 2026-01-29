import { useState } from "react";
import { useTranslation } from "react-i18next";

type LoginModalProps = {
  onLogin: (user: any) => void;
};

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError(t("LoginModal.errors.missingFields"));
      return;
    }

    try {
      const { success, user } = await window.api.login(email, password);

      if (success) {
        onLogin(user);
      } else {
        setError(t("LoginModal.errors.invalidCredentials"));
      }
    } catch (err) {
      setError(t("LoginModal.errors.unknownError"));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-6 rounded shadow-md w-96">
        <form onSubmit={onSubmit}>
          <h2 className="text-xl font-bold mb-4 text-black">
            {t("LoginModal.title")}
          </h2>
          <input
            className="w-full border p-2 mb-2 text-black"
            placeholder={t("LoginModal.emailPlaceholder")}
            name="email"
            type="email"
            maxLength={50}
          />
          <input
            className="w-full border p-2 mb-2 text-black"
            placeholder={t("LoginModal.passwordPlaceholder")}
            name="password"
            type="password"
            maxLength={50}
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            {t("LoginModal.loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
