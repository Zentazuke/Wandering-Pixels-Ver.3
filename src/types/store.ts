import type { BoardElement, PhotoElement, TextElement, StickerElement, ShapeElement } from './elements';

/**
 * Omit that distributes over union members. A plain Omit<BoardElement, K>
 * collapses the union to its common fields, rejecting type-specific
 * properties like `src` or `content`.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Payload for addElement — everything except id; zIndex optional (defaults to top). */
export type NewElement = DistributiveOmit<BoardElement, 'id' | 'zIndex'> & { zIndex?: number };

/**
 * Patch for updateElement — a partial of one concrete element type, so
 * type-specific fields (src, content, x2…) typecheck without casts.
 * Callers are responsible for patching fields matching the element's type.
 */
export type ElementPatch =
  | Partial<PhotoElement>
  | Partial<TextElement>
  | Partial<StickerElement>
  | Partial<ShapeElement>;

// ─── App store ────────────────────────────────────────────────────────────────
export type View = 'menu' | 'board' | 'diary' | 'archive';
export type WorkspaceMode =
  | 'default' | 'travel' | 'love' | 'family' | 'game'
  | 'pets' | 'children' | 'sports' | 'dreams' | 'gratitude';
export type Tool = 'select' | 'text' | 'photo' | 'sticker';

export interface Toast {
  id:       string;
  message:  string;
  type:     'info' | 'success' | 'error';
}

export interface AppState {
  view:        View;
  setView:     (view: View) => void;

  mode:        WorkspaceMode;
  setMode:     (mode: WorkspaceMode) => void;

  selId:       string | null;
  setSelId:    (id: string) => void;
  deselect:    () => void;

  tool:        Tool;
  setTool:     (tool: Tool) => void;

  zoom:        number;
  panX:        number;
  panY:        number;
  setTransform:(zoom: number, panX: number, panY: number) => void;
  zoomIn:      () => void;
  zoomOut:     () => void;
  fitBoard:    () => void;

  flashing:    boolean;
  setFlashing: (flashing: boolean) => void;

  toast:       Toast | null;
  showToast:   (message: string, type?: Toast['type']) => void;
  clearToast:  () => void;
}

// ─── Board store ──────────────────────────────────────────────────────────────
export interface BoardState {
  elements:          BoardElement[];
  currentBg:         string;
  customBgColor:     string | null;
  customBgImage:     string | null;

  setBg:             (bgId: string) => void;
  setCustomBgColor:  (color: string) => void;
  setCustomBgImage:  (dataUrl: string) => void;

  addElement:        (partial: NewElement) => string;
  updateElement:     (id: string, patch: ElementPatch) => void;
  removeElement:     (id: string) => void;
  duplicateElement:  (id: string) => string | undefined;

  bringForward:      (id: string) => void;
  sendBackward:      (id: string) => void;
  bringToFront:      (id: string) => void;
  sendToBack:        (id: string) => void;

  clearBoard:        () => void;
  loadBoard:         (elements: BoardElement[], bg?: string) => void;
}
