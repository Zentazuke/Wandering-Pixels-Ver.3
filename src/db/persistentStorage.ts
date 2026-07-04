/**
 * Ask the browser to protect this origin's storage (IndexedDB) from
 * storage-pressure eviction. Without this, a diary kept only on-device can be
 * silently wiped by the browser (Safari evicts after ~7 days of no use).
 *
 * Called after a successful save so it always runs inside a user-gesture
 * chain, which is when browsers are most willing to grant it.
 */
let requested = false;

export async function ensurePersistentStorage(): Promise<void> {
  if (requested) return;
  requested = true;
  try {
    if (!navigator.storage?.persist) return;
    if (await navigator.storage.persisted()) return;
    await navigator.storage.persist();
  } catch {
    // Denied or unsupported — nothing actionable; the backup feature is the fallback.
  }
}
