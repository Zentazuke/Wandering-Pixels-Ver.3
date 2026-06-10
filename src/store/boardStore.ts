import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { BoardState } from '../types';
import type { BoardElement, PhotoElement, TextElement, StickerElement, ShapeElement } from '../types/elements';

// ─── ID generator ─────────────────────────────────────────────────────────────
let _nextId = Date.now();
const genId = () => `el-${(_nextId++).toString(36)}`;

// ─── Filter builder ───────────────────────────────────────────────────────────
/**
 * Build a CSS filter string from a PhotoElement's filter settings.
 * Short property names (br, co, sa…) are the canonical storage format.
 *
 *  br = brightness  (0–200, default 100)
 *  co = contrast    (0–200, default 100)
 *  sa = saturation  (0–200, default 100)
 *  bl = blur        (0–20px, default 0)
 *  se = sepia       (0–100, default 0)
 *  hr = hue-rotate  (0–360deg, default 0)
 *  iv = invert      (0–100, default 0)
 *  op = opacity     (10–100, default 100) — stored as %, applied as fraction
 */
export function buildFilter(el: Pick<PhotoElement, 'br'|'co'|'sa'|'bl'|'se'|'hr'|'iv'|'op'>): string {
  // Return 'none' when everything is at default — avoids creating a GPU compositing
  // layer that breaks PNG transparency in Chrome.
  if (
    (el.br ?? 100) === 100 &&
    (el.co ?? 100) === 100 &&
    (el.sa ?? 100) === 100 &&
    (el.bl ?? 0)   === 0   &&
    (el.se ?? 0)   === 0   &&
    (el.hr ?? 0)   === 0   &&
    (el.iv ?? 0)   === 0   &&
    (el.op ?? 100) === 100
  ) return 'none';

  return [
    `brightness(${el.br ?? 100}%)`,
    `contrast(${el.co ?? 100}%)`,
    `saturate(${el.sa ?? 100}%)`,
    `blur(${el.bl ?? 0}px)`,
    `sepia(${el.se ?? 0}%)`,
    `hue-rotate(${el.hr ?? 0}deg)`,
    `invert(${el.iv ?? 0}%)`,
    `opacity(${(el.op ?? 100) / 100})`,
  ].join(' ');
}

// ─── Layer helpers ────────────────────────────────────────────────────────────
/**
 * Stamp each element's zIndex to match its position in the array.
 * Must be called after every reorder so CSS z-index stays in sync.
 */
function stampZIndices(arr: BoardElement[]): BoardElement[] {
  return arr.map((el, i) => ({ ...el, zIndex: i }));
}

// ─── Element factories ────────────────────────────────────────────────────────
// All defaults live here — not scattered as `?? 100` across ten component files.
// Every creation path (Toolbar, pickers, tests) must go through these;
// `overrides` covers caller-specific placement/styling.

export function makePhotoElement(
  src: string,
  zIndex: number,
  overrides: Partial<Omit<PhotoElement, 'id' | 'type'>> = {},
): Omit<PhotoElement, 'id'> {
  return {
    type: 'photo', src,
    x: 120, y: 100, w: 220, h: 180, rotation: 0, zIndex, locked: false,
    frame: 'polaroid', shape: 'square', shadow: true,
    flipH: false, flipV: false, imgZoom: 1, imgX: 50, imgY: 50,
    br: 100, co: 100, sa: 100, bl: 0, se: 0, hr: 0, iv: 0, op: 100,
    ...overrides,
  };
}

export function makeTextElement(
  zIndex: number,
  overrides: Partial<Omit<TextElement, 'id' | 'type'>> = {},
): Omit<TextElement, 'id'> {
  return {
    type: 'text', content: '',
    x: 140, y: 120, w: 200, h: 100, rotation: 0, zIndex, locked: false,
    fontFamily: 'Lora', fontSize: 15, bold: false, italic: false,
    align: 'left', color: '#3b3328',
    bg: '#fff9e6', noteFrame: 'shadow',
    ...overrides,
  };
}

export function makeShapeElement(
  shape: ShapeElement['shape'],
  zIndex: number,
  extra?: Partial<Pick<ShapeElement, 'x' | 'y' | 'x2' | 'y2'>>,
): Omit<ShapeElement, 'id'> {
  const isLine = shape === 'line' || shape === 'arrow';
  return {
    type: 'shape', shape,
    x: extra?.x ?? 200, y: extra?.y ?? 200,
    w: isLine ? 0   : 160,
    h: isLine ? 0   : 100,
    x2: isLine ? (extra?.x2 ?? (extra?.x ?? 200) + 180) : undefined,
    y2: isLine ? (extra?.y2 ?? (extra?.y ?? 200))        : undefined,
    rotation: 0, zIndex, locked: false,
    fill: 'transparent', stroke: '#b5943a',
    strokeWidth: 2, fillOpacity: 100,
    shapeFrame: 'none',
  };
}

export function makeStickerElement(
  svg: string,
  zIndex: number,
  overrides: Partial<Omit<StickerElement, 'id' | 'type'>> = {},
): Omit<StickerElement, 'id'> {
  return {
    type: 'sticker', svg,
    x: 160, y: 140, w: 80, h: 80, rotation: 0, zIndex, locked: false,
    opacity: 100,
    ...overrides,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Persistence: handled entirely by usePersistence hook (IndexedDB, 800ms debounce).
// localStorage / zustand persist middleware deliberately omitted — it cannot
// handle base64 image payloads without hitting the 5–10 MB storage limit.

// ─── Gesture undo grouping ────────────────────────────────────────────────────
// A drag/resize/rotate fires updateElement on every pointermove. Without
// grouping, zundo records one history entry per pixel of movement, so Ctrl+Z
// "undoes" a single mousemove. These helpers wrap a gesture so the whole
// thing lands in history as exactly one entry.
//
// Usage: const pre = beginGesture();  …many updates…  commitGesture(pre);

/** Pause history recording and snapshot the pre-gesture elements. */
export function beginGesture(): BoardElement[] {
  useBoardStore.temporal.getState().pause();
  return useBoardStore.getState().elements;
}

/**
 * End a gesture: record the whole thing as ONE undo entry.
 * If nothing changed (a plain click), records nothing.
 */
export function commitGesture(preElements: BoardElement[]): void {
  const temporal = useBoardStore.temporal.getState();
  const finalElements = useBoardStore.getState().elements;

  if (finalElements === preElements) {
    // No updates happened during the gesture — nothing to record.
    temporal.resume();
    return;
  }

  // Rewind silently (still paused), resume recording, then re-apply the final
  // state in a single set — zundo stores the pre-gesture state as one entry.
  useBoardStore.setState({ elements: preElements });
  temporal.resume();
  useBoardStore.setState({ elements: finalElements });
}

const useBoardStore = create<BoardState>()(
  devtools(
    temporal(
      (set, get) => ({
        // ── Background ─────────────────────────────────
        currentBg: 'paper',
        customBgColor: null,
        customBgImage: null,

        setBg: (bgId) =>
          set({ currentBg: bgId, customBgColor: null, customBgImage: null }, false, 'setBg'),
        setCustomBgColor: (color) =>
          set({ currentBg: 'custom', customBgColor: color, customBgImage: null }, false, 'setCustomBgColor'),
        setCustomBgImage: (dataUrl) =>
          set({ currentBg: 'custom-image', customBgColor: null, customBgImage: dataUrl }, false, 'setCustomBgImage'),

        // ── Elements ────────────────────────────────────
        elements: [],

        addElement: (partial) => {
          const el: BoardElement = {
            id: genId(),
            zIndex: get().elements.length,
            ...partial,
          } as BoardElement;
          set((s) => ({ elements: [...s.elements, el] }), false, 'addElement');
          return el.id;
        },

        updateElement: (id, patch) =>
          set(
            (s) => ({
              // Cast needed: spreading Partial<BoardElement> over a union member
              // can't be proven sound by TS. Callers are responsible for patching
              // fields that match the element's type.
              elements: s.elements.map((el) => (el.id === id ? { ...el, ...patch } as BoardElement : el)),
            }),
            false,
            'updateElement'
          ),

        removeElement: (id) =>
          set(
            (s) => ({ elements: s.elements.filter((el) => el.id !== id) }),
            false,
            'removeElement'
          ),

        duplicateElement: (id) => {
          const el = get().elements.find((e) => e.id === id);
          if (!el) return undefined;
          const clone: BoardElement = {
            ...el,
            id: genId(),
            x: el.x + 20,
            y: el.y + 20,
            zIndex: get().elements.length,
          };
          set((s) => ({ elements: [...s.elements, clone] }), false, 'duplicateElement');
          return clone.id;
        },

        bringForward: (id) =>
          set((s) => {
            const arr = [...s.elements];
            const i = arr.findIndex((e) => e.id === id);
            if (i < arr.length - 1) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
            return { elements: stampZIndices(arr) };
          }, false, 'bringForward'),

        sendBackward: (id) =>
          set((s) => {
            const arr = [...s.elements];
            const i = arr.findIndex((e) => e.id === id);
            if (i > 0) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
            return { elements: stampZIndices(arr) };
          }, false, 'sendBackward'),

        bringToFront: (id) =>
          set((s) => {
            const rest = s.elements.filter((e) => e.id !== id);
            const el   = s.elements.find((e) => e.id === id);
            return { elements: stampZIndices(el ? [...rest, el] : rest) };
          }, false, 'bringToFront'),

        sendToBack: (id) =>
          set((s) => {
            const rest = s.elements.filter((e) => e.id !== id);
            const el   = s.elements.find((e) => e.id === id);
            return { elements: stampZIndices(el ? [el, ...rest] : rest) };
          }, false, 'sendToBack'),

        clearBoard: () => set({ elements: [] }, false, 'clearBoard'),

        loadBoard: (elements, bg) =>
          set({ elements, currentBg: bg ?? 'paper' }, false, 'loadBoard'),
      }),
      {
        // Cap undo history — without a limit it grows unbounded for the whole
        // session, and each entry references the elements array (incl. base64
        // photo payloads on edited elements).
        limit: 50,
      }
    ),
    { name: 'WP:board' }
  )
);

export default useBoardStore;
