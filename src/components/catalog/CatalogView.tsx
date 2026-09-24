import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { catalogApi } from '../../services/catalogApi';
import {
  CatalogPagedResult,
  CollectionFacets,
  CollectionFilters,
  CollectionListItem,
} from '../../types/catalog';
import { CollectionCard } from './CollectionCard';
import { CollectionFacetSidebar } from './CollectionFacetSidebar';
import { CollectionDetailView } from './CollectionDetailView';
import { CatalogPagination } from './CatalogPagination';

const PAGE_SIZE = 12;

const EMPTY_FILTERS: CollectionFilters = {
  q: '',
  type: '',
  language: '',
  provider: '',
  theme: '',
  collected: '',
  processing: '',
  availability: '',
  year: '',
};

const FILTER_LABELS: Record<keyof CollectionFilters, string> = {
  q: 'Search',
  type: 'Type',
  language: 'Language',
  provider: 'Provider',
  theme: 'Theme',
  collected: 'Collected',
  processing: 'Processing',
  availability: 'Available',
  year: 'Year',
};

const FilterPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition-colors ml-0.5">✕</button>
  </span>
);

export const CatalogView = () => {
  const { user, token } = useAuth();
  const canSync = user?.role === 'Admin';

  const [filters, setFilters] = useState<CollectionFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [facets, setFacets] = useState<CollectionFacets | null>(null);
  const [result, setResult] = useState<CatalogPagedResult<CollectionListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    catalogApi.getFacets()
      .then(setFacets)
      .catch((err) => console.error('Error loading collection facets:', err));
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    catalogApi.getCollections(filters, page, PAGE_SIZE)
      .then((data) => { if (!cancelled) setResult(data); })
      .catch((err) => {
        console.error('Error loading collections:', err);
        if (!cancelled) setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, page, reloadKey]);

  const updateFilters = useCallback((updates: Partial<CollectionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search.trim() });
  };

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await catalogApi.sync(token);
      setSyncMessage(res.success
        ? { ok: true, text: `Synced ${res.rowsSynced} collections (${res.rowsSkipped} skipped).` }
        : { ok: false, text: res.error ?? 'Sync failed.' });
      if (res.success) setReloadKey((k) => k + 1);
    } catch (err) {
      setSyncMessage({ ok: false, text: err instanceof Error ? err.message : 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  if (selectedId !== null) {
    return (
      <CollectionDetailView
        collectionId={selectedId}
        onBack={() => setSelectedId(null)}
        onThemeSelect={(theme) => {
          setSelectedId(null);
          updateFilters({ theme });
        }}
      />
    );
  }

  const activeFilters = (Object.keys(filters) as (keyof CollectionFilters)[]).filter((k) => filters[k]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="text-2xl font-bold text-slate-900">Collections</h2>
          {canSync && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-accent-teal-50 disabled:opacity-50 transition-colors"
              title="Re-sync the catalog from the source workbook"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync from workbook'}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Data collection efforts tracked by the Low Resource Language Library, including their
          collection, processing, and availability status.
        </p>

        {syncMessage && (
          <div className={`mb-4 rounded-lg p-3 text-sm border ${
            syncMessage.ok
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {syncMessage.text}
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections…"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-800 text-white text-sm rounded-lg hover:bg-primary-900 transition-colors flex items-center gap-1"
          >
            <Search size={15} /> Search
          </button>
        </form>
      </div>

      <div className="flex gap-6">
        {facets && (
          <div className="w-56 shrink-0 hidden md:block">
            <CollectionFacetSidebar facets={facets} filters={filters} onChange={updateFilters} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              {activeFilters.map((key) => (
                <FilterPill
                  key={key}
                  label={key === 'q' ? `Search: "${filters.q}"` : `${FILTER_LABELS[key]}: ${filters[key]}`}
                  onRemove={() => {
                    if (key === 'q') setSearch('');
                    updateFilters({ [key]: '' });
                  }}
                />
              ))}
            </div>
          )}

          {result && !loading && (
            <p className="text-sm text-slate-500 mb-3">
              {result.totalCount.toLocaleString()} collection{result.totalCount !== 1 ? 's' : ''} found
              {result.totalPages > 1 && ` — page ${result.page} of ${result.totalPages}`}
            </p>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading collections...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
              Failed to load collections.
            </div>
          ) : result && (
            <>
              {result.results.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-lg">No collections matched your filters.</p>
                  <p className="text-sm mt-1">Try adjusting or clearing the filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.results.map((c) => (
                    <CollectionCard key={c.id} collection={c} onSelect={setSelectedId} />
                  ))}
                </div>
              )}

              <CatalogPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
