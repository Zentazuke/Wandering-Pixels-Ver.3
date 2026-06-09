import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import { exportBoard } from '../../utils/exportBoard.js';
import type { View } from '../../types';
import styles from './TopBar.module.css';

const VIEW_TABS: { id: View; label: string }[] = [
  { id: 'board',   label: 'Board'   },
  { id: 'diary',   label: 'Diary'   },
  { id: 'archive', label: 'Archive' },
];

/** Top navigation bar — logo, view tabs, undo/redo, export. */
export default function TopBar() {
  const view    = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const flash   = useFlash();

  function switchView(nextView: View) {
    if (nextView === view) return;
    flash(() => setView(nextView));
  }

  function goToMenu() {
    flash(() => setView('menu'));
  }

  return (
    <header className={styles.bar}>
      <button className={styles.logo} onClick={goToMenu} title="Main Menu">
        ✦ <span className={styles.logoText}>Wandering Pixels</span>
      </button>

      <nav className={styles.tabs}>
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${view === tab.id ? styles.tabActive : ''}`}
            onClick={() => switchView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.actions}>
        <button className={styles.actionBtn} title="Undo (Ctrl+Z)"
          onClick={() => useBoardStore.temporal.getState().undo()}>↺</button>
        <button className={styles.actionBtn} title="Redo (Ctrl+Y)"
          onClick={() => useBoardStore.temporal.getState().redo()}>↻</button>
        <button className={styles.actionBtn} title="Export PNG" onClick={() => {
          const { elements, currentBg, customBgColor, customBgImage } = useBoardStore.getState();
          useAppStore.getState().deselect();
          exportBoard(elements, currentBg, customBgColor, customBgImage, false);
        }}>
          ↓ Export
        </button>
      </div>
    </header>
  );
}
