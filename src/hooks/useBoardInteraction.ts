import { useEffect, useRef, useCallback } from 'react';
import useAppStore from '../store/appStore.js';
import useBoardStore, { beginGesture, commitGesture } from '../store/boardStore.js';
import type { BoardElement } from '../types';

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'p1' | 'p2';

type InteractionState = {
  zoom: number; panX: number; panY: number; selId: string | null;
  dragging: string | null; dragOX: number; dragOY: number;
  dragOrigX: number; dragOrigY: number;
  dragX2: number | null; dragY2: number | null;
  resizing: string | null; resizeHandle: ResizeHandle | null;
  resizeStartX: number; resizeStartY: number;
  resizeStartW: number; resizeStartH: number;
  resizeElX: number; resizeElY: number;
  rotating: string | null; rotCX: number; rotCY: number;
  rotStartAngle: number; rotStartRot: number;
  elements: BoardElement[];
  /** Pre-gesture snapshot — non-null while a drag/resize/rotate is active. */
  preElements: BoardElement[] | null;
};

/**
 * useBoardInteraction(canvasRef)
 *
 * Handles element drag, resize, and rotate for the entire board.
 * Returns event handlers to attach to each element and the canvas wrapper.
 */
export function useBoardInteraction(canvasRef: React.RefObject<HTMLElement | null>): {
  onElPointerDown:     (e: React.PointerEvent<HTMLElement>, id: string) => void;
  onRotatePointerDown: (e: React.PointerEvent<HTMLElement>, id: string, nodeRef: React.RefObject<HTMLElement | null>) => void;
  onResizePointerDown: (e: React.PointerEvent<HTMLElement>, id: string, handle: ResizeHandle) => void;
  onBoardPointerDown:  (e: React.PointerEvent<HTMLElement>) => void;
} {
  const setSelId  = useAppStore((s) => s.setSelId);
  const deselect  = useAppStore((s) => s.deselect);
  const zoom      = useAppStore((s) => s.zoom);
  const panX      = useAppStore((s) => s.panX);
  const panY      = useAppStore((s) => s.panY);
  const updateEl  = useBoardStore((s) => s.updateElement);
  const elements  = useBoardStore((s) => s.elements);
  const selId     = useAppStore((s) => s.selId);

  const ref = useRef<InteractionState>({
    zoom, panX, panY, selId,
    dragging: null, dragOX: 0, dragOY: 0,
    dragOrigX: 0, dragOrigY: 0, dragX2: null, dragY2: null,
    resizing: null, resizeHandle: null,
    resizeStartX: 0, resizeStartY: 0,
    resizeStartW: 0, resizeStartH: 0,
    resizeElX: 0, resizeElY: 0,
    rotating: null, rotCX: 0, rotCY: 0,
    rotStartAngle: 0, rotStartRot: 0,
    elements: [],
    preElements: null,
  });

  useEffect(() => {
    ref.current.zoom     = zoom;
    ref.current.panX     = panX;
    ref.current.panY     = panY;
    ref.current.selId    = selId;
    ref.current.elements = elements;
  });

  const boardPt = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { zoom, panX, panY } = ref.current;
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top  - panY) / zoom,
    };
  }, [canvasRef]);

  const onElPointerDown = useCallback((e: React.PointerEvent<HTMLElement>, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelId(id);
    const el = ref.current.elements.find((el) => el.id === id);
    if (!el) return;
    const bp = boardPt(e.clientX, e.clientY);
    ref.current.preElements = beginGesture();
    ref.current.dragging  = id;
    ref.current.dragOX    = bp.x - el.x;
    ref.current.dragOY    = bp.y - el.y;
    ref.current.dragOrigX = el.x;
    ref.current.dragOrigY = el.y;
    // line/arrow: also track second endpoint for co-move
    if (el.type === 'shape' && (el.shape === 'line' || el.shape === 'arrow')) {
      ref.current.dragX2 = el.x2 ?? null;
      ref.current.dragY2 = el.y2 ?? null;
    } else {
      ref.current.dragX2 = null;
      ref.current.dragY2 = null;
    }
  }, [setSelId, boardPt]);

  const onRotatePointerDown = useCallback((
    e: React.PointerEvent<HTMLElement>,
    id: string,
    nodeRef: React.RefObject<HTMLElement | null>,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodeRef?.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const el   = ref.current.elements.find((el) => el.id === id);
    ref.current.preElements    = beginGesture();
    ref.current.rotating       = id;
    ref.current.rotCX          = rect.left + rect.width  / 2;
    ref.current.rotCY          = rect.top  + rect.height / 2;
    ref.current.rotStartAngle  = Math.atan2(e.clientY - ref.current.rotCY, e.clientX - ref.current.rotCX) * 180 / Math.PI;
    ref.current.rotStartRot    = el?.rotation ?? 0;
  }, []);

  const onResizePointerDown = useCallback((
    e: React.PointerEvent<HTMLElement>,
    id: string,
    handle: ResizeHandle,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const el = ref.current.elements.find((el) => el.id === id);
    if (!el) return;
    const bp = boardPt(e.clientX, e.clientY);
    ref.current.preElements    = beginGesture();
    ref.current.resizing       = id;
    ref.current.resizeHandle   = handle;
    ref.current.resizeStartX   = bp.x;
    ref.current.resizeStartY   = bp.y;
    ref.current.resizeStartW   = el.w;
    ref.current.resizeStartH   = el.h;
    ref.current.resizeElX      = el.x;
    ref.current.resizeElY      = el.y;
  }, [boardPt]);

  useEffect(() => {
    function onMouseMove(e: PointerEvent) {
      const r = ref.current;

      if (r.dragging) {
        const bp   = boardPt(e.clientX, e.clientY);
        const newX = bp.x - r.dragOX;
        const newY = bp.y - r.dragOY;
        if (r.dragX2 !== null && r.dragY2 !== null) {
          const dx = newX - r.dragOrigX;
          const dy = newY - r.dragOrigY;
          updateEl(r.dragging, {
            x: newX, y: newY,
            x2: r.dragX2 + dx,
            y2: r.dragY2 + dy,
          } as Parameters<typeof updateEl>[1]);
        } else {
          updateEl(r.dragging, { x: newX, y: newY });
        }
        return;
      }

      if (r.rotating) {
        const angle = Math.atan2(e.clientY - r.rotCY, e.clientX - r.rotCX) * 180 / Math.PI;
        let rot = r.rotStartRot + (angle - r.rotStartAngle);
        [0, 90, 180, 270, 360, -90, -180, -270].forEach((snap) => {
          if (Math.abs(rot - snap) < 5) rot = snap;
        });
        updateEl(r.rotating, { rotation: rot });
        return;
      }

      if (r.resizing) {
        const bp = boardPt(e.clientX, e.clientY);

        // line / arrow endpoint drag
        if (r.resizeHandle === 'p1') {
          updateEl(r.resizing, { x: bp.x, y: bp.y } as Parameters<typeof updateEl>[1]);
          return;
        }
        if (r.resizeHandle === 'p2') {
          updateEl(r.resizing, { x2: bp.x, y2: bp.y } as Parameters<typeof updateEl>[1]);
          return;
        }

        const dx = bp.x - r.resizeStartX;
        const dy = bp.y - r.resizeStartY;
        let { x, y, w, h } = { x: r.resizeElX, y: r.resizeElY, w: r.resizeStartW, h: r.resizeStartH };
        const MIN = 40;
        switch (r.resizeHandle) {
          case 'se': w = Math.max(MIN, r.resizeStartW + dx); h = Math.max(MIN, r.resizeStartH + dy); break;
          case 'sw': { const nw = Math.max(MIN, r.resizeStartW - dx); x = r.resizeElX + (r.resizeStartW - nw); w = nw; h = Math.max(MIN, r.resizeStartH + dy); break; }
          case 'ne': w = Math.max(MIN, r.resizeStartW + dx); { const nh = Math.max(MIN, r.resizeStartH - dy); y = r.resizeElY + (r.resizeStartH - nh); h = nh; break; }
          case 'nw': { const nw2 = Math.max(MIN, r.resizeStartW - dx); x = r.resizeElX + (r.resizeStartW - nw2); w = nw2; const nh2 = Math.max(MIN, r.resizeStartH - dy); y = r.resizeElY + (r.resizeStartH - nh2); h = nh2; break; }
        }
        updateEl(r.resizing, { x, y, w, h });
        return;
      }
    }

    function onMouseUp() {
      const r = ref.current;
      // Close the gesture: the entire drag/resize/rotate becomes a single
      // undo entry (or none, if it was just a click with no movement).
      if (r.preElements) {
        commitGesture(r.preElements);
        r.preElements = null;
      }
      r.dragging = null;
      r.rotating = null;
      r.resizing = null;
    }

    document.addEventListener('pointermove',   onMouseMove);
    document.addEventListener('pointerup',     onMouseUp);
    document.addEventListener('pointercancel', onMouseUp);
    return () => {
      document.removeEventListener('pointermove',   onMouseMove);
      document.removeEventListener('pointerup',     onMouseUp);
      document.removeEventListener('pointercancel', onMouseUp);
    };
  }, [updateEl, boardPt]);

  const onBoardPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) deselect();
  }, [deselect]);

  return { onElPointerDown, onRotatePointerDown, onResizePointerDown, onBoardPointerDown };
}
