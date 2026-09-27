import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { catalogApi } from '../../services/catalogApi';
import {
  CatalogPagedResult,
  CollectionFacets,
  CollectionFilters,
  CollectionListItem,
  SeedCounts,
  SeedResult,
} from '../../types/catalog';
import { CollectionCard } from './CollectionCard';
import { CollectionFacetSidebar } from './CollectionFacetSidebar';
import { CollectionDetailView } from './CollectionDetailView';
import { CatalogPagination } from './CatalogPagination';

const PAGE_SIZE = 12;

const EMPTY_FILTERS: CollectionFilters = {
  q: '',
  mediaType: '',
  language: '',
  provider: '',
  theme: '',
  year: '',
};

const FILTER_LABELS: Record<keyof CollectionFilters, string> = {
  q: 'Search',
  mediaType: 'Media Type',
  language: 'Language',
  provider: 'Provider',
  theme: 'Theme',
  year: 'Year',
};

const describeCounts = (c: SeedCounts) =>
  `Collections: ${c.collectionsAdded} added, ${c.collectionsUpdated} updated, ${c.collectionsDeleted} deleted. ` +
  `Files: ${c.filesAdded} added, ${c.filesUpdated} updated, ${c.filesDeleted} deleted.`;

const SeedResultPanel = ({ result, onDismiss }: { result: SeedResult; onDismiss: () => void }) => {
  const hasWarnings = result.warnings.length > 0;
  return (
    <div className={`mb-4 rounded-lg p-3 text-sm border ${
      hasWarnings ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-700'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{describeCounts(result.totals)}</p>
        <button onClick={onDismiss} className="hover:text-red-500 transition-colors">✕</button>
      </div>
      <ul className="mt-1 text-xs space-y-0.5">
        {(Object.entries(result.byMediaType) as [string, SeedCounts][]).map(([mediaType, counts]) => (
          <li key={mediaType}><span className="font-medium">{mediaType}:</span> {describeCounts(counts)}</li>
        ))}
        <li>{result.taggerFilesMatched} file{result.taggerFilesMatched !== 1 ? 's' : ''} enriched with tagger metadata.</li>
        {result.taggedFilesNotCataloged > 0 && (
          <li>
            {result.taggedFilesNotCataloged} tagged file{result.taggedFilesNotCataloged !== 1 ? 's' : ''} not in the catalog.
          </li>
        )}
      </ul>
      {result.warnings.length > 0 && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer font-medium">
            {result.warnings.length} warning{result.warnings.length !== 1 ? 's' : ''}
          </summary>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
};

const FilterPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition-colors ml-0.5">✕</button>
  </span>
);

export const CatalogView = () => {
  const { user, token } = useAuth();
  const canSeed = user?.role === 'Admin';

  const [filters, setFilters] = useState<CollectionFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [facets, setFacets] = useState<CollectionFacets | null>(null);
  const [result, setResult] = useState<CatalogPagedResult<CollectionListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
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

  const handleSeed = async () => {
    if (!token) return;
    setSeeding(true);
    setSeedResult(null);
    setSeedError(null);
    try {
      setSeedResult(await catalogApi.seed(token));
      setReloadKey((k) => k + 1);
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Seed failed.');
    } finally {
      setSeeding(false);
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
          {canSeed && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-accent-teal-50 disabled:opacity-50 transition-colors"
              title="Rescan catalog storage and add, update, or remove collections to match it"
            >
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Seeding...' : 'Re-seed from storage'}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Text, audio, and video collections held by the Low Resource Language Library.
        </p>

        {seedResult && <SeedResultPanel result={seedResult} onDismiss={() => setSeedResult(null)} />}
        {seedError && (
          <div className="mb-4 rounded-lg p-3 text-sm border bg-red-50 border-red-200 text-red-700">
            {seedError}
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
