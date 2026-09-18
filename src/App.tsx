import { useIsAuthenticated } from '@azure/msal-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { MsalLoginForm } from './components/MsalLoginForm';
import { MsalAccountPlaceholder } from './components/MsalAccountPlaceholder';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TaggerDashboard } from './components/tagger/TaggerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { MSAL_ENABLED } from './msalConfig';

function AppContent() {
  const { user } = useAuth();

  if (!user) return <LoginForm />;

  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Tagger') return <TaggerDashboard />;
  if (user.role === 'Supervisor') return <SupervisorDashboard />;

  return <LoginForm />;
}

// Rendered instead of AppContent when VITE_MSAL_ENABLED=true. Backend
// integration for MSAL is not wired up yet, so a signed-in Microsoft
// account only reaches a placeholder screen rather than the dashboards.
function MsalAppContent() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) return <MsalLoginForm />;

  return <MsalAccountPlaceholder />;
}

function App() {
  if (MSAL_ENABLED) {
    return <MsalAppContent />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
