import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// بلجن Tailwind الرسمى لـ Vite (من غير ما نحتاج postcss config)
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // مهم لـ GitHub Pages (الموقع شغال تحت /E-commerce-training-one/)
  // و وقت التطوير افتح: http://localhost:5173/E-commerce-training-one/
  base: "/E-commerce-training-one/",
});
