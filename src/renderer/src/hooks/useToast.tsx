import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import Toast, { ToastProps } from "@/components/Toast";

interface ToastContextType {
  toast: (opts: {
    type?: ToastProps["type"];
    message: ReactNode;
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<ReactNode>("");
  const [type, setType] = useState<ToastProps["type"]>("info");
  const [duration, setDuration] = useState<number>(2000);

  const toast = useCallback(
    ({
      type = "info",
      message,
      duration = 2000,
    }: {
      type?: ToastProps["type"];
      message: ReactNode;
      duration?: number;
    }) => {
      setType(type);
      setMessage(message);
      setDuration(duration);
      setShow(true);
    },
    []
  );

  const handleClose = useCallback(() => setShow(false), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast
        show={show}
        message={message}
        onClose={handleClose}
        type={type}
        duration={duration}
      />
    </ToastContext.Provider>
  );
}

export default function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    console.warn(
      "useToast must be used within a ToastProvider — falling back to noop",
    );
    return (_opts: { type?: ToastProps["type"]; message: ReactNode; duration?: number }) => {
      /* noop */
    };
  }
  return ctx.toast;
}
