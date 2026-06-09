import { useEffect, useRef } from 'react';
import useAppStore from '../../store/appStore.js';
import styles from './FlashOverlay.module.css';

/**
 * Full-screen white overlay that handles the flash transition.
 * Controlled via useFlash() hook — never render directly.
 */
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
