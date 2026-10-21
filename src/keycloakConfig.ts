// src/keycloakConfig.ts
//
// Keycloak sign-in is fully optional and gated behind the VITE_KEYCLOAK_ENABLED
// env var. When it is not set to "true", keycloakInstance stays null.
//
// There is no "audience" setting here: the `aud` claim is added to the access
// token by Keycloak (an Audience mapper on the client scope) and validated by the
// backend against Keycloak:Audience.
import Keycloak from 'keycloak-js';

export const KEYCLOAK_ENABLED = import.meta.env.VITE_KEYCLOAK_ENABLED === 'true';

const url = import.meta.env.VITE_KEYCLOAK_URL ?? '';
const realm = import.meta.env.VITE_KEYCLOAK_REALM ?? '';
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? '';

export const keycloakInstance = KEYCLOAK_ENABLED ? new Keycloak({ url, realm, clientId }) : null;

export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  pkceMethod: 'S256' as const,
  checkLoginIframe: false,
  redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || window.location.origin,
};
