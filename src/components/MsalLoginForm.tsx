import { LogIn } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../msalConfig';

export const MsalLoginForm = () => {
  const { instance } = useMsal();

  const handleSignIn = () => {
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error('MSAL login redirect failed', error);
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
            Chambo Metadata Tagger
            <span className="ml-2 text-xs font-normal text-slate-400">v{__APP_VERSION__}</span>
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Sign in with your Microsoft account
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            className="w-full bg-accent-orange-500 text-white py-3 rounded-lg font-medium hover:bg-accent-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};
