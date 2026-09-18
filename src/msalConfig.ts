// src/msalConfig.ts
//
// MSAL (Microsoft Entra ID) sign-in is fully optional and gated behind the
// VITE_MSAL_ENABLED env var. When it is not set to "true", none of this
// module's configuration is required and msalInstance stays null.
import { PublicClientApplication, type Configuration, type RedirectRequest } from '@azure/msal-browser';

export const MSAL_ENABLED = import.meta.env.VITE_MSAL_ENABLED === 'true';

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID ?? '';
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID?.trim() || 'common';
const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin;
const scopes = (import.meta.env.VITE_MSAL_SCOPES ?? 'User.Read')
  .split(',')
  .map((scope) => scope.trim())
  .filter(Boolean);

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const loginRequest: RedirectRequest = {
  scopes,
};

export const msalInstance = MSAL_ENABLED ? new PublicClientApplication(msalConfig) : null;
