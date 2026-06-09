import { useEffect, useCallback, useRef } from 'react';
import { BOARD_W, BOARD_H } from '../constants/board.js';
import useAppStore from '../store/appStore.js';

/**
 * useZoom(canvasRef)
 * Attaches wheel-to-zoom and middle-mouse / Space+drag pan
 * onto the canvas wrapper element.
 *
 * Also exposes fitBoard() and zoomIn/zoomOut helpers via the returned object.
 */
export function useZoom(canvasRef) {
  const { zoom, panX, panY, setTransform } = useAppStore((s) => ({
    zoom: s.zoom, panX: s.panX, panY: s.panY, setTransform: s.setTransform,
  }));

  // Keep a ref so event handlers always see latest values without re-binding
  const stateRef = useRef({ zoom, panX, panY });
  useEffect(() => { stateRef.current = { zoom, panX, panY }; }, [zoom, panX, panY]);

  // ── Fit board to viewport ────────────────────────────────────────────────────
  const fitBoard = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ww = el.clientWidth  || 900;
    const wh = el.clientHeight || 600;
    const z  = Math.min(ww / BOARD_W, wh / BOARD_H) * 0.9;
    const px = (ww - BOARD_W * z) / 2;
    const py = (wh - BOARD_H * z) / 2;
    setTransform(z, px, py);
  }, [canvasRef, setTransform]);

  const zoomIn  = useCallback(() => {
    const { zoom, panX, panY } = stateRef.current;
    const z = Math.min(zoom * 1.2, 4);
    setTransform(z, panX, panY);
  }, [setTransform]);

  const zoomOut = useCallback(() => {
    const { zoom, panX, panY } = stateRef.current;
    const z = Math.max(zoom / 1.2, 0.1);
    setTransform(z, panX, panY);
  }, [setTransform]);

  // ── Scroll-to-zoom ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    function onWheel(e) {
      e.preventDefault();
      const rect   = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta  = e.deltaY < 0 ? 1.1 : 0.9;
      const { zoom, panX, panY } = stateRef.current;
      const newZoom = Math.max(0.1, Math.min(4, zoom * delta));
      const newPanX = mouseX - (mouseX - panX) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - panY) * (newZoom / zoom);
      setTransform(newZoom, newPanX, newPanY);
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [canvasRef, setTransform]);

  // ── Middle-mouse / Space+drag pan ────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let panning     = false;
    let spaceDown   = false;
    let startX = 0, startY = 0, originX = 0, originY = 0;

    function onKeyDown(e) {
      if (e.code === 'Space' && !e.target.closest('[contenteditable]') &&
          e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        spaceDown = true;
        el.style.cursor = 'grab';
        e.preventDefault();
      }
    }
    function onKeyUp(e) {
      if (e.code === 'Space') { spaceDown = false; el.style.cursor = ''; }
    }
    function onMouseDown(e) {
      if (e.button === 1 || (e.button === 0 && spaceDown)) {
        e.preventDefault();
        panning  = true;
        startX   = e.clientX;
        startY   = e.clientY;
        originX  = stateRef.current.panX;
        originY  = stateRef.current.panY;
        el.style.cursor = 'grabbing';
      }
    }
    function onMouseMove(e) {
      if (!panning) return;
      setTransform(
        stateRef.current.zoom,
        originX + (e.clientX - startX),
        originY + (e.clientY - startY)
      );
    }
    function onMouseUp() {
      if (panning) { panning = false; el.style.cursor = spaceDown ? 'grab' : ''; }
    }

    document.addEventListener('keydown',   onKeyDown);
    document.addEventListener('keyup',     onKeyUp);
    el.addEventListener('mousedown',       onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);

    return () => {
      document.removeEventListener('keydown',   onKeyDown);
      document.removeEventListener('keyup',     onKeyUp);
      el.removeEventListener('mousedown',       onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [canvasRef, setTransform]);

  return { fitBoard, zoomIn, zoomOut };
}
