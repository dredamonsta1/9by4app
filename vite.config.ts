import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // proxy requests from /api to your heroku app
      "/api": {
        target: "https://ninebyfourapi.herokuapp.com",
        changeOrigin: true,
        secure: false,
        // This line is new. It removes the /api prefix from the request path.
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
