/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API. Unset falls back to the deployed API, see app/config.ts. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
