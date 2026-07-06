import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dayKey } from '../../utils/dayKey.js';
import type { DiaryEntry } from '../../types/diary.js';
import styles from './DiaryCalendar.module.css';

interface Props {
  entries:     DiaryEntry[];
  selectedDay: string | null;            // local 'YYYY-MM-DD'
  onSelectDay: (day: string | null) => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Month grid with a dot on days that hold entries; clicking a day filters
 *  the entry list to it. A gentle "N of the last 7 days" line instead of a
 *  hard streak — missing a day shouldn't feel like breaking something. */
export default function DiaryCalendar({ entries, selectedDay, onSelectDay }: Props) {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const daysWithEntries = new Set(entries.map((e) => dayKey(new Date(e.date))));

  const startOffset  = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth  = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const todayKey     = dayKey(new Date());

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return dayKey(d);
  });
  const wroteCount = last7.filter((k) => daysWithEntries.has(k)).length;

  return (
    <div className={styles.cal}>
      <div className={styles.head}>
        <button className={styles.nav} aria-label="Previous month"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
          <ChevronLeft size={14} />
        </button>
        <span className={styles.month}>
          {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </span>
        <button className={styles.nav} aria-label="Next month"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((w, i) => <span key={`w${i}`} className={styles.weekday}>{w}</span>)}
        {Array.from({ length: startOffset }, (_, i) => <span key={`pad${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const key      = dayKey(new Date(month.getFullYear(), month.getMonth(), i + 1));
          const has      = daysWithEntries.has(key);
          const selected = selectedDay === key;
          return (
            <button
              key={key}
              className={[
                styles.day,
                has ? styles.hasEntry : '',
                selected ? styles.daySelected : '',
                key === todayKey ? styles.today : '',
              ].join(' ')}
              onClick={() => onSelectDay(selected ? null : key)}
              title={has ? 'Entries on this day' : undefined}
            >
              {i + 1}
              {has && <span className={styles.dot} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className={styles.streak}>
        {wroteCount > 0
          ? `You wrote on ${wroteCount} of the last 7 days`
          : 'No entries in the last 7 days — today is a good day'}
      </div>
    </div>
  );
}
