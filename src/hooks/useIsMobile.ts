import { useSyncExternalStore } from 'react';

/**
 * Mobile shell detection — phones get app navigation, desktop keeps the
 * full workbench. Width-based with a coarse-pointer assist so a narrow
 * desktop window doesn't flip the shell but a real phone always does.
 */
const QUERY = '(max-width: 700px), ((pointer: coarse) and (max-width: 900px))';

function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches);
}
