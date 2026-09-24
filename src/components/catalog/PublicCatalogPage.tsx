import { LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from '../NavLink';
import { CatalogView } from './CatalogView';

export const PublicCatalogPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/chambo_logo.png"
                alt="Chambo Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-bold text-slate-900">Chambo Metadata Tagger</h1>
                  <span className="text-xs font-medium text-slate-400">v{__APP_VERSION__}</span>
                </div>
                <p className="text-sm text-slate-600">Collections Catalog</p>
              </div>
            </div>
            <NavLink
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary-800 text-white hover:bg-primary-900 transition-colors"
            >
              {user ? <LayoutDashboard className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {user ? 'Dashboard' : 'Sign in'}
            </NavLink>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <CatalogView />
      </main>
    </div>
  );
};
