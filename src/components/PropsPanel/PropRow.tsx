import styles from './PropRow.module.css';

/** Label + control row used throughout the props panel. */
export function PropRow({
  label, children, wrap = false,
}: {
  label?:    string;
  children?: React.ReactNode;
  wrap?:     boolean;
}) {
  return (
    <div className={`${styles.row} ${wrap ? styles.wrap : ''}`}>
      {label && <span className={styles.label}>{label}</span>}
      {children}
    </div>
  );
}

/** Compact range slider with a live value badge. */
export function PropSlider({
  label, min, max, step = 1, value, unit = '', onChange,
}: {
  label:    string;
  min:      number;
  max:      number;
  step?:    number;
  value:    number;
  unit?:    string;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.range}
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={styles.val}>{value}{unit}</span>
    </div>
  );
}

/** Small pill button used in the props panel. */
export function PropBtn({
  children, active, danger, onClick, style, title,
}: {
  children?: React.ReactNode;
  active?:   boolean;
  danger?:   boolean;
  onClick?:  () => void;
  style?:    React.CSSProperties;
  title?:    string;
}) {
  return (
    <button
      className={`${styles.btn} ${active ? styles.btnActive : ''} ${danger ? styles.btnDanger : ''}`}
      onClick={onClick}
      style={style}
      title={title}
    >
      {children}
    </button>
  );
}
