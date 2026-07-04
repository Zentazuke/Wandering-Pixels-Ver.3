/**
 * onThisDay.ts — resurface past entries on their anniversary.
 * A year (or years) ago today, six months ago, or a month ago — the small
 * ritual that makes a diary worth keeping.
 */
import type { DiaryEntry } from '../components/Archive/ArchiveView.jsx';

export interface Memory {
  entry: DiaryEntry;
  label: string;
}

/** Entries whose date matches today's day-of-month at a meaningful distance:
 *  N whole years, 6 months, or 1 month ago. Newest first. */
export function findOnThisDay(entries: DiaryEntry[], today = new Date()): Memory[] {
  const tm = today.getMonth();
  const td = today.getDate();
  const ty = today.getFullYear();

  const out: Memory[] = [];
  for (const e of entries) {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime()) || d.getDate() !== td) continue;

    const monthsAgo = (ty - d.getFullYear()) * 12 + (tm - d.getMonth());
    if (monthsAgo <= 0) continue; // today or the future

    if (monthsAgo % 12 === 0) {
      const years = monthsAgo / 12;
      out.push({ entry: e, label: years === 1 ? 'A year ago today' : `${years} years ago today` });
    } else if (monthsAgo === 6) {
      out.push({ entry: e, label: 'Six months ago today' });
    } else if (monthsAgo === 1) {
      out.push({ entry: e, label: 'A month ago today' });
    }
  }
  return out.sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));
}
