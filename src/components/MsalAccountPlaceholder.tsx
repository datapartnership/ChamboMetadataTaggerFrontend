import { LogOut, AlertCircle } from 'lucide-react';
import { useMsal } from '@azure/msal-react';

export const MsalAccountPlaceholder = () => {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const handleSignOut = () => {
    instance.logoutRedirect().catch((error) => {
      console.error('MSAL logout redirect failed', error);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6 mx-auto">
            <img
              src="/chambo_logo.png"
              alt="Chambo Logo"
              className="w-32 h-32 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-primary-900 mb-2">
            Signed in with Microsoft
          </h1>
          <p className="text-center text-slate-600 mb-6">
            {account?.name ?? account?.username ?? 'Unknown account'}
          </p>
          {account?.username && (
            <p className="text-center text-sm text-slate-400 mb-6">{account.username}</p>
          )}

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Backend integration for Microsoft sign-in is not wired up yet. Your Microsoft
              account has been verified, but no application session has been created.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
