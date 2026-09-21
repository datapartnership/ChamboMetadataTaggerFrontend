import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';

interface MsalCallbackProps {
  onComplete: () => void;
}

export const MsalCallback = ({ onComplete }: MsalCallbackProps) => {
  const { inProgress } = useMsal();

  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      onComplete();
    }
  }, [inProgress, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
      <p className="text-white">Completing Microsoft sign-in...</p>
    </div>
  );
};
