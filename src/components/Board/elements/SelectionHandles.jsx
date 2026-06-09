import styles from './SelectionHandles.module.css';

const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize' },
  { id: 'ne', cursor: 'nesw-resize' },
  { id: 'sw', cursor: 'nesw-resize' },
  { id: 'se', cursor: 'nwse-resize' },
];

/**
 * SelectionHandles
 * Renders the 4 corner resize handles + rotate handle for a selected element.
 *
 * Props:
 *   id          — element id
 *   nodeRef     — ref to the outer element DOM node (for rotate center calc)
 *   onRotate    — (e, id, nodeRef) => void
 *   onResize    — (e, id, handle) => void
 */
export default function SelectionHandles({ id, nodeRef, onRotate, onResize }) {
  return (
    <>
      {/* Rotate line + handle (above element) */}
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

      {/* 4 corner resize handles */}
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
