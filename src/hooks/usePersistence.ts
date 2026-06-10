/**
 * usePersistence — auto-saves board state to IndexedDB whenever it changes,
 * and loads it back once per session.
 *
 * Lifecycle rules (each one prevents a data-loss bug):
 *   1. Load from IDB at most ONCE per browser session. Reloading on every
 *      mount would overwrite newer in-memory edits with stale disk state.
 *   2. On unmount, a pending debounced save is FLUSHED, never discarded —
 *      otherwise edits made within the debounce window vanish when the
 *      user switches views.
 *   3. `beforeunload` also flushes, so closing the tab right after an edit
 *      doesn't lose it.
 *
 * The hook subscribes to the store imperatively (not via selector hooks),
 * so the host component does NOT re-render on board changes. This lets it
 * live at the App level without re-rendering the whole tree on every drag.
 *
 * Why IndexedDB and not localStorage?
 *   localStorage has a 5–10 MB limit per origin. A single custom background
 *   image (base64 data URL) can exceed that, causing silent failures.
 */
import { useEffect, useRef } from 'react';
import useBoardStore from '../store/boardStore';
import useAppStore from '../store/appStore';
import { dbSave, dbLoad } from '../db/boardDB';
import type { BoardElement } from '../types';

const SAVE_KEY    = 'board-state';
const DEBOUNCE_MS = 800;

interface SavedBoard {
  elements:      BoardElement[];
  currentBg:     string;
  customBgColor: string | null;
  customBgImage: string | null;
}

// Module-level: survives hook remounts. The board is loaded from disk at
// most once per session (rule 1).
let sessionLoaded = false;

/** Test-only: reset the once-per-session load gate. */
export function __resetPersistenceForTests(): void {
  sessionLoaded = false;
}

export function usePersistence(): void {
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<SavedBoard | null>(null);
  const readyRef   = useRef(false);

  useEffect(() => {
    // ── Load once per session ─────────────────────────────────────────────
    if (sessionLoaded) {
      readyRef.current = true;
    } else {
      sessionLoaded = true;
      dbLoad<SavedBoard>(SAVE_KEY)
        .then((saved) => {
          if (saved?.elements) {
            useBoardStore.getState().loadBoard(saved.elements, saved.currentBg);
            if (saved.customBgColor) useBoardStore.setState({ customBgColor: saved.customBgColor });
            if (saved.customBgImage) useBoardStore.setState({ customBgImage: saved.customBgImage });
          }
        })
        .catch(() => {
          // IDB unavailable (e.g. private browsing, storage quota exceeded).
          useAppStore.getState().showToast('Storage unavailable — changes won\'t be saved', 'error');
        })
        .finally(() => {
          // Always allow auto-save, even on first visit with no saved state.
          readyRef.current = true;
        });
    }

    // ── Write the pending payload immediately (rule 2 & 3) ────────────────
    function flush() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const payload = pendingRef.current;
      pendingRef.current = null;
      if (payload) {
        dbSave(SAVE_KEY, payload).catch(() => {
          useAppStore.getState().showToast('Auto-save failed', 'error');
        });
      }
    }

    // ── Debounced auto-save on every board change ─────────────────────────
    const unsubscribe = useBoardStore.subscribe((s) => {
      if (!readyRef.current) return;
      pendingRef.current = {
        elements:      s.elements,
        currentBg:     s.currentBg,
        customBgColor: s.customBgColor,
        customBgImage: s.customBgImage,
      };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, DEBOUNCE_MS);
    });

    window.addEventListener('beforeunload', flush);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', flush);
      flush(); // never discard a pending save (rule 2)
    };
  }, []);
}
