import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Globe, Calendar, Tag, ShieldAlert } from 'lucide-react';
import { catalogApi } from '../../services/catalogApi';
import { CollectionDetail } from '../../types/catalog';
import { formatYearRange } from './formatYearRange';
import { formatCollectionSize } from './formatCollectionSize';
import { CollectionFileList } from './CollectionFileList';

interface CollectionDetailViewProps {
  collectionId: string;
  onBack: () => void;
  onThemeSelect: (theme: string) => void;
}

const MetaRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <tr>
      <td className="py-2 pr-4 text-sm font-medium text-slate-500 whitespace-nowrap align-top w-36">{label}</td>
      <td className="py-2 text-sm text-slate-800 break-words">{value}</td>
    </tr>
  );
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export const CollectionDetailView = ({ collectionId, onBack, onThemeSelect }: CollectionDetailViewProps) => {
  const [data, setData] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    catalogApi.getCollection(collectionId)
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => {
        console.error('Error loading collection:', err);
        if (!cancelled) setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [collectionId]);

  const breadcrumb = (
    <nav className="mb-4 text-sm text-slate-500 flex items-center gap-1.5">
      <button onClick={onBack} className="hover:text-primary-700 flex items-center gap-1 transition-colors">
        <ArrowLeft size={14} /> Catalog
      </button>
      {data && (
        <>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate">{data.name}</span>
        </>
      )}
    </nav>
  );

  if (loading) {
    return <>{breadcrumb}<div className="text-center py-12 text-slate-600">Loading...</div></>;
  }

  if (error || !data) {
    return (
      <>
        {breadcrumb}
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          Collection "{collectionId}" not found.
        </div>
      </>
    );
  }

  const yearRange = formatYearRange(data.startYear, data.endYear);
  const size = formatCollectionSize(data);
  const language = data.language && data.languageCode ? `${data.language} (${data.languageCode})` : data.language ?? data.languageCode;

  return (
    <>
      {breadcrumb}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{data.name}</h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
            {data.provider && (
              <span className="flex items-center gap-1"><Building2 size={12} />{data.provider}</span>
            )}
            {language && (
              <span className="flex items-center gap-1"><Globe size={12} />{language}</span>
            )}
            {yearRange && (
              <span className="flex items-center gap-1"><Calendar size={12} />{yearRange}</span>
            )}
            <span className="bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200 font-medium">
              {data.mediaType}
            </span>
            {size && <span>{size}</span>}
          </div>

          {(data.piiScreening || data.sensitiveContent) && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {data.piiScreening && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                  PII screened
                </span>
              )}
              {data.sensitiveContent && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                  <ShieldAlert size={12} /> Contains sensitive content
                </span>
              )}
            </div>
          )}

          {data.description && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm mb-2">Description</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.description}</p>
            </div>
          )}

          <CollectionFileList collectionId={data.id} mediaType={data.mediaType} />
        </div>

        <aside className="lg:w-72 shrink-0 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Collection Information</h3>
            <table className="w-full">
              <tbody>
                <MetaRow label="ID" value={data.id} />
                <MetaRow label="Provider" value={data.provider} />
                <MetaRow label="Media Type" value={data.mediaType} />
                <MetaRow label="Language" value={language} />
                <MetaRow label="Formats" value={data.formats.join(', ')} />
                <MetaRow label="Files" value={data.items} />
                <MetaRow label="Transcriptions" value={data.transcriptionCount || null} />
                <MetaRow label="Hours" value={data.hours} />
                <MetaRow label="Coverage" value={data.temporalCoverage} />
                <MetaRow label="Start Year" value={data.startYear} />
                <MetaRow label="End Year" value={data.endYear} />
                <MetaRow label="Published" value={formatDate(data.datePublished)} />
                <MetaRow label="Modified" value={formatDate(data.dateModified)} />
                <MetaRow label="Creator" value={data.creator} />
                <MetaRow label="Publisher" value={data.publisher} />
                <MetaRow label="Source" value={data.sourceOrganization} />
                <MetaRow label="License" value={data.license} />
                <MetaRow label="Version" value={data.version} />
                <MetaRow label="Storage Path" value={data.storagePath} />
                <MetaRow label="Last Seeded" value={new Date(data.seededAtUtc).toLocaleString()} />
              </tbody>
            </table>
          </div>

          {data.themes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm flex items-center gap-1">
                <Tag size={14} /> Themes ({data.themes.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.themes.map((t) => (
                  <button
                    key={t}
                    onClick={() => onThemeSelect(t)}
                    className="text-xs bg-accent-teal-50 text-accent-teal-700 hover:bg-accent-teal-100 px-2 py-0.5 rounded transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {data.keywords.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Keywords ({data.keywords.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.map((k) => (
                  <span key={k} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{k}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};
