import useAppStore from './store/appStore';
import { usePersistence } from './hooks/usePersistence';
import MainMenu from './components/MainMenu/MainMenu';
import AppShell from './components/AppShell/AppShell';
import FlashOverlay from './components/ui/FlashOverlay';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import styles from './App.module.css';

export default function App() {
  const view = useAppStore((s) => s.view);

  // Mounted here — at the level that never unmounts — so view switches can
  // never cancel a pending save or trigger a stale reload. The hook
  // subscribes to the store imperatively, so App does not re-render on
  // board changes.
  usePersistence();

  return (
    <div className={styles.root}>
      <ErrorBoundary label="App">
        {view === 'menu' && <MainMenu />}
        {view !== 'menu' && <AppShell />}
      </ErrorBoundary>
      <FlashOverlay />
      <Toast />
    </div>
  );
}
