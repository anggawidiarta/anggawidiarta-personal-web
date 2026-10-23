import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.anggawidiarta.xyz",
  markdown: {
    // Grey-scale code theme driven by CSS variables (see .prose-press in global.css).
    shikiConfig: { theme: "css-variables" },
  },
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: "static",
  image: {
    // Article covers and inline images are served from the Supabase Storage bucket.
    domains: ["ntqfybkdhysogsfjkuua.supabase.co"],
  },
  // Public pages stay prerendered; only /studio/* opts out (prerender = false).
  adapter: vercel(),
  env: {
    schema: {
      // Publishable values (safe to expose). Never put the service-role key here.
      PUBLIC_SUPABASE_URL: envField.string({ context: "server", access: "public" }),
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      // Vercel Deploy Hook that rebuilds the site after a publish. Optional locally.
      VERCEL_DEPLOY_HOOK_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  devToolbar: {
    enabled: false,
  },
});
