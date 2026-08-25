import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.ASSET_BASE || "./",
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
});
