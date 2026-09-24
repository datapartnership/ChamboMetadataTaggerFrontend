export interface FacetItem {
  value: string;
  count: number;
}

export interface CatalogPagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  results: T[];
}

export interface CollectionListItem {
  id: number;
  name: string;
  provider?: string;
  language?: string;
  type?: string;
  format?: string;
  hours?: number;
  items?: number;
  startYear?: number;
  endYear?: number;
  themes: string[];
  collected?: string;
  processing?: string;
  availability?: string;
  taggedForText?: string;
  hasStoragePath: boolean;
  storagePathVerified?: boolean | null;
}

export interface CollectionDetail {
  id: number;
  name: string;
  provider?: string;
  language?: string;
  type?: string;
  format?: string;
  hours?: number;
  items?: number;
  description?: string;
  startYear?: number;
  endYear?: number;
  themes: string[];
  collected?: string;
  processing?: string;
  availability?: string;
  taggedForText?: string;
  storagePath?: string;
  storagePathVerified?: boolean | null;
  syncedAtUtc: string;
}

export interface CollectionFacets {
  totalCollections: number;
  types: FacetItem[];
  languages: FacetItem[];
  providers: FacetItem[];
  themes: FacetItem[];
  collected: FacetItem[];
  processing: FacetItem[];
  availability: FacetItem[];
}

export interface CollectionFilters {
  q: string;
  type: string;
  language: string;
  provider: string;
  theme: string;
  collected: string;
  processing: string;
  availability: string;
  year: string;
}

export interface CollectionSyncResult {
  success: boolean;
  rowsSynced: number;
  rowsSkipped: number;
  syncedAtUtc: string;
  sourceBlobPath: string;
  error?: string;
}
