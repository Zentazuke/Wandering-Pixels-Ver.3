import useAppStore from '../store/appStore.js';

/**
 * useFlash()
 * Returns a `flash(onPeak)` function.
 * Fades to white (450ms), calls onPeak() at the peak,
 * then fades back (500ms).
 *
 * Usage:
 *   const flash = useFlash();
 *   flash(() => { navigate somewhere });
 */
export function useFlash() {
  const setFlashing = useAppStore((s) => s.setFlashing);

  return function flash(onPeak) {
    setFlashing(true);
    setTimeout(() => {
      onPeak();
      // Small rAF gap so React can commit the view change before fading out
      requestAnimationFrame(() => {
        setTimeout(() => setFlashing(false), 16);
      });
    }, 460);
  };
}
