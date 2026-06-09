import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { BoardState } from '../types';
import type { BoardElement, PhotoElement, TextElement, StickerElement } from '../types/elements';

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

// ─── Element factories ────────────────────────────────────────────────────────
// All defaults live here — not scattered as `?? 100` across ten component files.

export function makePhotoElement(src: string, zIndex: number): Omit<PhotoElement, 'id'> {
  return {
    type: 'photo', src,
    x: 120, y: 100, w: 220, h: 180, rotation: 0, zIndex, locked: false,
    frame: 'polaroid', shape: 'square', shadow: true,
    flipH: false, flipV: false, imgZoom: 1, imgX: 50, imgY: 50,
    br: 100, co: 100, sa: 100, bl: 0, se: 0, hr: 0, iv: 0, op: 100,
  };
}

export function makeTextElement(zIndex: number): Omit<TextElement, 'id'> {
  return {
    type: 'text', content: '',
    x: 140, y: 120, w: 200, h: 100, rotation: 0, zIndex, locked: false,
    fontFamily: 'Lora', fontSize: 15, bold: false, italic: false,
    align: 'left', color: '#3b3328',
    bg: '#fff9e6', noteFrame: 'shadow',
  };
}

export function makeStickerElement(svg: string, zIndex: number): Omit<StickerElement, 'id'> {
  return {
    type: 'sticker', svg,
    x: 160, y: 140, w: 80, h: 80, rotation: 0, zIndex, locked: false,
    opacity: 100,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Persistence: handled entirely by usePersistence hook (IndexedDB, 800ms debounce).
// localStorage / zustand persist middleware deliberately omitted — it cannot
// handle base64 image payloads without hitting the 5–10 MB storage limit.

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
              elements: s.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
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
            return { elements: arr };
          }, false, 'bringForward'),

        sendBackward: (id) =>
          set((s) => {
            const arr = [...s.elements];
            const i = arr.findIndex((e) => e.id === id);
            if (i > 0) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
            return { elements: arr };
          }, false, 'sendBackward'),

        bringToFront: (id) =>
          set((s) => {
            const arr = s.elements.filter((e) => e.id !== id);
            const el  = s.elements.find((e) => e.id === id);
            return { elements: el ? [...arr, el] : arr };
          }, false, 'bringToFront'),

        sendToBack: (id) =>
          set((s) => {
            const arr = s.elements.filter((e) => e.id !== id);
            const el  = s.elements.find((e) => e.id === id);
            return { elements: el ? [el, ...arr] : arr };
          }, false, 'sendToBack'),

        clearBoard: () => set({ elements: [] }, false, 'clearBoard'),

        loadBoard: (elements, bg) =>
          set({ elements, currentBg: bg ?? 'paper' }, false, 'loadBoard'),
      })
    ),
    { name: 'WP:board' }
  )
);

export default useBoardStore;
