import {
  CatalogPagedResult,
  CollectionDetail,
  CollectionFacets,
  CollectionFilters,
  CollectionListItem,
  CollectionSyncResult,
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

export const catalogApi = {
  async getCollections(
    filters: CollectionFilters,
    page: number,
    pageSize: number,
  ): Promise<CatalogPagedResult<CollectionListItem>> {
    const p = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) p.append(key, value);
    }
    p.append('page', String(page));
    p.append('pageSize', String(pageSize));
    const response = await fetch(`${API_URL}/api/catalog/collections?${p.toString()}`);
    await ensureOk(response);
    return response.json();
  },

  async getCollection(id: number): Promise<CollectionDetail> {
    const response = await fetch(`${API_URL}/api/catalog/collections/${id}`);
    await ensureOk(response);
    return response.json();
  },

  async getFacets(): Promise<CollectionFacets> {
    const response = await fetch(`${API_URL}/api/catalog/collections/facets`);
    await ensureOk(response);
    return response.json();
  },

  // A failed sync returns 502 with a CollectionSyncResult body describing the error.
  async sync(token: string): Promise<CollectionSyncResult> {
    const response = await fetch(`${API_URL}/api/catalog/collections/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (response.status === 502) return response.json();
    await ensureOk(response);
    return response.json();
  },
};
