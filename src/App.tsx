import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TaggerDashboard } from './components/tagger/TaggerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';

function AppContent() {
  const { user } = useAuth();

  if (!user) return <LoginForm />;

  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Tagger') return <TaggerDashboard />;
  if (user.role === 'Supervisor') return <SupervisorDashboard />;

  return <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
