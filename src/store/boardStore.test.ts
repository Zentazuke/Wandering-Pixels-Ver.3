/**
 * boardStore.test.ts
 * Tests for the core data store — element CRUD, layering, undo/redo,
 * and the buildFilter utility.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import useBoardStore, { buildFilter, makePhotoElement, makeTextElement, makeStickerElement } from './boardStore';
import type { PhotoElement } from '../types/elements';

// Reset store state before each test
beforeEach(() => {
  useBoardStore.setState({ elements: [], currentBg: 'paper', customBgColor: null, customBgImage: null });
  useBoardStore.temporal.getState().clear();
});

// ─── buildFilter ─────────────────────────────────────────────────────────────
describe('buildFilter', () => {
  it('returns "none" when every property is at its default', () => {
    // 'none' avoids a GPU compositing layer that breaks PNG transparency in Chrome.
    expect(buildFilter({})).toBe('none');
    expect(buildFilter({ br: 100, co: 100, sa: 100, bl: 0, se: 0, hr: 0, iv: 0, op: 100 })).toBe('none');
  });

  it('uses short property names correctly', () => {
    const result = buildFilter({ br: 120, co: 80, sa: 150, bl: 2, se: 30, hr: 90, iv: 10, op: 80 });
    expect(result).toContain('brightness(120%)');
    expect(result).toContain('contrast(80%)');
    expect(result).toContain('saturate(150%)');
    expect(result).toContain('blur(2px)');
    expect(result).toContain('sepia(30%)');
    expect(result).toContain('hue-rotate(90deg)');
    expect(result).toContain('invert(10%)');
    expect(result).toContain('opacity(0.8)');
  });

  it('converts opacity from percentage to fraction', () => {
    expect(buildFilter({ op: 50 })).toContain('opacity(0.5)');
    expect(buildFilter({ op: 0 })).toContain('opacity(0)');
    // op:100 alone is all-defaults → collapses to 'none'
    expect(buildFilter({ op: 100 })).toBe('none');
  });
});

// ─── element factories ────────────────────────────────────────────────────────
describe('element factories', () => {
  it('makePhotoElement sets sensible defaults', () => {
    const el = makePhotoElement('data:image/jpeg,...', 0);
    expect(el.type).toBe('photo');
    expect(el.br).toBe(100);
    expect(el.co).toBe(100);
    expect(el.frame).toBe('polaroid');
    expect(el.flipH).toBe(false);
  });

  it('makeTextElement sets sensible defaults', () => {
    const el = makeTextElement(0);
    expect(el.type).toBe('text');
    expect(el.fontFamily).toBe('Lora');
    expect(el.bold).toBe(false);
    expect(el.align).toBe('left');
  });

  it('makeStickerElement sets sensible defaults', () => {
    const el = makeStickerElement('<path d="..."/>', 0);
    expect(el.type).toBe('sticker');
    expect(el.opacity).toBe(100);
  });
});

// ─── addElement ───────────────────────────────────────────────────────────────
describe('addElement', () => {
  it('adds an element and returns its id', () => {
    const id = useBoardStore.getState().addElement(makePhotoElement('src.jpg', 0));
    const { elements } = useBoardStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].id).toBe(id);
  });

  it('assigns zIndex equal to current element count', () => {
    useBoardStore.getState().addElement(makePhotoElement('a.jpg', 0));
    useBoardStore.getState().addElement(makePhotoElement('b.jpg', 1));
    const { elements } = useBoardStore.getState();
    expect(elements[0].zIndex).toBe(0);
    expect(elements[1].zIndex).toBe(1);
  });

  it('generates unique ids for each element', () => {
    const id1 = useBoardStore.getState().addElement(makeTextElement(0));
    const id2 = useBoardStore.getState().addElement(makeTextElement(1));
    expect(id1).not.toBe(id2);
  });
});

// ─── updateElement ────────────────────────────────────────────────────────────
describe('updateElement', () => {
  it('patches only the specified fields', () => {
    const id = useBoardStore.getState().addElement(makePhotoElement('src.jpg', 0));
    useBoardStore.getState().updateElement(id, { x: 999, br: 150 });
    const el = useBoardStore.getState().elements.find((e) => e.id === id)!;
    expect(el.x).toBe(999);
    expect((el as PhotoElement).br).toBe(150);
    expect(el.y).toBe(100); // unchanged
  });

  it('does nothing when id not found', () => {
    useBoardStore.getState().addElement(makePhotoElement('src.jpg', 0));
    const before = useBoardStore.getState().elements[0].x;
    useBoardStore.getState().updateElement('nonexistent', { x: 999 });
    expect(useBoardStore.getState().elements[0].x).toBe(before);
  });
});

// ─── removeElement ────────────────────────────────────────────────────────────
describe('removeElement', () => {
  it('removes the element with the given id', () => {
    const id = useBoardStore.getState().addElement(makeTextElement(0));
    useBoardStore.getState().removeElement(id);
    expect(useBoardStore.getState().elements).toHaveLength(0);
  });

  it('only removes the target element', () => {
    const id1 = useBoardStore.getState().addElement(makeTextElement(0));
    const id2 = useBoardStore.getState().addElement(makeTextElement(1));
    useBoardStore.getState().removeElement(id1);
    const { elements } = useBoardStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].id).toBe(id2);
  });
});

// ─── duplicateElement ─────────────────────────────────────────────────────────
describe('duplicateElement', () => {
  it('creates a new element with offset position', () => {
    const id = useBoardStore.getState().addElement(makePhotoElement('src.jpg', 0));
    const origX = useBoardStore.getState().elements[0].x;
    const cloneId = useBoardStore.getState().duplicateElement(id);
    const clone = useBoardStore.getState().elements.find((e) => e.id === cloneId)!;
    expect(clone.x).toBe(origX + 20);
    expect(cloneId).not.toBe(id);
  });

  it('returns undefined for unknown id', () => {
    const result = useBoardStore.getState().duplicateElement('ghost');
    expect(result).toBeUndefined();
  });
});

// ─── layering ─────────────────────────────────────────────────────────────────
describe('bringToFront / sendToBack', () => {
  it('bringToFront moves element to end of array', () => {
    const id1 = useBoardStore.getState().addElement(makeTextElement(0));
    const id2 = useBoardStore.getState().addElement(makeTextElement(1));
    const id3 = useBoardStore.getState().addElement(makeTextElement(2));
    useBoardStore.getState().bringToFront(id1);
    const els = useBoardStore.getState().elements;
    expect(els[els.length - 1].id).toBe(id1);
    expect(els.map((e) => e.id)).toContain(id2);
    expect(els.map((e) => e.id)).toContain(id3);
  });

  it('sendToBack moves element to front of array', () => {
    const id1 = useBoardStore.getState().addElement(makeTextElement(0));
    const id2 = useBoardStore.getState().addElement(makeTextElement(1));
    useBoardStore.getState().sendToBack(id2);
    expect(useBoardStore.getState().elements[0].id).toBe(id2);
    expect(useBoardStore.getState().elements[1].id).toBe(id1);
  });
});

// ─── background ───────────────────────────────────────────────────────────────
describe('background', () => {
  it('setBg clears custom colour and image', () => {
    useBoardStore.setState({ customBgColor: '#ff0000', customBgImage: 'data:...' });
    useBoardStore.getState().setBg('grid');
    const { currentBg, customBgColor, customBgImage } = useBoardStore.getState();
    expect(currentBg).toBe('grid');
    expect(customBgColor).toBeNull();
    expect(customBgImage).toBeNull();
  });

  it('setCustomBgColor sets the custom colour mode', () => {
    useBoardStore.getState().setCustomBgColor('#abc123');
    const { currentBg, customBgColor } = useBoardStore.getState();
    expect(currentBg).toBe('custom');
    expect(customBgColor).toBe('#abc123');
  });
});

// ─── loadBoard ────────────────────────────────────────────────────────────────
describe('loadBoard', () => {
  it('replaces elements and background', () => {
    useBoardStore.getState().addElement(makeTextElement(0));
    const elements = [{ ...makePhotoElement('src.jpg', 0), id: 'loaded-1' }];
    useBoardStore.getState().loadBoard(elements, 'dark');
    const state = useBoardStore.getState();
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].id).toBe('loaded-1');
    expect(state.currentBg).toBe('dark');
  });

  it('defaults to paper background when bg is undefined', () => {
    useBoardStore.getState().loadBoard([]);
    expect(useBoardStore.getState().currentBg).toBe('paper');
  });
});
