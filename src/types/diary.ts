/**
 * diary.ts — the canonical diary data model.
 *
 * A memory is one record that can hold words, photos, voice, and a feeling —
 * and can point at the boards made from it. Nothing floats around separately.
 *
 * Field-name note: field1–3 / reflection / photo / photoPos predate this file
 * and live in users' IndexedDB already. Local-first apps migrate by
 * normalising on read (see normalizeEntry), not by renaming stored fields.
 */
import type { WorkspaceMode } from './store';

// ── Mood ─────────────────────────────────────────────────────────────────────
export type MoodValue =
  | 'peaceful' | 'heavy' | 'romantic' | 'chaotic' | 'grateful'
  | 'lonely' | 'inspired' | 'angry' | 'hopeful' | 'nostalgic';

export type MoodIntensity = 'soft' | 'medium' | 'strong';

// ── Voice ────────────────────────────────────────────────────────────────────
export interface VoiceNote {
  id:          string;
  /** IDB key of the audio blob (audioStorage.ts) — entries stay small. */
  assetKey:    string;
  durationMs:  number;
  mimeType:    string;
  /** Reserved for future transcription — never populated locally yet. */
  transcript?: string;
  createdAt:   number;
}

// ── Entry ────────────────────────────────────────────────────────────────────
export interface DiaryEntry {
  id:         string;
  date:       string;       // ISO
  mode:       WorkspaceMode;
  field1:     string;       // mode-aware header fields (Title/Location/…)
  field2:     string;
  field3:     string;
  reflection: string;       // the written entry (plain text)
  photo?:     string | null;
  /** How the photo was framed in its diary crop (object-position %). */
  photoPos?:  { x: number; y: number };

  voiceNotes:     VoiceNote[];
  mood?:          MoodValue;
  moodIntensity?: MoodIntensity;
  tags:           string[];
  /** Boards generated from this memory (snapshot keys). */
  linkedBoardIds: string[];
}

/** Upgrade any stored record (old app versions included) to the full shape. */
export function normalizeEntry(raw: Partial<DiaryEntry> & { id: string }): DiaryEntry {
  return {
    date: new Date(0).toISOString(),
    mode: 'default',
    field1: '', field2: '', field3: '',
    reflection: '',
    ...raw,
    voiceNotes:     Array.isArray(raw.voiceNotes)     ? raw.voiceNotes     : [],
    tags:           Array.isArray(raw.tags)           ? raw.tags           : [],
    linkedBoardIds: Array.isArray(raw.linkedBoardIds) ? raw.linkedBoardIds : [],
  };
}
