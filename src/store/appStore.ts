import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BOARD_W, BOARD_H } from '../constants/board';
import type { AppState, View, WorkspaceMode, Tool, Toast } from '../types';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 1.2;

/**
 * appStore — UI / navigation state.
 * Nothing here is persisted; it resets on page load.
 * Board data (elements, background) lives in boardStore.
 */
const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // ── View ─────────────────────────────────────────
      view: 'menu' as View,
      setView: (view) => set({ view }, false, 'setView'),

      // ── Workspace mode ────────────────────────────────
      mode: 'default' as WorkspaceMode,
      setMode: (mode) => set({ mode }, false, 'setMode'),

      // ── Entry editing hand-off (Archive/viewer → Diary) ──
      editingEntryId: null,
      setEditingEntryId: (editingEntryId) => set({ editingEntryId }, false, 'setEditingEntryId'),

      // ── Selection ────────────────────────────────────
      selId: null,
      setSelId: (selId) => set({ selId }, false, 'setSelId'),
      deselect: () => set({ selId: null }, false, 'deselect'),

      // ── Active tool ───────────────────────────────────
      tool: 'select' as Tool,
      setTool: (tool) => set({ tool }, false, 'setTool'),

      // ── Zoom / pan ────────────────────────────────────
      zoom: 1,
      panX: 0,
      panY: 0,
      setTransform: (zoom, panX, panY) =>
        set({ zoom, panX, panY }, false, 'setTransform'),

      zoomIn: () =>
        set((s) => ({ zoom: Math.min(s.zoom * ZOOM_STEP, ZOOM_MAX) }), false, 'zoomIn'),
      zoomOut: () =>
        set((s) => ({ zoom: Math.max(s.zoom / ZOOM_STEP, ZOOM_MIN) }), false, 'zoomOut'),

      /** Fit the whole board in the visible canvas area, centered. */
      fitBoard: () => {
        const el = document.querySelector<HTMLElement>('[data-board-canvas]');
        if (!el) return;
        const ww = el.clientWidth  || 900;
        const wh = el.clientHeight || 600;
        const z  = Math.min(ww / BOARD_W, wh / BOARD_H) * 0.9;
        set({ zoom: z, panX: (ww - BOARD_W * z) / 2, panY: (wh - BOARD_H * z) / 2 }, false, 'fitBoard');
      },

      // ── Flash transition ──────────────────────────────
      flashing: false,
      setFlashing: (flashing) => set({ flashing }, false, 'setFlashing'),

      // ── Toast notifications ───────────────────────────
      // Usage: useAppStore.getState().showToast('Board saved', 'success')
      toast: null,
      showToast: (message, type = 'info') => {
        const id = `toast-${Date.now()}`;
        set({ toast: { id, message, type } satisfies Toast }, false, 'showToast');
        // Auto-clear after 3 seconds
        setTimeout(() => {
          set((s) => (s.toast?.id === id ? { toast: null } : {}), false, 'clearToast');
        }, 3000);
      },
      clearToast: () => set({ toast: null }, false, 'clearToast'),
    }),
    { name: 'WP:app' }
  )
);

export default useAppStore;
