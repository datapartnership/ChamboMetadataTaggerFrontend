MetadataTaggerFrontend

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the Chambo Metadata Tagger API | `http://localhost:5000` |
| `VITE_MSAL_ENABLED` | When `true`, replaces the email/password login with Microsoft (MSAL) sign-in | `false` |
| `VITE_MSAL_CLIENT_ID` | Azure AD app registration client ID (required when MSAL is enabled) | _(none)_ |
| `VITE_MSAL_TENANT_ID` | Azure AD tenant ID used to build the authority URL | `common` |
| `VITE_MSAL_REDIRECT_URI` | Exact `/callback` redirect URI registered in Azure AD | current origin |
| `VITE_MSAL_SCOPES` | Comma-separated list of scopes requested on sign-in | `User.Read` |

When MSAL is enabled, the application handles the registered `/callback` route, acquires an
access token for `VITE_MSAL_SCOPES`, and sends it to `GET /api/Auth/me`. The API validates
the token, provisions or synchronizes the user, and returns the application user used by the
role-specific dashboards. Configure `VITE_MSAL_REDIRECT_URI` with the exact callback URL
registered in Entra ID (for example, `http://localhost:5173/callback`).
