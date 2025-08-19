// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://nw-union.net",
  outDir: "./build",

  server: {
    host: "0.0.0.0",
    port: 4321,
  },

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: "cloudflare",
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
