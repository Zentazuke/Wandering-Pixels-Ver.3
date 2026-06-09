import useAppStore from '../../store/appStore.js';
import styles from './FlashOverlay.module.css';

/** Full-screen white overlay for the flash view transition. Controlled via useFlash(). */
export default function FlashOverlay() {
  const flashing = useAppStore((s) => s.flashing);
  return (
    <div
      className={styles.overlay}
      style={{ opacity: flashing ? 1 : 0, pointerEvents: flashing ? 'all' : 'none' }}
      aria-hidden="true"
    />
  );
}
