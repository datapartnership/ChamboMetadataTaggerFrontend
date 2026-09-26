import {
  CatalogPagedResult,
  CollectionDetail,
  CollectionFacets,
  CollectionFileFilters,
  CollectionFileItem,
  CollectionFilters,
  CollectionListItem,
  SeedResult,
} from '../types/catalog';
import { API_URL } from '../config';

const ensureOk = async (response: Response) => {
  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:logout'));
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }
};

const toQuery = (filters: object, page: number, pageSize: number) => {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) p.append(key, String(value));
  }
  p.append('page', String(page));
  p.append('pageSize', String(pageSize));
  return p.toString();
};

export const catalogApi = {
  async getCollections(
    filters: CollectionFilters,
    page: number,
    pageSize: number,
  ): Promise<CatalogPagedResult<CollectionListItem>> {
    const response = await fetch(`${API_URL}/api/catalog/collections?${toQuery(filters, page, pageSize)}`);
    await ensureOk(response);
    return response.json();
  },

  async getCollection(id: string): Promise<CollectionDetail> {
    const response = await fetch(`${API_URL}/api/catalog/collections/${encodeURIComponent(id)}`);
    await ensureOk(response);
    return response.json();
  },

  async getCollectionFiles(
    id: string,
    filters: CollectionFileFilters,
    page: number,
    pageSize: number,
  ): Promise<CatalogPagedResult<CollectionFileItem>> {
    const response = await fetch(
      `${API_URL}/api/catalog/collections/${encodeURIComponent(id)}/files?${toQuery(filters, page, pageSize)}`,
    );
    await ensureOk(response);
    return response.json();
  },

  async getFacets(): Promise<CollectionFacets> {
    const response = await fetch(`${API_URL}/api/catalog/collections/facets`);
    await ensureOk(response);
    return response.json();
  },

  /** Rescans catalog storage and syncs the catalog (Admin only). */
  async seed(token: string): Promise<SeedResult> {
    const response = await fetch(`${API_URL}/api/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    await ensureOk(response);
    return response.json();
  },
};
