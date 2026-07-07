import { useEffect, useRef } from 'react';
import useAppStore from './store/appStore';
import { usePersistence } from './hooks/usePersistence';
import { useIsMobile } from './hooks/useIsMobile';
import MainMenu from './components/MainMenu/MainMenu';
import AppShell from './components/AppShell/AppShell';
import MobileNav from './components/MobileNav/MobileNav';
import FlashOverlay from './components/ui/FlashOverlay';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import styles from './App.module.css';

export default function App() {
  const view     = useAppStore((s) => s.view);
  const isMobile = useIsMobile();

  // Mounted here — at the level that never unmounts — so view switches can
  // never cancel a pending save or trigger a stale reload. The hook
  // subscribes to the store imperatively, so App does not re-render on
  // board changes.
  usePersistence();

  // Phones open straight into Today — an app, not a landing page. Only on
  // first boot; the More tab can still visit the menu afterwards.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (isMobile && useAppStore.getState().view === 'menu') {
      useAppStore.getState().setView('diary');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.root}>
      <ErrorBoundary label="App">
        {view === 'menu' && <MainMenu />}
        {view !== 'menu' && <AppShell />}
      </ErrorBoundary>
      {isMobile && <MobileNav />}
      <FlashOverlay />
      <Toast />
    </div>
  );
}
