// Point at your own API by setting VITE_API_URL in frontend/.env.local.
// Vite inlines this at build time, so the fallback is the deployed API:
// that keeps the Vercel build working without any dashboard configuration.
export const baseURL =
  import.meta.env.VITE_API_URL ??
  'https://hiring-platform-api-h3bz.onrender.com';
