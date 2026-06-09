import useAppStore from './store/appStore';
import MainMenu from './components/MainMenu/MainMenu';
import AppShell from './components/AppShell/AppShell';
import FlashOverlay from './components/ui/FlashOverlay';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import styles from './App.module.css';

export default function App() {
  const view = useAppStore((s) => s.view);

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
