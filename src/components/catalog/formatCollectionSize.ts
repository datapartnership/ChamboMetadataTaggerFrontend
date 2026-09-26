import { CollectionListItem } from '../../types/catalog';

/** e.g. "124 files · 38.5 hours" */
export const formatCollectionSize = ({ items, hours }: Pick<CollectionListItem, 'items' | 'hours'>): string => {
  const parts: string[] = [];
  if (items > 0) parts.push(`${items.toLocaleString()} file${items !== 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hours`);
  return parts.join(' · ');
};
