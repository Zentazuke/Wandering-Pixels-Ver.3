import useAppStore from '../store/appStore.js';

/** Returns a flash(onPeak) function that fades to white, calls onPeak, then fades back. */
export function useFlash(): (onPeak: () => void) => void {
  const setFlashing = useAppStore((s) => s.setFlashing);

  return function flash(onPeak: () => void) {
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
