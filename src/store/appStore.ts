import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, View, WorkspaceMode, Tool, Toast } from '../types';

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

      // ── Selection ────────────────────────────────────
      selId: null,
      setSelId: (selId) => set({ selId }, false, 'setSelId'),
      deselect: () => set({ selId: null }, false, 'deselect'),

      // ── Props panel ───────────────────────────────────
      propsOpen: false,
      setPropsOpen: (open) => set({ propsOpen: open }, false, 'setPropsOpen'),

      // ── Active tool ───────────────────────────────────
      tool: 'select' as Tool,
      setTool: (tool) => set({ tool }, false, 'setTool'),

      // ── Zoom / pan ────────────────────────────────────
      zoom: 1,
      panX: 0,
      panY: 0,
      setTransform: (zoom, panX, panY) =>
        set({ zoom, panX, panY }, false, 'setTransform'),

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
