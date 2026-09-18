MetadataTaggerFrontend

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the Chambo Metadata Tagger API | `http://localhost:5000` |
| `VITE_MSAL_ENABLED` | When `true`, replaces the email/password login with Microsoft (MSAL) sign-in | `false` |
| `VITE_MSAL_CLIENT_ID` | Azure AD app registration client ID (required when MSAL is enabled) | _(none)_ |
| `VITE_MSAL_TENANT_ID` | Azure AD tenant ID used to build the authority URL | `common` |
| `VITE_MSAL_REDIRECT_URI` | Redirect URI registered in Azure AD | current origin |
| `VITE_MSAL_SCOPES` | Comma-separated list of scopes requested on sign-in | `User.Read` |

MSAL sign-in currently only acquires and displays the signed-in Microsoft account; it is not yet wired up to the backend (no session/JWT is created).

