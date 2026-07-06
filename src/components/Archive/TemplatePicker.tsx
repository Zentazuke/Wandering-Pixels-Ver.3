import { useEffect } from 'react';
import { X } from 'lucide-react';
import { MOODBOARD_TEMPLATES, type MoodboardTemplate } from '../../templates/moodboardTemplates.js';
import { recommendTemplateId } from '../../templates/createBoardFromTemplate.js';
import type { DiaryEntry } from '../../types/diary.js';
import styles from './TemplatePicker.module.css';

interface Props {
  entry:   DiaryEntry;
  onClose: () => void;
  onPick:  (template: MoodboardTemplate) => void;
}

const BOARD_W = 1400;
const BOARD_H = 900;

/** Choose the layout a memory becomes — the recommended one leads. */
export default function TemplatePicker({ entry, onClose, onPick }: Props) {
  const recommended = recommendTemplateId(entry);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Recommended template first, others keep their order
  const ordered = [...MOODBOARD_TEMPLATES].sort(
    (a, b) => Number(b.id === recommended) - Number(a.id === recommended));

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Choose a template">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close"><X size={16} /></button>
        <h3 className={styles.title}>Turn this memory into a board</h3>
        <p className={styles.subtitle}>Pick a layout — the entry fills it for you.</p>

        <div className={styles.cards}>
          {ordered.map((t) => (
            <button key={t.id} className={styles.card} onClick={() => onPick(t)}>
              {t.id === recommended && <span className={styles.badge}>Recommended</span>}
              {/* schematic preview — slots drawn to scale */}
              <span className={styles.preview} aria-hidden="true">
                {t.layout.map((s, i) => (
                  <span
                    key={i}
                    className={`${styles.slot} ${s.slot === 'mainPhoto' ? styles.slotPhoto : ''} ${s.slot === 'mood' ? styles.slotMood : ''}`}
                    style={{
                      left:   `${(s.x / BOARD_W) * 100}%`,
                      top:    `${(s.y / BOARD_H) * 100}%`,
                      width:  `${(s.w / BOARD_W) * 100}%`,
                      height: `${(s.h / BOARD_H) * 100}%`,
                      transform: s.rotation ? `rotate(${s.rotation}deg)` : undefined,
                    }}
                  />
                ))}
              </span>
              <span className={styles.name}>{t.name}</span>
              <span className={styles.desc}>{t.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
