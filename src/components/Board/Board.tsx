import { useRef, useEffect, useMemo } from 'react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { useZoom } from '../../hooks/useZoom.js';
import { useBoardInteraction } from '../../hooks/useBoardInteraction.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import { usePersistence } from '../../hooks/usePersistence.js';
import { BG_OPTIONS } from '../../constants/backgrounds.js';
import { BOARD_W, BOARD_H } from '../../constants/board.js';
import PhotoElement   from './elements/PhotoElement.jsx';
import TextElement    from './elements/TextElement.jsx';
import StickerElement from './elements/StickerElement.jsx';
import ShapeElement   from './elements/ShapeElement.jsx';
import styles from './Board.module.css';

function bgToStyle(
  currentBg:     string,
  customBgColor: string | null,
  customBgImage: string | null,
): React.CSSProperties {
  if (currentBg === 'custom-image' && customBgImage) {
    return { backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (currentBg === 'custom' && customBgColor) {
    return { background: customBgColor };
  }
  const opt = BG_OPTIONS.find((b) => b.id === currentBg);
  if (!opt) return { background: '#f7f2e8' };
  const result: Record<string, string> = {};
  opt.style.split(';').forEach((part) => {
    const idx = part.indexOf(':');
    if (idx < 0) return;
    const key  = part.slice(0, idx).trim();
    const val  = part.slice(idx + 1).trim();
    if (!key || !val) return;
    const camel = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camel] = val;
  });
  return result as React.CSSProperties;
}

/** The 1400×900 board canvas with zoom/pan, element rendering, and keyboard shortcuts. */
export default function Board() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const zoom  = useAppStore((s) => s.zoom);
  const panX  = useAppStore((s) => s.panX);
  const panY  = useAppStore((s) => s.panY);
  const selId = useAppStore((s) => s.selId);

  const elements      = useBoardStore((s) => s.elements);
  const currentBg     = useBoardStore((s) => s.currentBg);
  const customBgColor = useBoardStore((s) => s.customBgColor);
  const customBgImage = useBoardStore((s) => s.customBgImage);

  const { fitBoard } = useZoom(canvasRef);
  useKeyboardShortcuts();
  usePersistence();
  const { onElPointerDown, onRotatePointerDown, onResizePointerDown, onBoardPointerDown } =
    useBoardInteraction(canvasRef);

  useEffect(() => { fitBoard(); }, [fitBoard]);

  const boardBg = bgToStyle(currentBg, customBgColor, customBgImage);

  // Sort by saved zIndex so DOM paint order matches layer order.
  // Selected element always goes last so it paints on top of everything.
  const sortedElements = useMemo(() => {
    const sorted = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    const selIdx = sorted.findIndex((e) => e.id === selId);
    if (selIdx > -1) {
      const [sel] = sorted.splice(selIdx, 1);
      sorted.push(sel);
    }
    return sorted;
  }, [elements, selId]);

  return (
    <div
      ref={canvasRef}
      className={styles.canvasWrap}
      onPointerDown={onBoardPointerDown}
      data-board-canvas="1"
    >
      <div
        className={styles.board}
        style={{
          width:     BOARD_W,
          height:    BOARD_H,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          ...boardBg,
        }}
        onPointerDown={(e) => { if (e.target === e.currentTarget) onBoardPointerDown(e); }}
      >
        {sortedElements.map((el) => {
          if (el.type === 'photo')   return <PhotoElement   key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          if (el.type === 'text')    return <TextElement    key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          if (el.type === 'sticker') return <StickerElement key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          if (el.type === 'shape')   return <ShapeElement   key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          return null;
        })}
      </div>

    </div>
  );
}
