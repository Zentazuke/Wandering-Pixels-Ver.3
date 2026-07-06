/**
 * mood.ts — the emotional vocabulary.
 * Memory-oriented feelings, not a clinical scale. The display data (labels,
 * colours) lives in src/data/moods.ts; this file is the type contract.
 */
export type MoodValue =
  | 'happy' | 'peaceful' | 'grateful' | 'nostalgic' | 'romantic' | 'inspired'
  | 'heavy' | 'lonely' | 'chaotic' | 'funny' | 'hopeful' | 'proud'
  /** predates the July 2026 mood list — kept so saved entries stay valid */
  | 'angry';

export type MoodIntensity = 'soft' | 'medium' | 'strong';
