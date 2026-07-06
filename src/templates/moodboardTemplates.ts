/**
 * moodboardTemplates.ts — data-driven memory-board layouts.
 *
 * A template is a set of positioned SLOTS on the 1400×900 board; the
 * converter (createBoardFromTemplate) fills each slot from a diary entry —
 * photo, words, date, mood, voice — and skips slots the entry can't fill.
 * Three templates that work beautifully beat twenty that don't.
 */
import type { WorkspaceMode } from '../types';

export type SlotKind =
  | 'mainPhoto'   // the entry's photo
  | 'title'       // field1, falling back to the long date
  | 'date'        // small long-date line
  | 'entryText'   // the written entry (trimmed)
  | 'quote'       // first sentence of the entry, as a pull-quote
  | 'meta'        // field2 · field3
  | 'mood'        // mood chip (skipped when no mood)
  | 'voice';      // spoken-memory marker (skipped when no voice note)

export interface TemplateSlot {
  slot: SlotKind;
  x: number; y: number; w: number; h: number;
  rotation?: number;
  /* photo styling */
  frame?: string;
  /* text styling */
  noteFrame?:  string;
  fontFamily?: 'Lora' | 'Playfair' | 'DM Sans';
  fontSize?:   number;
  bold?:       boolean;
  italic?:     boolean;
  align?:      'left' | 'center' | 'right';
  color?:      string;
  bg?:         string;
}

export interface MoodboardTemplate {
  id:          string;
  name:        string;
  description: string;
  /** Board background id (constants/backgrounds). */
  bg:          string;
  modes?:      WorkspaceMode[];
  layout:      TemplateSlot[];
}

export const MOODBOARD_TEMPLATES: MoodboardTemplate[] = [
  {
    id: 'daily-memory',
    name: 'Daily Memory',
    description: 'A photo beside the day’s words — the classic journal page.',
    bg: 'paper',
    layout: [
      { slot: 'mainPhoto', x: 150,  y: 200, w: 420, h: 320, rotation: -2, frame: 'polaroid' },
      { slot: 'date',      x: 650,  y: 150, w: 330, h: 46,  noteFrame: 'none', bg: 'transparent', fontFamily: 'DM Sans', fontSize: 13, color: '#8a7a5f' },
      { slot: 'title',     x: 650,  y: 200, w: 580, h: 76,  noteFrame: 'none', bg: 'transparent', fontFamily: 'Playfair', fontSize: 32, bold: true },
      { slot: 'entryText', x: 650,  y: 300, w: 580, h: 380, noteFrame: 'shadow', fontFamily: 'Lora', fontSize: 16 },
      { slot: 'mood',      x: 1060, y: 148, w: 180, h: 50,  rotation: 1.5 },
      { slot: 'meta',      x: 150,  y: 560, w: 420, h: 50,  noteFrame: 'none', bg: 'transparent', fontFamily: 'Lora', fontSize: 13, italic: true, align: 'center', color: '#7a6a50' },
    ],
  },
  {
    id: 'polaroid-wall',
    name: 'Polaroid Wall',
    description: 'The photo pinned to cork, captions taped around it.',
    bg: 'cork',
    layout: [
      { slot: 'mainPhoto', x: 160,  y: 160, w: 460, h: 360, rotation: -3, frame: 'polaroid' },
      { slot: 'title',     x: 700,  y: 130, w: 540, h: 70,  noteFrame: 'tape-top', bg: '#fff9e6', fontFamily: 'Playfair', fontSize: 26, bold: true, align: 'center' },
      { slot: 'quote',     x: 740,  y: 260, w: 440, h: 130, rotation: 1.5, noteFrame: 'torn', bg: '#fdf6e3', fontFamily: 'Lora', fontSize: 17, italic: true },
      { slot: 'entryText', x: 700,  y: 430, w: 480, h: 300, rotation: -1, noteFrame: 'tape-top', fontFamily: 'Lora', fontSize: 14 },
      { slot: 'date',      x: 240,  y: 580, w: 300, h: 44,  rotation: -2, noteFrame: 'tag', bg: '#fff', fontFamily: 'DM Sans', fontSize: 12, align: 'center' },
      { slot: 'mood',      x: 1080, y: 750, w: 180, h: 50,  rotation: -2 },
    ],
  },
  {
    id: 'voice-memory',
    name: 'Voice Memory',
    description: 'Built around a spoken entry — the words you said out loud.',
    bg: 'linen',
    layout: [
      { slot: 'title',     x: 170,  y: 140, w: 900, h: 90,  noteFrame: 'none', bg: 'transparent', fontFamily: 'Playfair', fontSize: 36, bold: true },
      { slot: 'voice',     x: 170,  y: 280, w: 430, h: 100, noteFrame: 'dark-card', fontFamily: 'DM Sans', fontSize: 18, color: '#e8c877', align: 'center' },
      { slot: 'entryText', x: 170,  y: 430, w: 520, h: 300, noteFrame: 'shadow', fontFamily: 'Lora', fontSize: 15 },
      { slot: 'mainPhoto', x: 790,  y: 300, w: 420, h: 320, rotation: 2, frame: 'polaroid' },
      { slot: 'date',      x: 170,  y: 770, w: 330, h: 44,  noteFrame: 'none', bg: 'transparent', fontFamily: 'DM Sans', fontSize: 13, color: '#8a7a5f' },
      { slot: 'mood',      x: 1090, y: 140, w: 180, h: 50,  rotation: 1.5 },
    ],
  },
];
