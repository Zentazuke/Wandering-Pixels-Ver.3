/**
 * collections.ts — multi-entry memory collections.
 * "My Pet Through the Years", "My 2026", "Summer With Friends" — a curated
 * set of entries that can become timeline/scrapbook boards.
 * Stored in IDB under 'collection-' keys.
 */
export type CollectionType = 'pet_timeline' | 'year_review' | 'travel_story' | 'custom';

export interface MemoryCollection {
  id:                  string;   // 'collection-<ts>'
  title:               string;
  type:                CollectionType;
  entryIds:            string[];
  companionIds:        string[];
  coverPhotoAssetKey?: string;
  /** Boards generated from this collection (snapshot keys). */
  linkedBoardIds:      string[];
  createdAt:           number;
  updatedAt:           number;
}

/** Upgrade any stored record to the full shape. */
export function normalizeCollection(raw: Partial<MemoryCollection> & { id: string }): MemoryCollection {
  return {
    title: '',
    type: 'custom',
    createdAt: 0,
    updatedAt: 0,
    ...raw,
    entryIds:       Array.isArray(raw.entryIds)       ? raw.entryIds       : [],
    companionIds:   Array.isArray(raw.companionIds)   ? raw.companionIds   : [],
    linkedBoardIds: Array.isArray(raw.linkedBoardIds) ? raw.linkedBoardIds : [],
  };
}
