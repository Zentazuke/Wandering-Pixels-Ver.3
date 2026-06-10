import { useEffect, useRef } from 'react';
import useAppStore from '../store/appStore.js';

/**
 * Attaches scroll-to-zoom and Space+drag / middle-mouse pan onto a canvas
 * wrapper ref. Button-style zoom actions (zoomIn/zoomOut/fitBoard) live in
 * appStore — this hook only owns the pointer/keyboard interactions.
 */
export function useZoom(canvasRef: React.RefObject<HTMLElement | null>): void {
  const zoom         = useAppStore((s) => s.zoom);
  const panX         = useAppStore((s) => s.panX);
  const panY         = useAppStore((s) => s.panY);
  const setTransform = useAppStore((s) => s.setTransform);

  const stateRef = useRef({ zoom, panX, panY });
  useEffect(() => { stateRef.current = { zoom, panX, panY }; }, [zoom, panX, panY]);

  // ── Scroll-to-zoom ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect   = el!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta  = e.deltaY < 0 ? 1.1 : 0.9;
      const { zoom, panX, panY } = stateRef.current;
      const newZoom = Math.max(0.1, Math.min(4, zoom * delta));
      setTransform(
        newZoom,
        mouseX - (mouseX - panX) * (newZoom / zoom),
        mouseY - (mouseY - panY) * (newZoom / zoom),
      );
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [canvasRef, setTransform]);

  // ── Middle-mouse / Space+drag pan ───────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let panning   = false;
    let spaceDown = false;
    let startX = 0, startY = 0, originX = 0, originY = 0;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.code === 'Space' && !target.closest('[contenteditable]') &&
          target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        spaceDown = true;
        el!.style.cursor = 'grab';
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') { spaceDown = false; el!.style.cursor = ''; }
    }
    function onMouseDown(e: MouseEvent) {
      if (e.button === 1 || (e.button === 0 && spaceDown)) {
        e.preventDefault();
        panning = true;
        startX  = e.clientX; startY  = e.clientY;
        originX = stateRef.current.panX; originY = stateRef.current.panY;
        el!.style.cursor = 'grabbing';
      }
    }
    function onMouseMove(e: MouseEvent) {
      if (!panning) return;
      setTransform(
        stateRef.current.zoom,
        originX + (e.clientX - startX),
        originY + (e.clientY - startY),
      );
    }
    function onMouseUp() {
      if (panning) { panning = false; el!.style.cursor = spaceDown ? 'grab' : ''; }
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
}
