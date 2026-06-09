import { useEffect, useRef, useCallback } from 'react';
import useAppStore from '../store/appStore.js';
import useBoardStore from '../store/boardStore.js';

/**
 * useBoardInteraction(canvasRef)
 *
 * Handles element drag, resize, and rotate for the entire board.
 * Returns:
 *   onElPointerDown(e, id)  — call from each element's onPointerDown
 *   onRotatePointerDown(e, id)
 *   onResizePointerDown(e, id, handle)  — handle: 'nw'|'ne'|'sw'|'se'
 */
export function useBoardInteraction(canvasRef) {
  const selId      = useAppStore((s) => s.selId);
  const setSelId   = useAppStore((s) => s.setSelId);
  const deselect   = useAppStore((s) => s.deselect);
  const zoom       = useAppStore((s) => s.zoom);
  const panX       = useAppStore((s) => s.panX);
  const panY       = useAppStore((s) => s.panY);
  const updateEl   = useBoardStore((s) => s.updateElement);
  const elements   = useBoardStore((s) => s.elements);

  // Keep a ref so mouse-move handlers don't go stale
  const ref = useRef({
    zoom, panX, panY, selId,
    dragging: null, dragOX: 0, dragOY: 0,
    resizing: null, resizeHandle: null,
    resizeStartX: 0, resizeStartY: 0,
    resizeStartW: 0, resizeStartH: 0,
    resizeElX: 0, resizeElY: 0,
    rotating: null, rotCX: 0, rotCY: 0,
    rotStartAngle: 0, rotStartRot: 0,
    elements: [],
  });

  // Sync ref values on every render
  useEffect(() => {
    ref.current.zoom     = zoom;
    ref.current.panX     = panX;
    ref.current.panY     = panY;
    ref.current.selId    = selId;
    ref.current.elements = elements;
  });

  // ── Convert screen coords → board coords ──────────────────────────────────
  function boardPt(clientX, clientY) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { zoom, panX, panY } = ref.current;
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top  - panY) / zoom,
    };
  }

  // ── Element pointer down — start drag ─────────────────────────────────────
  const onElPointerDown = useCallback((e, id) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelId(id);
    const el = ref.current.elements.find((el) => el.id === id);
    if (!el) return;
    const bp = boardPt(e.clientX, e.clientY);
    ref.current.dragging = id;
    ref.current.dragOX   = bp.x - el.x;
    ref.current.dragOY   = bp.y - el.y;
  }, [setSelId]);

  // ── Rotate handle pointer down ─────────────────────────────────────────────
  const onRotatePointerDown = useCallback((e, id, nodeRef) => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodeRef?.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const el   = ref.current.elements.find((el) => el.id === id);
    ref.current.rotating       = id;
    ref.current.rotCX          = rect.left + rect.width  / 2;
    ref.current.rotCY          = rect.top  + rect.height / 2;
    ref.current.rotStartAngle  = Math.atan2(e.clientY - ref.current.rotCY, e.clientX - ref.current.rotCX) * 180 / Math.PI;
    ref.current.rotStartRot    = el?.rotation ?? 0;
  }, []);

  // ── Resize handle pointer down ─────────────────────────────────────────────
  const onResizePointerDown = useCallback((e, id, handle) => {
    e.stopPropagation();
    e.preventDefault();
    const el = ref.current.elements.find((el) => el.id === id);
    if (!el) return;
    const bp = boardPt(e.clientX, e.clientY);
    ref.current.resizing       = id;
    ref.current.resizeHandle   = handle;
    ref.current.resizeStartX   = bp.x;
    ref.current.resizeStartY   = bp.y;
    ref.current.resizeStartW   = el.w;
    ref.current.resizeStartH   = el.h;
    ref.current.resizeElX      = el.x;
    ref.current.resizeElY      = el.y;
  }, []);

  // ── Global mouse move / up ─────────────────────────────────────────────────
  useEffect(() => {
    function onMouseMove(e) {
      const r = ref.current;

      if (r.dragging) {
        const bp = boardPt(e.clientX, e.clientY);
        updateEl(r.dragging, {
          x: bp.x - r.dragOX,
          y: bp.y - r.dragOY,
        });
        return;
      }

      if (r.rotating) {
        const angle = Math.atan2(e.clientY - r.rotCY, e.clientX - r.rotCX) * 180 / Math.PI;
        const delta = angle - r.rotStartAngle;
        let   rot   = r.rotStartRot + delta;
        // Snap to 0/90/180/270 when within 5°
        [0, 90, 180, 270, 360, -90, -180, -270].forEach((snap) => {
          if (Math.abs(rot - snap) < 5) rot = snap;
        });
        updateEl(r.rotating, { rotation: rot });
        return;
      }

      if (r.resizing) {
        const bp = boardPt(e.clientX, e.clientY);
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
      ref.current.dragging  = null;
      ref.current.rotating  = null;
      ref.current.resizing  = null;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [updateEl]);

  // ── Click on empty board → deselect ──────────────────────────────────────
  // Use currentTarget (always the canvas wrapper the handler is attached to),
  // not target (the deepest clicked element). This correctly deselects when
  // clicking any gap between elements, not just the canvas edge.
  const onBoardPointerDown = useCallback((e) => {
    if (e.target === e.currentTarget) {
      deselect();
    }
  }, [deselect]);

  return { onElPointerDown, onRotatePointerDown, onResizePointerDown, onBoardPointerDown };
}
