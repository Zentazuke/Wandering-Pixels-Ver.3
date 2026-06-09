import { useState } from 'react';
import styles from './PropSection.module.css';

/** Collapsible accordion section used throughout the props panel. */
export default function PropSection({
  title, children, defaultOpen = false,
}: {
  title:        string;
  children?:    React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button
        className={`${styles.header} ${open ? styles.open : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className={styles.chevron}>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}
