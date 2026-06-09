import useAppStore from '../../store/appStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import styles from './MainMenu.module.css';

const MODES = [
  { id: 'default', label: '✦ Default',   sub: 'Open canvas' },
  { id: 'travel',  label: '🧭 Travel',   sub: 'Wander & document' },
  { id: 'love',    label: '❤️ Love',     sub: 'Moments & memories' },
  { id: 'family',  label: '🏡 Family',   sub: 'Keep it together' },
  { id: 'game',    label: '🎮 Game',     sub: 'Log your session' },
];

export default function MainMenu() {
  const setView = useAppStore((s) => s.setView);
  const setMode = useAppStore((s) => s.setMode);
  const flash   = useFlash();

  function enterApp(modeId) {
    flash(() => {
      setMode(modeId);
      setView('board');
    });
  }

  function openArchive() {
    flash(() => setView('archive'));
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.panel}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.logo}>✦</div>
          <h1 className={styles.title}>Wandering Pixels</h1>
          <p className={styles.subtitle}>Your visual journal</p>
        </div>

        <div className={styles.divider} />

        {/* ── Mode cards ── */}
        <div className={styles.cards}>
          {MODES.map((m) => (
            <button key={m.id} className={styles.card} onClick={() => enterApp(m.id)}>
              <span className={styles.cardLabel}>{m.label}</span>
              <span className={styles.cardSub}>{m.sub}</span>
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        {/* ── Archive ── */}
        <button className={styles.archiveBtn} onClick={openArchive}>
          📚 Open Archive
        </button>
      </div>
    </div>
  );
}
