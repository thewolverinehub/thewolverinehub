import { defineConfig } from "astro/config";
import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";

// Railway (and Cloudflare later) terminate HTTPS in front of the Node server, so Astro only sees
// plain http. Listing our own domains lets it trust X-Forwarded-Host / X-Forwarded-Proto — without
// that, form POSTs (like Sign out) are rejected by the cross-site check and redirects point at http://.
const hosts = new Set([
  "web-production-2a3c3.up.railway.app",
  "thewolverinehub.com",
  "www.thewolverinehub.com",
]);
try {
  const configured = process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL).hostname : "";
  if (configured && configured !== "localhost") hosts.add(configured);
} catch { /* ignore a malformed PUBLIC_SITE_URL */ }

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),

  server: {
    host: true,
  },

  security: {
    allowedDomains: [...hosts].map((hostname) => ({ hostname, protocol: "https" })),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
