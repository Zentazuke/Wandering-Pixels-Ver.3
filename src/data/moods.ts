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
  { value: 'peaceful',  label: 'Peaceful',  color: '#7da98c' },
  { value: 'heavy',     label: 'Heavy',     color: '#5d5d6e' },
  { value: 'romantic',  label: 'Romantic',  color: '#c4708d' },
  { value: 'chaotic',   label: 'Chaotic',   color: '#cf7f3e' },
  { value: 'grateful',  label: 'Grateful',  color: '#c9a13b' },
  { value: 'lonely',    label: 'Lonely',    color: '#7286a3' },
  { value: 'inspired',  label: 'Inspired',  color: '#7f68b5' },
  { value: 'angry',     label: 'Angry',     color: '#b55a5a' },
  { value: 'hopeful',   label: 'Hopeful',   color: '#57a893' },
  { value: 'nostalgic', label: 'Nostalgic', color: '#a98467' },
];

export function moodDef(value?: MoodValue | null): MoodDef | undefined {
  return MOODS.find((m) => m.value === value);
}
