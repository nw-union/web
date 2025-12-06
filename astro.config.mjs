// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://nw-union.net",
  outDir: "./build",
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    "/discord": {
      status: 307,
      destination: "https://discord.gg/faPNeuCQdF",
    }
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "cloudflare",
  }),
});
