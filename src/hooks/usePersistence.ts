/**
 * usePersistence — auto-saves board state to IndexedDB whenever elements
 * or background changes, and loads it back on first mount.
 *
 * Why IndexedDB and not localStorage?
 *   localStorage has a 5–10 MB limit per origin. A single custom background
 *   image (base64 data URL) can exceed that, causing silent failures.
 *   IndexedDB has no practical size limit for this use case.
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

export function usePersistence(): void {
  const elements      = useBoardStore((s) => s.elements);
  const currentBg     = useBoardStore((s) => s.currentBg);
  const customBgColor = useBoardStore((s) => s.customBgColor);
  const customBgImage = useBoardStore((s) => s.customBgImage);
  const loadBoard     = useBoardStore((s) => s.loadBoard);

  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  // ── Load once on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    dbLoad<SavedBoard>(SAVE_KEY)
      .then((saved) => {
        if (saved?.elements) {
          loadBoard(saved.elements, saved.currentBg);
          if (saved.customBgColor) useBoardStore.setState({ customBgColor: saved.customBgColor });
          if (saved.customBgImage) useBoardStore.setState({ customBgImage: saved.customBgImage });
        }
      })
      .catch(() => {
        // IDB unavailable (e.g. private browsing, storage quota exceeded).
        // Show a warning toast so the user knows saves won't persist.
        useAppStore.getState().showToast('Storage unavailable — changes won\'t be saved', 'error');
      })
      .finally(() => {
        // Always allow auto-save, even on first visit with no saved state.
        loadedRef.current = true;
      });
  }, [loadBoard]);

  // ── Debounced auto-save ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loadedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      dbSave(SAVE_KEY, { elements, currentBg, customBgColor, customBgImage })
        .catch(() => {
          useAppStore.getState().showToast('Auto-save failed', 'error');
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [elements, currentBg, customBgColor, customBgImage]);
}
