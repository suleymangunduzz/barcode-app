import { createContext, useCallback, useContext, useState } from "react";
import Toast, { ToastProps } from "./Toast";
import { ReactNode } from "react";

// Toast context type
interface ToastContextType {
  toast: (opts: {
    type?: ToastProps["type"];
    msg: ReactNode;
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<ReactNode>("");
  const [type, setType] = useState<ToastProps["type"]>("info");
  const [duration, setDuration] = useState<number>(2000);

  const toast = useCallback(
    ({
      type = "info",
      msg,
      duration = 2000,
    }: {
      type?: ToastProps["type"];
      msg: ReactNode;
      duration?: number;
    }) => {
      setType(type);
      setMsg(msg);
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
        message={msg}
        onClose={handleClose}
        type={type}
        duration={duration}
      />
    </ToastContext.Provider>
  );
}

export function useToastNotification() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastNotification must be used within a ToastProvider");
  return ctx;
}
