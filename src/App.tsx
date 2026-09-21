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
import { loginRequest, MSAL_ENABLED } from './msalConfig';

function AppContent() {
  const { user } = useAuth();

  if (!user) return <LoginForm />;

  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Tagger') return <TaggerDashboard />;
  if (user.role === 'Supervisor') return <SupervisorDashboard />;

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

  return <LoginForm />;
}

function MsalApplication() {
  const { instance } = useMsal();
  const [path, setPath] = useState(window.location.pathname);
  const completeCallback = useCallback(() => {
    window.history.replaceState(null, '', '/');
    setPath('/');
  }, []);
  const logout = useCallback(() => {
    void instance.logoutRedirect().catch((error: unknown) => {
      console.error('MSAL logout redirect failed', error);
    });
  }, [instance]);

  return (
    <AuthProvider onLogout={logout} restoreStoredSession={false}>
      {path === '/callback' ? <MsalCallback onComplete={completeCallback} /> : <MsalAppContent />}
    </AuthProvider>
  );
}

function App() {
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
