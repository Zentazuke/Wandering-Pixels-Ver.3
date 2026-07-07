/** collectionStore.ts — multi-entry memory collections ('collection-' keys). */
import { dbGetByPrefix } from './boardDB.js';
import { normalizeCollection, type MemoryCollection } from '../types/collections.js';

export async function loadCollections(): Promise<MemoryCollection[]> {
  const { vals } = await dbGetByPrefix('collection-');
  return (vals as MemoryCollection[])
    .filter((c) => c && c.id)
    .map(normalizeCollection)
    .sort((a, b) => b.createdAt - a.createdAt);
}
