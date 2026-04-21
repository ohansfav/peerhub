import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react', 'daisyui'],
          stream: ['stream-chat', 'stream-chat-react'],
        },
      },
    },
  },
  server: {
    allowedHosts: [
      ".ngrok-free.dev",
      ".ngrok.io",
      "localhost",
      "127.0.0.1",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
        timeout: 30000,
      },
    },
    middlewareMode: false,
  },
});

