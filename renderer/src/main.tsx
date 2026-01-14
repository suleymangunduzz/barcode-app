import ReactDOM from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App";
import { CartProvider } from "@/context/CartContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <CartProvider>
    <App />
  </CartProvider>
);
