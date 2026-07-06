import { Mic } from 'lucide-react';
import { moodDef } from '../../data/moods.js';
import { COMPANION_ICON } from '../../data/companionIcons.js';
import type { DiaryEntry } from '../../types/diary.js';
import type { Companion } from '../../types/companions.js';
import styles from './JournalReader.module.css';

interface Props {
  entries:    DiaryEntry[];  // newest first
  companions: Companion[];
  /** Open an entry in the MemoryViewer — list + index so ←/→ walks the journal. */
  onOpen: (list: DiaryEntry[], index: number) => void;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function topCounts(items: string[], n = 2): string[] {
  const counts = new Map<string, number>();
  items.forEach((i) => counts.set(i, (counts.get(i) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

/** The archive read as a journal — month chapters, then the pages themselves. */
export default function JournalReader({ entries, companions, onOpen }: Props) {
  const name = (id: string) => companions.find((c) => c.id === id);

  // group by YYYY-MM, preserving newest-first order
  const groups: { key: string; items: { entry: DiaryEntry; index: number }[] }[] = [];
  entries.forEach((entry, index) => {
    const key = entry.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push({ entry, index });
    else groups.push({ key, items: [{ entry, index }] });
  });

  if (entries.length === 0) {
    return <div className={styles.empty}>Nothing written yet — the journal is waiting.</div>;
  }

  return (
    <div className={styles.reader}>
      {groups.map(({ key, items }) => {
        const list = items.map((i) => i.entry);
        const photos = list.filter((e) => e.photo).length;
        const voices = list.reduce((n, e) => n + e.voiceNotes.length, 0);
        const moods = topCounts(list.map((e) => e.mood).filter(Boolean) as string[])
          .map((m) => moodDef(m as DiaryEntry['mood'])?.label ?? m);
        const people = topCounts(list.flatMap((e) => e.companionIds))
          .map((id) => name(id)?.name).filter(Boolean) as string[];
        const boards = list.reduce((n, e) => n + e.linkedBoardIds.length, 0);

        const stats = [
          `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`,
          photos > 0 && `${photos} photo${photos === 1 ? '' : 's'}`,
          voices > 0 && `${voices} voice note${voices === 1 ? '' : 's'}`,
          moods.length > 0 && `mostly ${moods.join(' & ').toLowerCase()}`,
          people.length > 0 && `often with ${people.join(' & ')}`,
          boards > 0 && `${boards} board${boards === 1 ? '' : 's'} made`,
        ].filter(Boolean).join(' · ');

        return (
          <section key={key} className={styles.chapter}>
            {/* ── Month chapter head ── */}
            <header className={styles.chapterHead}>
              <h3 className={styles.month}>{monthLabel(key)}</h3>
              <p className={styles.stats}>{stats}</p>
            </header>

            {/* ── The pages ── */}
            {items.map(({ entry, index }) => {
              const md = moodDef(entry.mood);
              return (
                <article key={entry.id} className={styles.page} onClick={() => onOpen(entries, index)}>
                  <div className={styles.pageBody}>
                    <div className={styles.pageDate}>{dayLabel(entry.date)}</div>
                    {entry.field1 && <h4 className={styles.pageTitle}>{entry.field1}</h4>}
                    <div className={styles.pageMeta}>
                      {md && <span style={{ color: md.color }}>● {md.label}</span>}
                      {entry.companionIds.map((id) => {
                        const c = name(id);
                        return c ? <span key={id}>{COMPANION_ICON[c.type]} {c.name}</span> : null;
                      })}
                      {entry.voiceNotes.length > 0 && <span className={styles.voiceBadge}><Mic size={10} /> {entry.voiceNotes.length}</span>}
                      {entry.linkedBoardIds.length > 0 && <span>◫ {entry.linkedBoardIds.length} board{entry.linkedBoardIds.length === 1 ? '' : 's'}</span>}
                    </div>
                    {entry.reflection && <p className={styles.pageText}>{entry.reflection}</p>}
                  </div>
                  {entry.photo && (
                    <img
                      className={styles.pagePhoto}
                      src={entry.photo}
                      alt={entry.field1 || 'Memory'}
                      style={entry.photoPos ? { objectPosition: `${entry.photoPos.x}% ${entry.photoPos.y}%` } : undefined}
                    />
                  )}
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
