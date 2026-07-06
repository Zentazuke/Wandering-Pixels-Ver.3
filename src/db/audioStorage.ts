/**
 * audioStorage.ts — voice-note blobs as IDB assets.
 * Entries stay small JSON; the audio itself lives under an 'audio-' key and
 * entries reference it by assetKey. IndexedDB stores Blobs natively — never
 * base64 them into the entry (that's only for the backup file).
 */
import { dbSave, dbLoad, dbDelete } from './boardDB.js';

export const AUDIO_PREFIX = 'audio-';

export async function saveAudioBlob(blob: Blob): Promise<string> {
  const assetKey = `${AUDIO_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await dbSave(assetKey, blob);
  return assetKey;
}

export function loadAudioBlob(assetKey: string): Promise<Blob | undefined> {
  return dbLoad<Blob>(assetKey);
}

export function deleteAudioBlob(assetKey: string): Promise<void> {
  return dbDelete(assetKey);
}
