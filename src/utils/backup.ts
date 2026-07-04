/**
 * backup.ts — full local backup and restore of the diary.
 *
 * The phone is the ONLY place this data lives (by design — nothing leaves the
 * device unless the person shares). That makes a user-initiated backup file
 * the insurance policy against a lost or broken device: one JSON file holding
 * every IDB key (diary entries, board snapshots, board state, drafts), photos
 * included as data URLs. Where the file goes is the user's own choice.
 */
import { dbGetAll, dbSave } from '../db/boardDB.js';

const BACKUP_APP     = 'wandering-pixels';
const BACKUP_VERSION = 1;

interface BackupPayload {
  app:        string;
  version:    number;
  exportedAt: string;
  data:       Record<string, unknown>;
}

/** Serialize the whole store and hand it to the user as a download. */
export async function downloadBackup(): Promise<void> {
  const { keys, vals } = await dbGetAll();
  const data: Record<string, unknown> = {};
  keys.forEach((k, i) => { data[k] = vals[i]; });

  const payload: BackupPayload = {
    app: BACKUP_APP, version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `wandering-pixels-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/**
 * Restore a backup file. Merge semantics: every key in the file is written;
 * existing records with the same key are overwritten, records not in the
 * file are left alone. Returns how many records were restored.
 */
export async function restoreBackup(file: File): Promise<number> {
  const payload = JSON.parse(await file.text()) as Partial<BackupPayload>;
  if (payload?.app !== BACKUP_APP || typeof payload.data !== 'object' || payload.data === null) {
    throw new Error('Not a Wandering Pixels backup file');
  }
  const records = Object.entries(payload.data);
  for (const [key, value] of records) {
    await dbSave(key, value);
  }
  return records.length;
}
