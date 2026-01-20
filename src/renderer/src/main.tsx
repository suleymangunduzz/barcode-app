import ReactDOM from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App";
import { ToastProvider } from "@/hooks/useToast";
import { CartProvider } from "@/context/CartContext";
import { BarcodeScanProvider } from "@/context/BarcodeScanContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <CartProvider>
      <BarcodeScanProvider>
        <App />
      </BarcodeScanProvider>
    </CartProvider>
  </ToastProvider>,
);
