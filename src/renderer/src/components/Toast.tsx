import { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";

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

  const toastEl = (
    <div
      className={`fixed right-4 bottom-4 min-w-[320px] max-w-lg px-4 py-3 rounded shadow-lg text-white ${color} animate-fade-in-up`}
      style={{ pointerEvents: "auto", zIndex: 99999 }}
      role="alert"
    >
      <div className="flex items-start justify-between w-full">
        <span className="flex-1 whitespace-nowrap pr-2">{message}</span>
        <button
          className="ml-2 flex-shrink-0 text-white/80 hover:text-white text-lg font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return toastEl;
  return ReactDOM.createPortal(toastEl, document.body);
}

// Tailwind animation (add to your global CSS if not present):
// @keyframes fade-in-up {
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; }
