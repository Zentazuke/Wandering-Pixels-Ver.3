import type { ResizeHandle } from '../../../hooks/useBoardInteraction.js';
import styles from './SelectionHandles.module.css';

const HANDLES: { id: ResizeHandle; cursor: string }[] = [
  { id: 'nw', cursor: 'nwse-resize' },
  { id: 'ne', cursor: 'nesw-resize' },
  { id: 'sw', cursor: 'nesw-resize' },
  { id: 'se', cursor: 'nwse-resize' },
];

/** Rotate handle + 4 corner resize handles rendered over a selected element. */
export default function SelectionHandles({
  id, nodeRef, onRotate, onResize,
}: {
  id:       string;
  nodeRef:  React.RefObject<HTMLElement | null>;
  onRotate: (e: React.PointerEvent<HTMLElement>, id: string, nodeRef: React.RefObject<HTMLElement | null>) => void;
  onResize: (e: React.PointerEvent<HTMLElement>, id: string, handle: ResizeHandle) => void;
}) {
  return (
    <>
      <div className={styles.rotLine} />
      <div
        className={styles.rotHandle}
        onPointerDown={(e) => onRotate(e, id, nodeRef)}
        title="Rotate"
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
          stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
          <path d="M2 5A3 3 0 1 1 5 8M2 5l1-2M2 5l2 1" />
        </svg>
      </div>

      {HANDLES.map(({ id: h, cursor }) => (
        <div
          key={h}
          className={`${styles.handle} ${styles[h]}`}
          style={{ cursor }}
          onPointerDown={(e) => onResize(e, id, h)}
        />
      ))}
    </>
  );
}
