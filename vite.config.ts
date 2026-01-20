import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwind()],
  root: path.resolve(__dirname, "src/renderer"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist/renderer"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer/src"),
      "@/types": path.resolve(__dirname, "./src/renderer/src/types"),
      "@/components": path.resolve(__dirname, "./src/renderer/src/components"),
      "@/hooks": path.resolve(__dirname, "./src/renderer/src/hooks"),
      "@/utils": path.resolve(__dirname, "./src/renderer/src/utils"),
      "@/translations": path.resolve(
        __dirname,
        "./src/renderer/src/translations",
      ),
      "@/context": path.resolve(__dirname, "./src/renderer/src/context"),
      "@/pages": path.resolve(__dirname, "./src/renderer/src/pages"),
    },
  },
});
