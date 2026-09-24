import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CollectionFacets, CollectionFilters, FacetItem } from '../../types/catalog';

type FacetFilters = Omit<CollectionFilters, 'q'>;

interface CollectionFacetSidebarProps {
  facets: CollectionFacets;
  filters: CollectionFilters;
  onChange: (updates: Partial<FacetFilters>) => void;
}

const FacetGroup = ({
  title,
  items,
  selected,
  onSelect,
  maxVisible = 8,
}: {
  title: string;
  items: FacetItem[];
  selected: string;
  onSelect: (value: string) => void;
  maxVisible?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const visible = expanded ? items : items.slice(0, maxVisible);

  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{title}</h3>
      <ul className="space-y-1">
        {visible.map((item) => (
          <li key={item.value}>
            <button
              onClick={() => onSelect(item.value === selected ? '' : item.value)}
              className={`w-full text-left text-sm px-2 py-1 rounded flex items-center justify-between transition-colors ${
                item.value === selected
                  ? 'bg-primary-800 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="truncate">{item.value}</span>
              <span className={`text-xs ml-2 shrink-0 ${item.value === selected ? 'text-primary-200' : 'text-slate-400'}`}>
                {item.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {items.length > maxVisible && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs text-primary-700 hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <><ChevronUp size={12} />Show less</>
          ) : (
            <><ChevronDown size={12} />Show {items.length - maxVisible} more</>
          )}
        </button>
      )}
    </div>
  );
};

export const CollectionFacetSidebar = ({ facets, filters, onChange }: CollectionFacetSidebarProps) => {
  const anySelected = !!(filters.type || filters.language || filters.provider || filters.theme ||
    filters.collected || filters.processing || filters.availability || filters.year);

  return (
    <aside className="w-full">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="font-semibold text-slate-900 mb-4 text-sm">Filter by</h2>

        <FacetGroup title="Type" items={facets.types} selected={filters.type} onSelect={(v) => onChange({ type: v })} />
        <FacetGroup title="Collected" items={facets.collected} selected={filters.collected} onSelect={(v) => onChange({ collected: v })} />
        <FacetGroup title="Processing" items={facets.processing} selected={filters.processing} onSelect={(v) => onChange({ processing: v })} />
        <FacetGroup title="Availability" items={facets.availability} selected={filters.availability} onSelect={(v) => onChange({ availability: v })} />
        <FacetGroup title="Language" items={facets.languages} selected={filters.language} onSelect={(v) => onChange({ language: v })} />
        <FacetGroup title="Provider" items={facets.providers} selected={filters.provider} onSelect={(v) => onChange({ provider: v })} maxVisible={6} />
        <FacetGroup title="Theme" items={facets.themes} selected={filters.theme} onSelect={(v) => onChange({ theme: v })} />

        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Year</h3>
          <input
            type="number"
            value={filters.year}
            onChange={(e) => onChange({ year: e.target.value })}
            placeholder="e.g. 2024"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {anySelected && (
          <button
            onClick={() => onChange({
              type: '', language: '', provider: '', theme: '',
              collected: '', processing: '', availability: '', year: '',
            })}
            className="mt-2 text-xs text-red-500 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
};
