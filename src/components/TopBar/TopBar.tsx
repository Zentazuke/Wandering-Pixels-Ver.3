import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import { exportBoard } from '../../utils/exportBoard.js';
import { BOARD_W, BOARD_H } from '../../constants/board.js';
import type { View } from '../../types';
import styles from './TopBar.module.css';

const VIEW_TABS: { id: View; label: string }[] = [
  { id: 'board',   label: 'Board'   },
  { id: 'diary',   label: 'Diary'   },
  { id: 'archive', label: 'Archive' },
];

/** Top navigation bar — logo, view tabs, undo/redo, zoom, export. */
export default function TopBar() {
  const view         = useAppStore((s) => s.view);
  const setView      = useAppStore((s) => s.setView);
  const zoom         = useAppStore((s) => s.zoom);
  const panX         = useAppStore((s) => s.panX);
  const panY         = useAppStore((s) => s.panY);
  const setTransform = useAppStore((s) => s.setTransform);
  const flash        = useFlash();

  function switchView(nextView: View) {
    if (nextView === view) return;
    flash(() => setView(nextView));
  }

  function goToMenu() {
    flash(() => setView('menu'));
  }

  function zoomIn()  { setTransform(Math.min(zoom * 1.2, 4), panX, panY); }
  function zoomOut() { setTransform(Math.max(zoom / 1.2, 0.1), panX, panY); }
  function fitBoard() {
    const el = document.querySelector('[data-board-canvas]') as HTMLElement | null;
    if (!el) return;
    const ww = el.clientWidth  || 900;
    const wh = el.clientHeight || 600;
    const z  = Math.min(ww / BOARD_W, wh / BOARD_H) * 0.9;
    setTransform(z, (ww - BOARD_W * z) / 2, (wh - BOARD_H * z) / 2);
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

        <button className={styles.exportBtn} title="Export PNG" onClick={() => {
          const { elements, currentBg, customBgColor, customBgImage } = useBoardStore.getState();
          useAppStore.getState().deselect();
          exportBoard(elements, currentBg, customBgColor, customBgImage, false);
        }}>
          <Download size={12} />
          Export
        </button>
      </div>
    </header>
  );
}
