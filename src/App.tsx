import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { MsalLoginForm } from './components/MsalLoginForm';
import { MsalCallback } from './components/MsalCallback';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TaggerDashboard } from './components/tagger/TaggerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { ConsumerDashboard } from './components/consumer/ConsumerDashboard';
import { PublicCatalogPage } from './components/catalog/PublicCatalogPage';
import { loginRequest, MSAL_ENABLED } from './msalConfig';
import { KEYCLOAK_ENABLED, keycloakInitOptions, keycloakInstance } from './keycloakConfig';
import { KeycloakLoginForm } from './components/KeycloakLoginForm';
import { CATALOG_PATH, usePathname } from './navigation';

function AppContent() {
  const { user } = useAuth();
  const path = usePathname();

  if (path === CATALOG_PATH) return <PublicCatalogPage />;

  if (!user) return <LoginForm />;

  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Tagger') return <TaggerDashboard />;
  if (user.role === 'Supervisor') return <SupervisorDashboard />;
  if (user.role === 'Consumer') return <ConsumerDashboard />;

  return <LoginForm />;
}

function MsalAppContent() {
  const { instance, accounts, inProgress } = useMsal();
  const { user, establishEntraSession, isLoading } = useAuth();
  const attemptedAccount = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = instance.getActiveAccount() ?? accounts[0];

  useEffect(() => {
    if (!account || user || inProgress !== InteractionStatus.None || attemptedAccount.current === account.homeAccountId) {
      return;
    }

    attemptedAccount.current = account.homeAccountId;
    instance.setActiveAccount(account);

    void instance.acquireTokenSilent({ ...loginRequest, account })
      .then((response) => establishEntraSession(response.accessToken))
      .catch((acquireError: unknown) => {
        setError(acquireError instanceof Error
          ? acquireError.message
          : 'Unable to establish an application session with Microsoft.');
      });
  }, [account, establishEntraSession, inProgress, instance, user]);

  if (!account) return <MsalLoginForm />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-primary-900 mb-4">Microsoft sign-in could not be completed</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
        <p className="text-white">Signing you in...</p>
      </div>
    );
  }

  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Tagger') return <TaggerDashboard />;
  if (user.role === 'Supervisor') return <SupervisorDashboard />;
  if (user.role === 'Consumer') return <ConsumerDashboard />;

  return <LoginForm />;
}

function MsalApplication() {
  const { instance } = useMsal();
  const path = usePathname();
  const completeCallback = useCallback(() => {
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);
  const logout = useCallback(() => {
    void instance.logoutRedirect().catch((error: unknown) => {
      console.error('MSAL logout redirect failed', error);
    });
  }, [instance]);

  return (
    <AuthProvider onLogout={logout} restoreStoredSession={false}>
      {path === '/callback' ? <MsalCallback onComplete={completeCallback} />
        : path === CATALOG_PATH ? <PublicCatalogPage />
        : <MsalAppContent />}
    </AuthProvider>
  );
}

function KeycloakAppContent() {
  const { user, establishEntraSession, setAccessToken, isLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initStarted = useRef(false);

  useEffect(() => {
    const keycloak = keycloakInstance;
    if (!keycloak || initStarted.current) return;
    initStarted.current = true;

    keycloak.init(keycloakInitOptions)
      .then(async (isAuthenticated) => {
        setAuthenticated(isAuthenticated);
        if (isAuthenticated && keycloak.token) {
          await establishEntraSession(keycloak.token);
        }
      })
      .catch((initError: unknown) => {
        setError(initError instanceof Error
          ? initError.message
          : 'Unable to establish an application session with Keycloak.');
      })
      .finally(() => setReady(true));
  }, [establishEntraSession]);

  // Keycloak access tokens are short-lived; refresh before expiry and hand the new one to the context.
  useEffect(() => {
    const keycloak = keycloakInstance;
    if (!user || !keycloak) return;

    const interval = window.setInterval(() => {
      keycloak.updateToken(60)
        .then((refreshed) => {
          if (refreshed && keycloak.token) setAccessToken(keycloak.token);
        })
        .catch(() => keycloak.login());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [user, setAccessToken]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
        <p className="text-white">Signing you in...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-primary-900 mb-4">Keycloak sign-in could not be completed</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return <KeycloakLoginForm />;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
        <p className="text-white">Signing you in...</p>
      </div>
    );
  }

  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Tagger') return <TaggerDashboard />;
  if (user.role === 'Supervisor') return <SupervisorDashboard />;
  if (user.role === 'Consumer') return <ConsumerDashboard />;

  return <KeycloakLoginForm />;
}

function KeycloakApplication() {
  const path = usePathname();
  const logout = useCallback(() => {
    void keycloakInstance?.logout({ redirectUri: window.location.origin }).catch((error: unknown) => {
      console.error('Keycloak logout failed', error);
    });
  }, []);

  return (
    <AuthProvider onLogout={logout} restoreStoredSession={false}>
      {path === CATALOG_PATH ? <PublicCatalogPage /> : <KeycloakAppContent />}
    </AuthProvider>
  );
}

function App() {
  if (KEYCLOAK_ENABLED) {
    return <KeycloakApplication />;
  }

  if (MSAL_ENABLED) {
    return <MsalApplication />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
