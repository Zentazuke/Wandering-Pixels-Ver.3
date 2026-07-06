/** companionStore.ts — CRUD for the people/pets a memory is shared with. */
import { dbGetByPrefix, dbSave } from './boardDB.js';
import { normalizeCompanion, type Companion, type CompanionType } from '../types/companions.js';

export async function loadCompanions(): Promise<Companion[]> {
  const { vals } = await dbGetByPrefix('companion-');
  return (vals as Companion[])
    .filter((c) => c && c.id)
    .map(normalizeCompanion)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCompanion(name: string, type: CompanionType): Promise<Companion> {
  const now = Date.now();
  const c: Companion = { id: `companion-${now}`, type, name: name.trim(), createdAt: now, updatedAt: now };
  await dbSave(c.id, c);
  return c;
}
