import dotenv from "dotenv";
import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import manifest from "./manifest.json";
import { replaceCodePlugin } from "vite-plugin-replace";
import { version } from "./package.json";

dotenv.config();

// defineManifest and pull version from package.json
const buildManifest = defineManifest({
  ...manifest,
  version,
  name: "My Extension",
});

const isProduction = process.env.NODE_ENV_PROD === "true";

export default defineConfig({
  server: {
    port: 7234,
  },
  build: {
    rollupOptions: {
      input: { onboarding: `src/pages/onboarding/index.html` },
      output: {
        chunkFileNames: isProduction
          ? `chunks/[hash].js`
          : `chunks/[name]-[hash].js`,
      },
    },
  },
  plugins: [
    react(),
    crx({ manifest: buildManifest }),
    replaceCodePlugin({
      replacements: [
        {
          from: "process.env.NEXT_PUBLIC_SUPABASE_URL",
          to: JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL),
        },
        {
          from: "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY",
          to: JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        },
        {
          from: "process.env.NODE_ENV_PROD",
          to: JSON.stringify(process.env.NODE_ENV_PROD),
        },
        {
          from: "process.env.MIXPANEL_TOKEN",
          to: JSON.stringify(process.env.MIXPANEL_TOKEN),
        }
      ],
    }),
  ],
});
