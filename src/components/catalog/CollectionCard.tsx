import { Building2, Globe, Calendar, Tag } from 'lucide-react';
import { CollectionListItem } from '../../types/catalog';
import { StatusBadge, StoragePathIndicator } from './StatusBadge';
import { formatYearRange } from './formatYearRange';

interface CollectionCardProps {
  collection: CollectionListItem;
  onSelect: (id: number) => void;
}

export const CollectionCard = ({ collection, onSelect }: CollectionCardProps) => {
  const yearRange = formatYearRange(collection.startYear, collection.endYear);

  return (
    <button
      onClick={() => onSelect(collection.id)}
      className="block w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-primary-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-primary-900 group-hover:text-primary-700 text-sm leading-snug line-clamp-2">
          {collection.name}
        </h3>
        {collection.type && (
          <span className="shrink-0 bg-primary-50 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full border border-primary-200">
            {collection.type}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
        {collection.provider && (
          <span className="flex items-center gap-1">
            <Building2 size={11} />
            {collection.provider}
          </span>
        )}
        {collection.language && (
          <span className="flex items-center gap-1">
            <Globe size={11} />
            {collection.language}
          </span>
        )}
        {yearRange && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {yearRange}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <StatusBadge label="Collected" value={collection.collected} />
        <StatusBadge label="Processing" value={collection.processing} />
        <StatusBadge label="Available" value={collection.availability} />
      </div>

      <StoragePathIndicator
        hasStoragePath={collection.hasStoragePath}
        verified={collection.storagePathVerified}
      />

      {collection.themes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <Tag size={11} className="text-slate-400 mt-0.5 shrink-0" />
          {collection.themes.slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-accent-teal-50 text-accent-teal-700 px-2 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};
