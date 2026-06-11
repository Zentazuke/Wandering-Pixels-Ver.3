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
          <svg className={styles.logoMark} viewBox="0 0 100 80" aria-hidden="true">
            <path d="M50,70 C35,65 20,68 10,72 L10,22 C20,18 35,15 50,20 Z"
              fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M50,70 C65,65 80,68 90,72 L90,22 C80,18 65,15 50,20 Z"
              fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M70,28 L72.8,37.2 L82,40 L72.8,42.8 L70,52 L67.2,42.8 L58,40 L67.2,37.2 Z"
              fill="currentColor" />
            <path d="M81,20 L82.2,23.8 L86,25 L82.2,26.2 L81,30 L79.8,26.2 L76,25 L79.8,23.8 Z"
              fill="currentColor" opacity="0.65" />
          </svg>
          <h1 className={styles.title}>wandering pixels</h1>
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
