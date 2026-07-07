import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { COMPANION_ICON } from '../../data/companionIcons.js';
import { moodDef } from '../../data/moods.js';
import type { Companion } from '../../types/companions.js';
import type { DiaryEntry } from '../../types/diary.js';
import styles from './CollectionBuilder.module.css';

interface Props {
  companion: Companion;
  /** That companion's entries, any order — shown oldest first. */
  entries:   DiaryEntry[];
  onClose:   () => void;
  onCreate:  (title: string, selected: DiaryEntry[]) => void;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Confirm which memories make the timeline, name it, create the board. */
export default function CollectionBuilder({ companion, entries, onClose, onCreate }: Props) {
  const ordered = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const [title, setTitle]       = useState(`${companion.name} — Through the Years`);
  const [selected, setSelected] = useState<Set<string>>(new Set(ordered.map((e) => e.id)));

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const chosen = ordered.filter((e) => selected.has(e.id));

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Create collection">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close"><X size={16} /></button>
        <h3 className={styles.title}>{COMPANION_ICON[companion.type]} Through the Years</h3>
        <p className={styles.subtitle}>Pick the memories for {companion.name}’s timeline — oldest to newest.</p>

        <input className={styles.nameInput} value={title} onChange={(e) => setTitle(e.target.value)} />

        <div className={styles.list}>
          {ordered.map((e) => {
            const md = moodDef(e.mood);
            return (
              <label key={e.id} className={styles.row}>
                <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} />
                <span className={styles.rowDate}>{shortDate(e.date)}</span>
                <span className={styles.rowTitle}>{e.field1 || e.reflection.slice(0, 40) || '(untitled)'}</span>
                {e.photo && <span className={styles.rowBadge}>📷</span>}
                {md && <span style={{ color: md.color }}>●</span>}
              </label>
            );
          })}
        </div>

        <button
          className={styles.createBtn}
          disabled={chosen.length === 0 || !title.trim()}
          onClick={() => onCreate(title.trim(), chosen)}
        >
          ✦ Create timeline board — {chosen.length} {chosen.length === 1 ? 'memory' : 'memories'}
        </button>
      </div>
    </div>
  );
}
