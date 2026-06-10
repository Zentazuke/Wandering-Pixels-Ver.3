/**
 * usePersistence.test.ts
 * Characterization tests for the auto-save lifecycle, including the
 * view-switch data-loss race: edits made within the debounce window must
 * survive the hook unmounting (flush, not cancel) and a remount must not
 * clobber newer in-memory state with stale disk state (load once per session).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../db/boardDB', () => ({
  dbSave: vi.fn(() => Promise.resolve()),
  dbLoad: vi.fn(() => Promise.resolve(undefined)),
}));

import { dbSave, dbLoad } from '../db/boardDB';
import { usePersistence, __resetPersistenceForTests } from './usePersistence';
import useBoardStore, { makeTextElement } from '../store/boardStore';

const mockSave = vi.mocked(dbSave);
const mockLoad = vi.mocked(dbLoad);

/** Flush pending microtasks (dbLoad promise chain) under fake timers. */
async function flushMicrotasks() {
  await act(async () => { await Promise.resolve(); });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  __resetPersistenceForTests();
  useBoardStore.setState({ elements: [], currentBg: 'paper', customBgColor: null, customBgImage: null });
  useBoardStore.temporal.getState().clear();
  mockLoad.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('load on first mount', () => {
  it('applies a saved board from IDB', async () => {
    const saved = {
      elements: [{ ...makeTextElement(0), id: 'saved-1' }],
      currentBg: 'grid',
      customBgColor: null,
      customBgImage: null,
    };
    mockLoad.mockResolvedValue(saved);

    renderHook(() => usePersistence());
    await flushMicrotasks();

    const s = useBoardStore.getState();
    expect(s.elements).toHaveLength(1);
    expect(s.elements[0].id).toBe('saved-1');
    expect(s.currentBg).toBe('grid');
  });

  it('starts with an empty board when nothing is saved', async () => {
    renderHook(() => usePersistence());
    await flushMicrotasks();
    expect(useBoardStore.getState().elements).toHaveLength(0);
  });
});

describe('debounced auto-save', () => {
  it('saves 800ms after a change', async () => {
    renderHook(() => usePersistence());
    await flushMicrotasks();

    act(() => { useBoardStore.getState().addElement(makeTextElement(0)); });
    expect(mockSave).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(800); });
    expect(mockSave).toHaveBeenCalledTimes(1);
    const payload = mockSave.mock.calls[0][1] as { elements: unknown[] };
    expect(payload.elements).toHaveLength(1);
  });

  it('coalesces rapid changes into one save', async () => {
    renderHook(() => usePersistence());
    await flushMicrotasks();

    act(() => {
      const { addElement } = useBoardStore.getState();
      addElement(makeTextElement(0));
      addElement(makeTextElement(1));
      addElement(makeTextElement(2));
    });
    act(() => { vi.advanceTimersByTime(800); });

    expect(mockSave).toHaveBeenCalledTimes(1);
    const payload = mockSave.mock.calls[0][1] as { elements: unknown[] };
    expect(payload.elements).toHaveLength(3);
  });
});

describe('the view-switch race (data-loss regression tests)', () => {
  it('flushes a pending save on unmount instead of discarding it', async () => {
    const { unmount } = renderHook(() => usePersistence());
    await flushMicrotasks();

    // Edit, then unmount BEFORE the 800ms debounce fires —
    // exactly what happens when the user switches view right after an edit.
    act(() => { useBoardStore.getState().addElement(makeTextElement(0)); });
    unmount();

    expect(mockSave).toHaveBeenCalledTimes(1);
    const payload = mockSave.mock.calls[0][1] as { elements: unknown[] };
    expect(payload.elements).toHaveLength(1);
  });

  it('does not reload from IDB on remount (stale disk must not clobber memory)', async () => {
    const stale = {
      elements: [{ ...makeTextElement(0), id: 'stale-from-disk' }],
      currentBg: 'paper',
      customBgColor: null,
      customBgImage: null,
    };
    mockLoad.mockResolvedValue(stale);

    const first = renderHook(() => usePersistence());
    await flushMicrotasks();
    expect(useBoardStore.getState().elements[0]?.id).toBe('stale-from-disk');

    // User edits, then the hook remounts (view switch round-trip)
    act(() => { useBoardStore.getState().addElement(makeTextElement(1)); });
    first.unmount();
    renderHook(() => usePersistence());
    await flushMicrotasks();

    // In-memory state must survive: still 2 elements, not reset to the stale 1
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(useBoardStore.getState().elements).toHaveLength(2);
  });

  it('keeps auto-saving after a remount', async () => {
    const first = renderHook(() => usePersistence());
    await flushMicrotasks();
    first.unmount();

    renderHook(() => usePersistence());
    await flushMicrotasks();

    act(() => { useBoardStore.getState().addElement(makeTextElement(0)); });
    act(() => { vi.advanceTimersByTime(800); });
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

describe('beforeunload', () => {
  it('flushes a pending save when the page is closing', async () => {
    renderHook(() => usePersistence());
    await flushMicrotasks();

    act(() => { useBoardStore.getState().addElement(makeTextElement(0)); });
    act(() => { window.dispatchEvent(new Event('beforeunload')); });

    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});
