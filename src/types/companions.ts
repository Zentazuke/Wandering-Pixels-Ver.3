/**
 * companions.ts — the people, pets, and others a memory is shared with.
 * Stored in IDB under 'companion-' keys; entries reference them by id via
 * DiaryEntry.companionIds, so renaming a companion never touches entries.
 */
export type CompanionType = 'pet' | 'person' | 'other';

export interface Companion {
  id:                  string;   // 'companion-<ts>'
  type:                CompanionType;
  name:                string;
  /** pets only, optional — 'cat', 'border collie', 'axolotl'… */
  species?:            string;
  birthday?:           string;   // ISO date
  adoptionDate?:       string;   // ISO date (pets)
  /** IDB asset key of a cover photo (same asset system as voice notes). */
  coverPhotoAssetKey?: string;
  notes?:              string;
  createdAt:           number;
  updatedAt:           number;
}

/** Upgrade any stored record to the full shape. */
export function normalizeCompanion(raw: Partial<Companion> & { id: string }): Companion {
  return {
    type: 'person',
    name: '',
    createdAt: 0,
    updatedAt: 0,
    ...raw,
  };
}
