import { useEffect } from 'react';
import useAppStore from '../store/appStore.js';
import useBoardStore from '../store/boardStore.js';

/**
 * useKeyboardShortcuts()
 * Global keyboard shortcuts for the board view.
 * Mount once inside AppShell or Board.
 */
export function useKeyboardShortcuts() {
  const selId    = useAppStore((s) => s.selId);
  const deselect = useAppStore((s) => s.deselect);

  useEffect(() => {
    function onKeyDown(e) {
      // Don't fire when typing inside an input or contenteditable
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const { selId } = useAppStore.getState();
      const { removeElement, duplicateElement, bringToFront, sendToBack } = useBoardStore.getState();
      const { undo, redo } = useBoardStore.temporal.getState();

      switch (true) {
        case (e.key === 'Delete' || e.key === 'Backspace') && !!selId:
          e.preventDefault();
          deselect();
          removeElement(selId);
          break;

        case ctrl && e.key === 'z' && !e.shiftKey:
          e.preventDefault();
          undo();
          break;

        case ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey)):
          e.preventDefault();
          redo();
          break;

        case ctrl && e.key === 'd' && !!selId:
          e.preventDefault();
          duplicateElement(selId);
          break;

        case ctrl && e.key === ']' && !!selId:
          e.preventDefault();
          bringToFront(selId);
          break;

        case ctrl && e.key === '[' && !!selId:
          e.preventDefault();
          sendToBack(selId);
          break;

        case e.key === 'Escape':
          deselect();
          break;

        default: break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deselect]);
}
