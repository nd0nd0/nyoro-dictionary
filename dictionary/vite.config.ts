import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "server" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
