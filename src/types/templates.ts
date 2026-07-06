/**
 * templates.ts — type contracts for the template systems.
 * Single-entry moodboard templates live in src/templates/moodboardTemplates.ts
 * (data) and consume these types; collection templates (timeline/scrapbook/
 * yearbook) are typed here ahead of their Phase 6 implementation.
 */
import type { WorkspaceMode } from './store';

// ── Single-entry moodboard templates ─────────────────────────────────────────
export type SlotKind =
  | 'mainPhoto'   // the entry's photo
  | 'title'       // field1, falling back to the long date
  | 'date'        // small long-date line
  | 'entryText'   // the written entry (trimmed)
  | 'quote'       // first sentence of the entry, as a pull-quote
  | 'meta'        // field2 · field3
  | 'mood'        // mood chip (skipped when no mood)
  | 'voice'       // spoken-memory marker (skipped when no voice note)
  | 'companion';  // companion name tag (skipped when none — Phase 2+)

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

// ── Collection templates (Phase 6) ───────────────────────────────────────────
export type CollectionTemplateKind = 'timeline' | 'scrapbook' | 'yearbook';

export interface CollectionTemplate {
  id:          string;
  name:        string;
  description: string;
  kind:        CollectionTemplateKind;
  bg:          string;
}
