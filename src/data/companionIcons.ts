import type { CompanionType } from '../types/companions';

/** Tiny glyph per companion type — shared by picker, cards, viewer, journal. */
export const COMPANION_ICON: Record<CompanionType, string> = {
  pet: '🐾', person: '👤', other: '✦',
};
