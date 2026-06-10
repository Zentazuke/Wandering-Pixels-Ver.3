import { useRef, useState } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import { exportBoard } from '../../utils/exportBoard.js';
import { exportBoardDom } from '../../utils/exportBoardDom.js';
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
        ✦ <span className={styles.logoText}>Wandering Pixels</span>
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
    </header>
  );
}
