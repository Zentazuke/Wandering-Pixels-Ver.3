import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ImagePlus } from 'lucide-react';
import { LABELS } from '../Diary/diaryLabels.js';
import type { DiaryEntry } from './ArchiveView.jsx';
import styles from './MemoryViewer.module.css';

interface Props {
  entries:      DiaryEntry[];
  index:        number;
  onClose:      () => void;
  onNavigate:   (index: number) => void;
  onAddToBoard: (entry: DiaryEntry) => void;
  onDelete:     (entry: DiaryEntry) => void;
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Full-screen reader for a diary entry — taped memory photo beside its journal page. */
export default function MemoryViewer({ entries, index, onClose, onNavigate, onAddToBoard, onDelete }: Props) {
  const entry = entries[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft'  && index > 0)                  onNavigate(index - 1);
      if (e.key === 'ArrowRight' && index < entries.length - 1) onNavigate(index + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, entries.length, onClose, onNavigate]);

  if (!entry) return null;

  const labels     = LABELS[entry.mode] || LABELS.default;
  const reflection = (entry.reflection || '').trim();

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Diary entry">
      <button className={styles.close} onClick={onClose} aria-label="Close"><X size={18} /></button>

      {index > 0 && (
        <button className={`${styles.nav} ${styles.navLeft}`} aria-label="Previous entry"
          onClick={(e) => { e.stopPropagation(); onNavigate(index - 1); }}>
          <ChevronLeft size={22} />
        </button>
      )}
      {index < entries.length - 1 && (
        <button className={`${styles.nav} ${styles.navRight}`} aria-label="Next entry"
          onClick={(e) => { e.stopPropagation(); onNavigate(index + 1); }}>
          <ChevronRight size={22} />
        </button>
      )}

      <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
        {/* ── The memory — a taped photo print ── */}
        <figure className={styles.polaroid} key={`photo-${entry.id}`}>
          <span className={styles.tape} aria-hidden="true" />
          {entry.photo ? (
            <img className={styles.photo} src={entry.photo} alt={entry.field1 || 'Memory'} draggable={false} />
          ) : (
            <div className={styles.noPhoto}><ImagePlus size={26} /></div>
          )}
          <figcaption className={styles.polaroidCaption}>
            memory · {index + 1} of {entries.length}
          </figcaption>
        </figure>

        {/* ── The journal page ── */}
        <article className={styles.page} key={`page-${entry.id}`}>
          <span className={styles.dogEar} aria-hidden="true" />

          <header className={styles.pageHead}>
            <span className={styles.pageLabel}>Logged entry</span>
            <time className={styles.pageDate}>{longDate(entry.date)}</time>
          </header>

          <h2 className={styles.pageTitle}>{entry.field1 || 'Untitled memory'}</h2>

          <dl className={styles.fields}>
            {entry.field2 && (
              <div className={styles.fieldRow}>
                <dt>{labels.label2}</dt><dd>{entry.field2}</dd>
              </div>
            )}
            {entry.field3 && (
              <div className={styles.fieldRow}>
                <dt>{labels.label3}</dt><dd>{entry.field3}</dd>
              </div>
            )}
            <div className={styles.fieldRow}>
              <dt>Spread</dt>
              <dd><span className={styles.modeTag}>{entry.mode}</span></dd>
            </div>
          </dl>

          <div className={styles.pageDivider} aria-hidden="true">
            <span className={styles.rule} /><span className={styles.ruleDot} /><span className={styles.rule} />
          </div>

          {reflection && (
            <>
              <span className={styles.pageLabel}>Entry</span>
              <p className={styles.reflection}>
                <span className={styles.dropCap}>{reflection.charAt(0)}</span>
                {reflection.slice(1)}
              </p>
            </>
          )}

          <footer className={styles.pageFoot}>
            <span className={styles.entryCount}>entry {index + 1} of {entries.length}</span>
            <div className={styles.pageActions}>
              <button className={styles.actionBtn} onClick={() => onAddToBoard(entry)}>Add to board</button>
              <button className={`${styles.actionBtn} ${styles.release}`} onClick={() => onDelete(entry)}>Release</button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
