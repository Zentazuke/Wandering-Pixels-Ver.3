import { PenLine, BookOpenText, LayoutGrid, Menu } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import { useFlash } from '../../hooks/useFlash.js';
import type { View } from '../../types';
import styles from './MobileNav.module.css';

const TABS: { view: View; label: string; Icon: typeof PenLine }[] = [
  { view: 'diary',   label: 'Today',   Icon: PenLine },
  { view: 'archive', label: 'Journal', Icon: BookOpenText },
  { view: 'board',   label: 'Boards',  Icon: LayoutGrid },
  { view: 'menu',    label: 'More',    Icon: Menu },
];

/** Bottom tab bar — the phone's way around the app, thumb-first. */
export default function MobileNav() {
  const view    = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const flash   = useFlash();

  return (
    <nav className={styles.nav} aria-label="App navigation">
      {TABS.map(({ view: v, label, Icon }) => (
        <button
          key={v}
          className={`${styles.tab} ${view === v ? styles.tabActive : ''}`}
          onClick={() => { if (view !== v) flash(() => setView(v)); }}
          aria-current={view === v ? 'page' : undefined}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
