import useAppStore from '../../store/appStore';
import styles from './Toast.module.css';

export default function Toast() {
  const toast     = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);

  if (!toast) return null;

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]}`}
      role="status"
      aria-live="polite"
      onClick={clearToast}
    >
      <span className={styles.icon}>
        {toast.type === 'success' ? '✦' : toast.type === 'error' ? '✕' : 'ℹ'}
      </span>
      {toast.message}
    </div>
  );
}
