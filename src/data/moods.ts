/**
 * moods.ts — the emotional vocabulary of the diary.
 * Ten feelings, not a clinical scale. Each carries a colour that later
 * flavours board templates, palettes, and archive filtering.
 */
import type { MoodValue } from '../types/diary';

export interface MoodDef {
  value: MoodValue;
  label: string;
  color: string;   // ink for chips, mood markers, template accents
}

export const MOODS: MoodDef[] = [
  { value: 'happy',     label: 'Happy',     color: '#e2a33c' },
  { value: 'peaceful',  label: 'Peaceful',  color: '#7da98c' },
  { value: 'grateful',  label: 'Grateful',  color: '#c9a13b' },
  { value: 'nostalgic', label: 'Nostalgic', color: '#a98467' },
  { value: 'romantic',  label: 'Romantic',  color: '#c4708d' },
  { value: 'inspired',  label: 'Inspired',  color: '#7f68b5' },
  { value: 'heavy',     label: 'Heavy',     color: '#5d5d6e' },
  { value: 'lonely',    label: 'Lonely',    color: '#7286a3' },
  { value: 'chaotic',   label: 'Chaotic',   color: '#cf7f3e' },
  { value: 'funny',     label: 'Funny',     color: '#5fa3c7' },
  { value: 'hopeful',   label: 'Hopeful',   color: '#57a893' },
  { value: 'proud',     label: 'Proud',     color: '#8f4f75' },
];

/** 'angry' predates the July 2026 mood list — displayable on old entries,
 *  no longer offered by the picker. */
export const LEGACY_MOODS: MoodDef[] = [
  { value: 'angry', label: 'Angry', color: '#b55a5a' },
];

export function moodDef(value?: MoodValue | null): MoodDef | undefined {
  return MOODS.find((m) => m.value === value) ?? LEGACY_MOODS.find((m) => m.value === value);
}
