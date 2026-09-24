import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const CopyTokenButton = () => {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-[10px] leading-none px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      title="Copy access token"
    >
      {copied ? 'copied' : 'token'}
    </button>
  );
};
