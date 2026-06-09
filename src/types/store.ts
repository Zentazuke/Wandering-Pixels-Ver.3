import type { BoardElement } from './elements';

// ─── App store ────────────────────────────────────────────────────────────────
export type View = 'menu' | 'board' | 'diary' | 'archive';
export type WorkspaceMode = 'default' | 'travel' | 'love' | 'family' | 'game';
export type Tool = 'select' | 'text' | 'photo' | 'sticker' | 'draw';

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

  propsOpen:   boolean;
  setPropsOpen:(open: boolean) => void;

  tool:        Tool;
  setTool:     (tool: Tool) => void;

  zoom:        number;
  panX:        number;
  panY:        number;
  setTransform:(zoom: number, panX: number, panY: number) => void;

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

  addElement:        (partial: Omit<BoardElement, 'id' | 'zIndex'>) => string;
  updateElement:     (id: string, patch: Partial<BoardElement>) => void;
  removeElement:     (id: string) => void;
  duplicateElement:  (id: string) => string | undefined;

  bringForward:      (id: string) => void;
  sendBackward:      (id: string) => void;
  bringToFront:      (id: string) => void;
  sendToBack:        (id: string) => void;

  clearBoard:        () => void;
  loadBoard:         (elements: BoardElement[], bg?: string) => void;
}
