/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MSAL_ENABLED?: string;
  readonly VITE_MSAL_CLIENT_ID?: string;
  readonly VITE_MSAL_TENANT_ID?: string;
  readonly VITE_MSAL_REDIRECT_URI?: string;
  readonly VITE_MSAL_SCOPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
