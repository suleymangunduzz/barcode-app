import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { User } from "@/types/DB";

type Props = {
  role: User["role"];
  onSuccess: () => void;
};

export default function SignupModal({ role, onSuccess }: Props) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
  }, [role]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const requestData = {
        name,
        email,
        password,
      };

      const { success } =
        role === "admin"
          ? await window.api.signupFirstAdmin(requestData)
          : await window.api.signupStaff(requestData);

      if (success) {
        onSuccess();
      } else {
        alert("Bir hata olustu, lutfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Bir hata olustu, lutfen tekrar deneyin.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="bg-slate-800 p-6 rounded-lg w-96">
          <h2 className="text-xl mb-4">
            {role === "admin"
              ? t("SignupModal.titleAdmin")
              : t("SignupModal.titleStaff")}
          </h2>
          <input
            required
            name="name"
            className="w-full p-2 mb-2 rounded bg-slate-700"
            placeholder={t("SignupModal.namePlaceholder")}
          />
          <input
            required
            name="email"
            className="w-full p-2 mb-2 rounded bg-slate-700"
            placeholder={t("SignupModal.emailPlaceholder")}
          />
          <input
            required
            name="password"
            className="w-full p-2 mb-4 rounded bg-slate-700"
            type="password"
            placeholder={t("SignupModal.passwordPlaceholder")}
          />
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded">
              {t("SignupModal.signupButton")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
