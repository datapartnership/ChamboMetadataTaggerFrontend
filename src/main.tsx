import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import App from './App.tsx';
import { MSAL_ENABLED, msalInstance } from './msalConfig';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    {MSAL_ENABLED && msalInstance ? (
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
