import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),

  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["abcdealtoys.up.railway.app"],
    },
  },
});
