import useAppStore from '../../store/appStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import type { WorkspaceMode } from '../../types';
import styles from './MainMenu.module.css';

const MODES: { id: WorkspaceMode; label: string; sub: string }[] = [
  { id: 'default', label: '✦ Default',  sub: 'Open canvas'          },
  { id: 'travel',  label: '🧭 Travel',  sub: 'Wander & document'    },
  { id: 'love',    label: '❤️ Love',    sub: 'Moments & memories'   },
  { id: 'family',  label: '🏡 Family',  sub: 'Keep it together'     },
  { id: 'game',    label: '🎮 Game',    sub: 'Log your session'     },
];

/** Full-screen landing screen for selecting a workspace mode. */
export default function MainMenu() {
  const setView = useAppStore((s) => s.setView);
  const setMode = useAppStore((s) => s.setMode);
  const flash   = useFlash();

  function enterApp(modeId: WorkspaceMode) {
    flash(() => { setMode(modeId); setView('board'); });
  }

  function openArchive() {
    flash(() => setView('archive'));
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.logo}>✦</div>
          <h1 className={styles.title}>Wandering Pixels</h1>
          <p className={styles.subtitle}>Your visual journal</p>
        </div>

        <div className={styles.divider} />

        <div className={styles.cards}>
          {MODES.map((m) => (
            <button key={m.id} className={styles.card} onClick={() => enterApp(m.id)}>
              <span className={styles.cardLabel}>{m.label}</span>
              <span className={styles.cardSub}>{m.sub}</span>
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button className={styles.archiveBtn} onClick={openArchive}>
          📚 Open Archive
        </button>
      </div>
    </div>
  );
}
