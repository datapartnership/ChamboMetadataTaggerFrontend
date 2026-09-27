import { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { catalogApi } from '../../services/catalogApi';
import { CatalogPagedResult, CollectionFileFilters, CollectionFileItem, MediaType } from '../../types/catalog';
import { CatalogPagination } from './CatalogPagination';

const PAGE_SIZE = 25;

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
};

interface CollectionFileListProps {
  collectionId: string;
  mediaType: MediaType;
}

export const CollectionFileList = ({ collectionId, mediaType }: CollectionFileListProps) => {
  const isText = mediaType === 'Text';
  const [filters, setFilters] = useState<CollectionFileFilters>({ q: '', kind: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CatalogPagedResult<CollectionFileItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    catalogApi.getCollectionFiles(collectionId, filters, page, PAGE_SIZE)
      .then((data) => { if (!cancelled) setResult(data); })
      .catch((err) => {
        console.error('Error loading collection files:', err);
        if (!cancelled) setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [collectionId, filters, page]);

  const updateFilters = (updates: Partial<CollectionFileFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-700 text-sm">
          Files{result ? ` (${result.totalCount.toLocaleString()})` : ''}
        </h3>
        <div className="flex gap-2">
          {!isText && (
            <select
              value={filters.kind}
              onChange={(e) => updateFilters({ kind: e.target.value })}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All files</option>
              <option value={mediaType}>{mediaType} only</option>
              <option value="Transcription">Transcriptions only</option>
            </select>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); updateFilters({ q: search.trim() }); }}
            className="flex gap-1"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isText ? 'Search name or author…' : 'Search file name…'}
              className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button type="submit" className="px-2 py-1 bg-primary-800 text-white rounded hover:bg-primary-900 transition-colors">
              <Search size={12} />
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-sm text-slate-600">Loading files...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">Failed to load files.</div>
      ) : result && result.results.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-400">No files matched.</div>
      ) : result && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">Format</th>
                  <th className="py-2 pr-3 font-semibold">Size</th>
                  {isText ? (
                    <>
                      <th className="py-2 pr-3 font-semibold">Author</th>
                      <th className="py-2 pr-3 font-semibold">Words</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2 pr-3 font-semibold">Duration</th>
                      <th className="py-2 font-semibold">Transcription</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {result.results.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-800 break-all">
                      {f.name}
                      {f.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {f.themes.map((t) => (
                            <span key={t} className="text-[11px] bg-accent-teal-50 text-accent-teal-700 px-1.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{f.encodingFormat}</td>
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{formatBytes(f.contentSize)}</td>
                    {isText ? (
                      <>
                        <td className="py-2 pr-3 text-slate-600">{f.author}</td>
                        <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{f.wordCount?.toLocaleString()}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{formatDuration(f.duration)}</td>
                        <td className="py-2 text-slate-600 whitespace-nowrap">
                          {f.kind === 'Transcription' ? (
                            <span className="text-xs text-slate-400">is a transcription</span>
                          ) : f.transcriptionFileId ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <FileText size={12} /> Available
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CatalogPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
