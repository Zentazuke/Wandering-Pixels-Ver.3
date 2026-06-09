import { useRef, useEffect } from 'react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { useZoom } from '../../hooks/useZoom.js';
import { useBoardInteraction } from '../../hooks/useBoardInteraction.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import { usePersistence } from '../../hooks/usePersistence.js';
import { BG_OPTIONS } from '../../constants/backgrounds.js';
import { BOARD_W, BOARD_H } from '../../constants/board.js';
import PhotoElement from './elements/PhotoElement.jsx';
import TextElement  from './elements/TextElement.jsx';
import StickerElement from './elements/StickerElement.jsx';
import styles from './Board.module.css';

// ── Build inline style string for a background option ──────────────────────
function bgToStyle(currentBg, customBgColor, customBgImage) {
  if (currentBg === 'custom-image' && customBgImage) {
    return { backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (currentBg === 'custom' && customBgColor) {
    return { background: customBgColor };
  }
  const opt = BG_OPTIONS.find((b) => b.id === currentBg);
  if (!opt) return { background: '#f7f2e8' };
  // Parse the style string into an object
  const result = {};
  opt.style.split(';').forEach((part) => {
    const idx = part.indexOf(':');
    if (idx < 0) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key || !val) return;
    // Convert kebab-case to camelCase
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[camel] = val;
  });
  return result;
}

export default function Board() {
  const canvasRef = useRef(null);
  const boardRef  = useRef(null);

  const zoom = useAppStore((s) => s.zoom);
  const panX = useAppStore((s) => s.panX);
  const panY = useAppStore((s) => s.panY);

  const elements      = useBoardStore((s) => s.elements);
  const currentBg     = useBoardStore((s) => s.currentBg);
  const customBgColor = useBoardStore((s) => s.customBgColor);
  const customBgImage = useBoardStore((s) => s.customBgImage);

  const { fitBoard, zoomIn, zoomOut } = useZoom(canvasRef);
  useKeyboardShortcuts();
  usePersistence();
  const { onElPointerDown, onRotatePointerDown, onResizePointerDown, onBoardPointerDown } =
    useBoardInteraction(canvasRef);

  // Fit board on first mount
  useEffect(() => { fitBoard(); }, [fitBoard]);

  const boardBg = bgToStyle(currentBg, customBgColor, customBgImage);

  return (
    <div
      ref={canvasRef}
      className={styles.canvasWrap}
      onPointerDown={onBoardPointerDown}
      data-board-canvas="1"
    >
      {/* The actual 1400×900 board, transformed by zoom/pan */}
      <div
        ref={boardRef}
        className={styles.board}
        style={{
          width:     BOARD_W,
          height:    BOARD_H,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          ...boardBg,
        }}
      >
        {elements.map((el) => {
          if (el.type === 'photo')   return <PhotoElement   key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          if (el.type === 'text')    return <TextElement    key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          if (el.type === 'sticker') return <StickerElement key={el.id} el={el} onPointerDown={onElPointerDown} onRotate={onRotatePointerDown} onResize={onResizePointerDown} />;
          return null;
        })}
      </div>

      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button onClick={zoomIn}   title="Zoom in">+</button>
        <button onClick={fitBoard} title="Fit to screen">⊡</button>
        <button onClick={zoomOut}  title="Zoom out">−</button>
        <span className={styles.zoomPct}>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
