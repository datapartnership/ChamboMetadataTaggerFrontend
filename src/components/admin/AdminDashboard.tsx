import { useState } from 'react';
import { LogOut, FileText, Users, BarChart3, FolderOpen, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FilesView } from './FilesView';
import { UsersView } from './UsersView';
import { ProgressView } from './ProgressView';
import { SupervisorsView } from './SupervisorsView';

type View = 'files' | 'users' | 'supervisors' | 'progress';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('files');

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
                <h1 className="text-xl font-bold text-slate-900">Chambo Metadata Tagger</h1>
                <p className="text-sm text-slate-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.username}</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveView('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'files'
                ? 'bg-primary-800 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-accent-teal-50'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Files
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'users'
                ? 'bg-primary-800 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-accent-teal-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveView('supervisors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'supervisors'
                ? 'bg-primary-800 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-accent-teal-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Supervisors
          </button>
          <button
            onClick={() => setActiveView('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'progress'
                ? 'bg-primary-800 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-accent-teal-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Progress
          </button>
        </div>

        {activeView === 'files' && <FilesView />}
        {activeView === 'users' && <UsersView />}
        {activeView === 'supervisors' && <SupervisorsView />}
        {activeView === 'progress' && <ProgressView />}
      </div>
    </div>
  );
};
