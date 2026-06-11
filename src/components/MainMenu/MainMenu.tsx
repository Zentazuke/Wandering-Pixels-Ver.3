import { Fragment } from 'react';
import useAppStore from '../../store/appStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import type { WorkspaceMode } from '../../types';
import styles from './MainMenu.module.css';

/* Themed spreads — the default canvas gets the clasp button instead */
const THEMES: { id: WorkspaceMode; label: string; sub: string }[] = [
  { id: 'travel', label: 'Travel', sub: 'Wander & document'  },
  { id: 'love',   label: 'Love',   sub: 'Moments & memories' },
  { id: 'family', label: 'Family', sub: 'Keep it together'   },
  { id: 'game',   label: 'Game',   sub: 'Log your session'   },
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
            <defs>
              {/* Top-lit metal: amber catches the light, bronze in the shadow */}
              <linearGradient id="wp-gild" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d2a13a" />
                <stop offset="100%" stopColor="#8f6316" />
              </linearGradient>
              <radialGradient id="wp-halo">
                <stop offset="0%" stopColor="#d9a441" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d9a441" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Late-arriving craft details: foil under-edge, star halo, page lines */}
            <g className={styles.detail}>
              <path d="M50,70 C35,65 20,68 10,72 L10,22 C20,18 35,15 50,20 Z" transform="translate(0,1.2)"
                fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="4" strokeLinejoin="round" />
              <path d="M50,70 C65,65 80,68 90,72 L90,22 C80,18 65,15 50,20 Z" transform="translate(0,1.2)"
                fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="70" cy="40" r="17" fill="url(#wp-halo)" />
              <path d="M18,33 C27,30 36,29 44,31" fill="none" stroke="#8f6316" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
              <path d="M18,43 C27,40 36,39 44,41" fill="none" stroke="#8f6316" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
              <path d="M18,53 C27,50 36,49 44,51" fill="none" stroke="#8f6316" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
            </g>

            {/* Book covers draw themselves in */}
            <path className={styles.bookStroke} pathLength={100}
              d="M50,70 C35,65 20,68 10,72 L10,22 C20,18 35,15 50,20 Z"
              fill="none" stroke="url(#wp-gild)" strokeWidth="4" strokeLinejoin="round" />
            <path className={styles.bookStroke} pathLength={100}
              d="M50,70 C65,65 80,68 90,72 L90,22 C80,18 65,15 50,20 Z"
              fill="none" stroke="url(#wp-gild)" strokeWidth="4" strokeLinejoin="round" />

            {/* The wandering star pops in, its echo already leaving the page */}
            <path className={styles.sparkle}
              d="M70,26 L73.2,36.8 L84,40 L73.2,43.2 L70,54 L66.8,43.2 L56,40 L66.8,36.8 Z"
              fill="url(#wp-gild)" />
            <path className={styles.sparkleEcho}
              d="M88,9 L89.2,12.8 L93,14 L89.2,15.2 L88,19 L86.8,15.2 L83,14 L86.8,12.8 Z"
              fill="url(#wp-gild)" opacity="0.6" />
          </svg>
          <h1 className={styles.title}>
            <span className={styles.initial}>W</span>andering{' '}
            <span className={styles.initial}>P</span>ixels
          </h1>
          <p className={styles.subtitle}>Your visual journal</p>
        </div>

        <div className={styles.divider} />

        {/* The clasp — one primary action, stamped like a bookplate */}
        <button className={styles.clasp} onClick={() => enterApp('default')}>
          Open Your Journal
        </button>

        {/* Themed spreads, set like a table of contents */}
        <p className={styles.chaptersLabel}>or begin a themed spread</p>
        <nav className={styles.chapters} aria-label="Themed spreads">
          {THEMES.map((m, i) => (
            <Fragment key={m.id}>
              {i > 0 && <span className={styles.dot} aria-hidden="true">·</span>}
              <button className={styles.chapter} title={m.sub} onClick={() => enterApp(m.id)}>
                {m.label}
              </button>
            </Fragment>
          ))}
        </nav>

        <div className={styles.divider} />

        <button className={styles.archiveBtn} onClick={openArchive}>
          Open Archive
        </button>
      </div>
    </div>
  );
}
