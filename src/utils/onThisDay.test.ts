import { describe, it, expect } from 'vitest';
import { findOnThisDay } from './onThisDay';
import type { DiaryEntry } from '../components/Archive/ArchiveView';

const entry = (id: string, iso: string): DiaryEntry => ({
  id, date: iso, mode: 'default',
  field1: '', field2: '', field3: '', reflection: '',
});

// A fixed "today": 4 July 2026 (local time)
const TODAY = new Date(2026, 6, 4, 12, 0, 0);

describe('findOnThisDay', () => {
  it('finds an entry from exactly a year ago', () => {
    const m = findOnThisDay([entry('a', new Date(2025, 6, 4).toISOString())], TODAY);
    expect(m).toHaveLength(1);
    expect(m[0].label).toBe('A year ago today');
  });

  it('finds an entry from two years ago with a plural label', () => {
    const m = findOnThisDay([entry('a', new Date(2024, 6, 4).toISOString())], TODAY);
    expect(m[0].label).toBe('2 years ago today');
  });

  it('finds one month and six months ago', () => {
    const m = findOnThisDay([
      entry('m1', new Date(2026, 5, 4).toISOString()),
      entry('m6', new Date(2026, 0, 4).toISOString()),
    ], TODAY);
    expect(m.map((x) => x.label).sort()).toEqual(['A month ago today', 'Six months ago today']);
  });

  it('excludes today, the future, and non-anniversary distances', () => {
    const m = findOnThisDay([
      entry('today',    new Date(2026, 6, 4).toISOString()),
      entry('future',   new Date(2027, 6, 4).toISOString()),
      entry('2months',  new Date(2026, 4, 4).toISOString()),
      entry('otherDay', new Date(2025, 6, 3).toISOString()),
    ], TODAY);
    expect(m).toHaveLength(0);
  });

  it('skips invalid dates and sorts newest first', () => {
    const m = findOnThisDay([
      entry('bad', 'not-a-date'),
      entry('old', new Date(2024, 6, 4).toISOString()),
      entry('new', new Date(2025, 6, 4).toISOString()),
    ], TODAY);
    expect(m.map((x) => x.entry.id)).toEqual(['new', 'old']);
  });
});
