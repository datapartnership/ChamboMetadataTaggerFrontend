import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

type Tone = 'green' | 'amber' | 'gray';

const toneClasses: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
};

const toneFor = (value?: string): Tone => {
  if (!value) return 'gray';
  const v = value.toLowerCase();
  if (v === 'yes' || v === 'completed') return 'green';
  if (v === 'partly' || v === 'in progress') return 'amber';
  return 'gray';
};

export const StatusBadge = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${toneClasses[toneFor(value)]}`}
    >
      <span className="text-[10px] uppercase tracking-wide opacity-70">{label}</span>
      {value}
    </span>
  );
};

/** Whether the collection's blob storage path was confirmed during the last catalog sync. */
export const StoragePathIndicator = ({
  hasStoragePath,
  verified,
}: {
  hasStoragePath: boolean;
  verified?: boolean | null;
}) => {
  if (!hasStoragePath) return null;

  if (verified === true)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 size={12} /> Data path verified
      </span>
    );

  if (verified === false)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
        <AlertTriangle size={12} /> Data path not found
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
      <HelpCircle size={12} /> Data path not yet verified
    </span>
  );
};
