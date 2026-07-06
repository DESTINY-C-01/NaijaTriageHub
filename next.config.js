/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forces a 100% static export -> raw HTML/CSS/JS in the `out/` folder.
  // Deployable to any static host (Netlify, GitHub Pages, a shared cPanel
  // account, or served straight off a Raspberry Pi at a clinic).
  output: 'export',

  // next/image's default optimizer needs a server - disable it so images
  // just get served as static files.
  images: {
    unoptimized: true,
  },

  // Makes every route export as /route/index.html instead of /route.html.
  // This plays nicer with basic static file servers and the service worker's
  // navigation fallback logic.
  trailingSlash: true,

  // Keep the client JS bundle as small as possible for low-end devices.
  reactStrictMode: true,
};

module.exports = nextConfig;