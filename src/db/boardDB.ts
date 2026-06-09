/**
 * boardDB.ts — thin IndexedDB wrapper for Wandering Pixels.
 * DB: 'WanderingPixels'  store: 'data'
 *
 * All operations return Promises. Errors are not swallowed here — callers
 * decide how to handle them (show a toast, fall back to defaults, etc.).
 */

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('WanderingPixels', 1);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore('data');
    };
    req.onerror   = () => reject(req.error);
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };
  });
}

export function dbSave(key: string, value: unknown): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction('data', 'readwrite');
        tx.objectStore('data').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
      })
  );
}

export function dbLoad<T = unknown>(key: string): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx  = db.transaction('data', 'readonly');
        const req = tx.objectStore('data').get(key);
        req.onsuccess = () => resolve(req.result as T | undefined);
        req.onerror   = () => reject(req.error);
      })
  );
}

export function dbDelete(key: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction('data', 'readwrite');
        tx.objectStore('data').delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
      })
  );
}

/** Walk the full store (use dbGetByPrefix when possible) */
export function dbGetAll(): Promise<{ keys: string[]; vals: unknown[] }> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx   = db.transaction('data', 'readonly');
        const keys: string[] = [];
        const vals: unknown[] = [];
        tx.objectStore('data').openCursor().onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            keys.push(cursor.key as string);
            vals.push(cursor.value);
            cursor.continue();
          } else {
            resolve({ keys, vals });
          }
        };
        tx.onerror = () => reject(tx.error);
      })
  );
}

/**
 * Walk only keys that start with a given prefix.
 * More efficient than dbGetAll when the store holds mixed data.
 * e.g. dbGetByPrefix('snap-') reads only board snapshots.
 */
export function dbGetByPrefix(prefix: string): Promise<{ keys: string[]; vals: unknown[] }> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx    = db.transaction('data', 'readonly');
        const range = IDBKeyRange.bound(prefix, prefix + '￿');
        const keys: string[] = [];
        const vals: unknown[] = [];
        tx.objectStore('data').openCursor(range).onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            keys.push(cursor.key as string);
            vals.push(cursor.value);
            cursor.continue();
          } else {
            resolve({ keys, vals });
          }
        };
        tx.onerror = () => reject(tx.error);
      })
  );
}
