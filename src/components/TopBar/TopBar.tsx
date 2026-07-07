import { useRef, useState } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download, Share2 } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import { exportBoard } from '../../utils/exportBoard.js';
import { exportBoardDom, captureBoardCanvas } from '../../utils/exportBoardDom.js';
import ShareComposer from '../share/ShareComposer.jsx';
import type { View } from '../../types';
import styles from './TopBar.module.css';

const VIEW_TABS: { id: View; label: string }[] = [
  { id: 'board',   label: 'Board'   },
  { id: 'diary',   label: 'Diary'   },
  { id: 'archive', label: 'Archive' },
];

/** Top navigation bar — logo, view tabs, undo/redo, zoom, export. */
export default function TopBar() {
  const view     = useAppStore((s) => s.view);
  const setView  = useAppStore((s) => s.setView);
  const zoom     = useAppStore((s) => s.zoom);
  const zoomIn   = useAppStore((s) => s.zoomIn);
  const zoomOut  = useAppStore((s) => s.zoomOut);
  const fitBoard = useAppStore((s) => s.fitBoard);
  const flash    = useFlash();

  const [exportDone, setExportDone] = useState(false);
  const [shareBoard, setShareBoard] = useState<HTMLCanvasElement | null>(null);
  const exportPulseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function pulseExport() {
    setExportDone(true);
    clearTimeout(exportPulseTimer.current);
    exportPulseTimer.current = setTimeout(() => setExportDone(false), 600);
  }

  function switchView(nextView: View) {
    if (nextView === view) return;
    flash(() => setView(nextView));
  }

  function goToMenu() {
    flash(() => setView('menu'));
  }

  return (
    <header className={styles.bar}>
      {/* ── Logo ── */}
      <button className={styles.logo} onClick={goToMenu} title="Main Menu">
        <svg className={styles.logoMark} viewBox="0 0 100 80" aria-hidden="true">
          {/* Open book — strokes follow the bar's bright gold via currentColor */}
          <path d="M50,70 C35,65 20,68 10,72 L10,22 C20,18 35,15 50,20 Z"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
          <path d="M50,70 C65,65 80,68 90,72 L90,22 C80,18 65,15 50,20 Z"
            fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
          {/* Wandering star on the right page, echo sparkle above */}
          <path d="M70,28 L72.8,37.2 L82,40 L72.8,42.8 L70,52 L67.2,42.8 L58,40 L67.2,37.2 Z"
            fill="currentColor" />
          <path d="M81,20 L82.2,23.8 L86,25 L82.2,26.2 L81,30 L79.8,26.2 L76,25 L79.8,23.8 Z"
            fill="currentColor" opacity="0.65" />
        </svg>
        <span className={styles.logoText}>Wandering Pixels</span>
      </button>

      {/* ── Center: view tabs + divider + undo/redo ── */}
      <nav className={styles.center}>
        <div className={styles.tabs}>
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${view === tab.id ? styles.tabActive : ''}`}
              onClick={() => switchView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.sep} />

        <div className={styles.historyGroup}>
          <button className={styles.barBtn} title="Undo (Ctrl+Z)"
            onClick={() => useBoardStore.temporal.getState().undo()}>
            <Undo2 size={15} />
          </button>
          <button className={styles.barBtn} title="Redo (Ctrl+Y)"
            onClick={() => useBoardStore.temporal.getState().redo()}>
            <Redo2 size={15} />
          </button>
        </div>
      </nav>

      {/* ── Right: save dot + zoom (board only) + export ── */}
      <div className={styles.actions}>
        <span className={styles.saveDot} title="Auto-saved">
          <span className={styles.dot} />
          Saved
        </span>

        {view === 'board' && (
          <div className={styles.zoomGroup}>
            <button className={styles.barBtn} title="Zoom out (-)" onClick={zoomOut}>
              <ZoomOut size={14} />
            </button>
            <span className={styles.zoomPct}>{Math.round(zoom * 100)}%</span>
            <button className={styles.barBtn} title="Zoom in (+)" onClick={zoomIn}>
              <ZoomIn size={14} />
            </button>
            <button className={styles.barBtn} title="Fit to screen" onClick={fitBoard}>
              <Maximize2 size={14} />
            </button>
          </div>
        )}

        <button
          className={styles.exportBtn}
          title="Share this board"
          onClick={async () => {
            useAppStore.getState().deselect();
            const canvas = await captureBoardCanvas();
            if (canvas) setShareBoard(canvas);
            else useAppStore.getState().showToast('Open the board view to share it', 'error');
          }}>
          <Share2 size={12} />
          Share
        </button>

        <button
          className={`${styles.exportBtn} ${exportDone ? styles.exportDone : ''}`}
          title="Export PNG"
          onClick={async () => {
          useAppStore.getState().deselect();
          try {
            // DOM-snapshot export: photographs the live board, so every
            // frame/shape/filter exports exactly as rendered.
            const ok = await exportBoardDom();
            if (ok) { pulseExport(); return; }
          } catch {
            // fall through to the canvas renderer
          }
          // Fallback (board not mounted, or snapshot failed): canvas renderer.
          const { elements, currentBg, customBgColor, customBgImage } = useBoardStore.getState();
          exportBoard(elements, currentBg, customBgColor, customBgImage, false);
          pulseExport();
        }}>
          <Download size={12} />
          Export
        </button>
      </div>

      {shareBoard && <ShareComposer board={shareBoard} onClose={() => setShareBoard(null)} />}
    </header>
  );
}
