// @ts-check
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

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
  integrations: [tailwind()],
});
