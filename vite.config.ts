import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.md"],
  define: {
    Buffer: ["buffer", "Buffer"],
  },
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".md"],
  },
  server: {
    port: Number.parseInt(process.env.PORT || "3000"),
  },
});
