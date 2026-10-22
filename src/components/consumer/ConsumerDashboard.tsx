import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { CatalogHeaderLink } from '../catalog/CatalogHeaderLink';
import { CopyTokenButton } from '../CopyTokenButton';

const ENDPOINTS = [
  { path: '/api/collections/query', description: 'Query collections (Croissant JSON-LD)' },
  { path: '/api/collections/{id}/bundle', description: 'Download a whole audio/video collection' },
  { path: '/api/files/{id}', description: 'Download a single file' },
  { path: '/api/files/{id}/bundle', description: 'Download a media file with its transcription' },
];

// Consumers only use the API to query and download content; there is no tagging UI for them.
export const ConsumerDashboard = () => {
  const { user, logout } = useAuth();

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
                <p className="text-sm text-slate-600">API Access</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CatalogHeaderLink />
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                  <CopyTokenButton />
                </div>
                <p className="text-xs text-slate-600">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">API-only account</h2>
          <p className="text-sm text-slate-600 mb-4">
            Your account can query and download content through the API. Copy your access token with
            the <span className="font-medium">token</span> button above and send it as
            <code className="mx-1 px-1 py-0.5 bg-slate-100 rounded text-xs">Authorization: Bearer &lt;token&gt;</code>
            to <code className="px-1 py-0.5 bg-slate-100 rounded text-xs">{API_URL}</code>.
          </p>
          <ul className="divide-y divide-slate-100">
            {ENDPOINTS.map((endpoint) => (
              <li key={endpoint.path} className="py-2">
                <code className="text-sm text-slate-900">GET {endpoint.path}</code>
                <p className="text-xs text-slate-600">{endpoint.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};
