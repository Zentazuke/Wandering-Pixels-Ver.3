/**
 * createBoardFromTemplate.ts — the magic: a diary entry poured into a layout.
 * Each slot resolves from the entry; slots the entry can't fill are skipped,
 * so the same template works for text-only, photo, and spoken memories.
 */
import { makePhotoElement, makeTextElement } from '../store/boardStore.js';
import { escapeHtml } from '../utils/sanitizeHtml.js';
import { moodDef } from '../data/moods.js';
import type { BoardElement } from '../types';
import type { DiaryEntry } from '../types/diary.js';
import type { MoodboardTemplate, TemplateSlot } from './moodboardTemplates.js';

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function firstSentence(text: string): string {
  const m = text.trim().match(/^.*?[.!?…](\s|$)/);
  return (m ? m[0] : text).trim().slice(0, 140);
}

function trimmed(text: string, max = 420): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

/** HTML for a text slot — user words escaped, newlines preserved. */
function asHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/** The written content a slot resolves to — null means "skip this slot". */
function slotText(entry: DiaryEntry, slot: TemplateSlot): string | null {
  switch (slot.slot) {
    case 'title':     return entry.field1 || longDate(entry.date);
    case 'date':      return longDate(entry.date);
    case 'entryText': return entry.reflection.trim() ? trimmed(entry.reflection) : null;
    case 'quote':     return entry.reflection.trim() ? `“${firstSentence(entry.reflection)}”` : null;
    case 'meta': {
      const meta = [entry.field2, entry.field3].filter(Boolean).join(' · ');
      return meta || null;
    }
    case 'voice': {
      const v = entry.voiceNotes[0];
      return v ? `▶  ${fmtDuration(v.durationMs)} — a spoken memory` : null;
    }
    default: return null;
  }
}

let seq = 0;
function nextId(): string {
  return `tpl-${Date.now()}-${seq++}`;
}

export function createBoardFromTemplate(entry: DiaryEntry, template: MoodboardTemplate): BoardElement[] {
  const elements: BoardElement[] = [];
  let z = 0;

  for (const slot of template.layout) {
    const base = { x: slot.x, y: slot.y, w: slot.w, h: slot.h, rotation: slot.rotation ?? 0 };

    if (slot.slot === 'mainPhoto') {
      if (!entry.photo) continue;
      elements.push({
        ...makePhotoElement(entry.photo, z++, {
          ...base,
          frame: slot.frame ?? 'polaroid',
          imgX: entry.photoPos?.x ?? 50,
          imgY: entry.photoPos?.y ?? 50,
          caption: '',
        }),
        id: nextId(),
      });
      continue;
    }

    if (slot.slot === 'mood') {
      const md = moodDef(entry.mood);
      if (!md) continue;
      elements.push({
        ...makeTextElement(z++, {
          ...base,
          content: `<b>●&nbsp;&nbsp;${escapeHtml(md.label)}${entry.moodIntensity ? ` · ${entry.moodIntensity}` : ''}</b>`,
          fontFamily: 'DM Sans', fontSize: 14, align: 'center',
          color: md.color, bg: '#ffffff', noteFrame: 'pill',
        }),
        id: nextId(),
      });
      continue;
    }

    const text = slotText(entry, slot);
    if (!text) continue;
    elements.push({
      ...makeTextElement(z++, {
        ...base,
        content: asHtml(text),
        fontFamily: slot.fontFamily ?? 'Lora',
        fontSize:   slot.fontSize ?? 15,
        bold:       slot.bold ?? false,
        italic:     slot.italic ?? false,
        align:      slot.align ?? 'left',
        ...(slot.color ? { color: slot.color } : {}),
        ...(slot.bg ? { bg: slot.bg } : {}),
        ...(slot.noteFrame ? { noteFrame: slot.noteFrame } : {}),
      }),
      id: nextId(),
    });
  }

  return elements;
}

/** Which template fits this memory best — shown as "Recommended". */
export function recommendTemplateId(entry: DiaryEntry): string {
  if (entry.voiceNotes.length > 0) return 'voice-memory';
  if (entry.photo && entry.reflection.trim().length < 200) return 'polaroid-wall';
  return 'daily-memory';
}
