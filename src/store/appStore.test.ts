/**
 * appStore.test.ts
 * Tests for UI state — view transitions, selection, toast system.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAppStore from './appStore';

beforeEach(() => {
  useAppStore.setState({
    view: 'menu', mode: 'default', selId: null,
    propsOpen: false, tool: 'select',
    zoom: 1, panX: 0, panY: 0,
    flashing: false, toast: null,
  });
});

describe('view', () => {
  it('setView changes the current view', () => {
    useAppStore.getState().setView('board');
    expect(useAppStore.getState().view).toBe('board');
  });

  it('setView to archive', () => {
    useAppStore.getState().setView('archive');
    expect(useAppStore.getState().view).toBe('archive');
  });
});

describe('selection', () => {
  it('setSelId sets the selected element id', () => {
    useAppStore.getState().setSelId('el-abc');
    expect(useAppStore.getState().selId).toBe('el-abc');
  });

  it('deselect clears selId', () => {
    useAppStore.getState().setSelId('el-abc');
    useAppStore.getState().deselect();
    expect(useAppStore.getState().selId).toBeNull();
  });
});

describe('transform', () => {
  it('setTransform updates zoom and pan', () => {
    useAppStore.getState().setTransform(1.5, 100, -50);
    const { zoom, panX, panY } = useAppStore.getState();
    expect(zoom).toBe(1.5);
    expect(panX).toBe(100);
    expect(panY).toBe(-50);
  });
});

describe('toast', () => {
  it('showToast sets toast with correct message and type', () => {
    useAppStore.getState().showToast('Board saved', 'success');
    const { toast } = useAppStore.getState();
    expect(toast).not.toBeNull();
    expect(toast?.message).toBe('Board saved');
    expect(toast?.type).toBe('success');
    expect(toast?.id).toMatch(/^toast-/);
  });

  it('showToast defaults to info type', () => {
    useAppStore.getState().showToast('Hello');
    expect(useAppStore.getState().toast?.type).toBe('info');
  });

  it('clearToast removes the toast', () => {
    useAppStore.getState().showToast('Test');
    useAppStore.getState().clearToast();
    expect(useAppStore.getState().toast).toBeNull();
  });

  it('auto-clears toast after 3 seconds', async () => {
    vi.useFakeTimers();
    useAppStore.getState().showToast('Fading message');
    expect(useAppStore.getState().toast).not.toBeNull();
    vi.advanceTimersByTime(3001);
    expect(useAppStore.getState().toast).toBeNull();
    vi.useRealTimers();
  });
});

describe('mode', () => {
  it('setMode changes workspace mode', () => {
    useAppStore.getState().setMode('travel');
    expect(useAppStore.getState().mode).toBe('travel');
  });
});
