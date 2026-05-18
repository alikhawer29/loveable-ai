import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/** Vite does not copy dotfiles from `public/` into `dist/`; Apache needs `.htaccess` beside `index.html`. */
function copyPublicHtaccessToDist() {
  return {
    name: "copy-public-htaccess",
    closeBundle() {
      const src = path.resolve(__dirname, "public/.htaccess");
      const dest = path.resolve(__dirname, "dist/.htaccess");
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    copyPublicHtaccessToDist(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
