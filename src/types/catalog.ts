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

export type MediaType = 'Text' | 'Audio' | 'Video';

export type FileKind = 'Text' | 'Audio' | 'Video' | 'Transcription';

export interface CollectionListItem {
  id: string;
  name: string;
  provider: string;
  mediaType: MediaType;
  language?: string;
  languageCode?: string;
  formats: string[];
  hours?: number;
  /** Number of primary (non-transcription) files. */
  items: number;
  startYear?: number;
  endYear?: number;
  themes: string[];
}

export interface CollectionDetail extends CollectionListItem {
  description?: string;
  keywords: string[];
  storagePath: string;
  temporalCoverage?: string;
  datePublished?: string;
  dateModified?: string;
  license?: string;
  creator?: string;
  publisher?: string;
  sourceOrganization?: string;
  version?: string;
  piiScreening: boolean;
  sensitiveContent: boolean;
  transcriptionCount: number;
  seededAtUtc: string;
}

export interface CollectionFileItem {
  id: string;
  name: string;
  kind: FileKind;
  encodingFormat: string;
  contentSize?: number;
  dateModified?: string;
  author?: string;
  datePublished?: string;
  wordCount?: number;
  numberOfPages?: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
  transcriptionFileId?: string;
  keywords: string[];
  themes: string[];
}

export interface CollectionFacets {
  totalCollections: number;
  mediaTypes: FacetItem[];
  languages: FacetItem[];
  providers: FacetItem[];
  themes: FacetItem[];
  years: FacetItem[];
}

export interface CollectionFilters {
  q: string;
  mediaType: string;
  language: string;
  provider: string;
  theme: string;
  year: string;
}

export interface CollectionFileFilters {
  q: string;
  kind: string;
}

export interface SeedCounts {
  collectionsAdded: number;
  collectionsUpdated: number;
  collectionsDeleted: number;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
}

export interface SeedResult {
  byMediaType: Record<MediaType, SeedCounts>;
  totals: SeedCounts;
  taggerFilesMatched: number;
  taggedFilesNotCataloged: number;
  taggedFilesNotCatalogedExamples: string[];
  warnings: string[];
  message: string;
}
