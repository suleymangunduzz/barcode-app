import { ReactNode, useEffect } from "react";

export type ToastProps = {
  message: ReactNode;
  show: boolean;
  onClose: () => void;
  duration?: number; // ms
  type?: "success" | "error" | "info";
};

export default function Toast({
  message,
  show,
  onClose,
  duration = 2000,
  type = "info",
}: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  let color = "bg-blue-600";
  if (type === "success") color = "bg-green-600";
  if (type === "error") color = "bg-red-600";

  return (
    <div
      className={`fixed z-50 right-4 bottom-4 min-w-[200px] max-w-xs px-4 py-3 rounded shadow-lg text-white ${color} animate-fade-in-up`}
      style={{ pointerEvents: "auto" }}
      role="alert"
    >
      <span>{message}</span>
      <button
        className="ml-4 text-white/80 hover:text-white text-lg font-bold focus:outline-none"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

// Tailwind animation (add to your global CSS if not present):
// @keyframes fade-in-up {
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; }
