/**
 * createBoardFromCollection.ts — a set of memories poured onto one timeline.
 * Oldest to newest along a golden line, cards alternating above and below.
 * The timeline breathes with up to six memories; beyond that, a footnote
 * says how many more the collection holds (no silent truncation).
 */
import { makePhotoElement, makeTextElement, makeShapeElement } from '../store/boardStore.js';
import { escapeHtml } from '../utils/sanitizeHtml.js';
import type { BoardElement } from '../types';
import type { DiaryEntry } from '../types/diary.js';
import type { CollectionTemplate } from '../types/templates';

const MAX_ON_BOARD = 6;
const LINE_Y = 470;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

let seq = 0;
const nextId = () => `col-${Date.now()}-${seq++}`;

/** entries must arrive oldest-first — a timeline reads left to right.
 *  The template arg selects the layout once scrapbook/yearbook exist;
 *  today every collection renders as the timeline. */
export function createBoardFromCollection(
  title: string,
  entries: DiaryEntry[],
  template: CollectionTemplate,
): BoardElement[] {
  void template;
  const els: BoardElement[] = [];
  let z = 0;
  const picked = entries.slice(0, MAX_ON_BOARD);
  const n = picked.length;

  // ── Heading ──
  els.push({ ...makeTextElement(z++, {
    x: 100, y: 52, w: 900, h: 66, content: `<b>${escapeHtml(title)}</b>`,
    fontFamily: 'Playfair', fontSize: 34, bg: 'transparent', noteFrame: 'none',
  }), id: nextId() });
  els.push({ ...makeTextElement(z++, {
    x: 102, y: 122, w: 700, h: 34,
    content: `through the years — ${entries.length} ${entries.length === 1 ? 'memory' : 'memories'}`,
    fontFamily: 'Lora', fontSize: 15, italic: true, color: '#8a7a5f',
    bg: 'transparent', noteFrame: 'none',
  }), id: nextId() });

  // ── The line itself ──
  els.push({ ...makeShapeElement('line', z++, { x: 110, y: LINE_Y, x2: 1290, y2: LINE_Y }), id: nextId() });

  // ── Memories, alternating above/below ──
  const spacing = n > 1 ? 1060 / (n - 1) : 0;
  picked.forEach((entry, i) => {
    const cx    = n > 1 ? 170 + i * spacing : 700;
    const above = i % 2 === 0;

    // dot on the line
    const dot = { ...makeShapeElement('circle', z++, { x: cx - 8, y: LINE_Y - 8 }), id: nextId() };
    dot.w = 16; dot.h = 16; dot.fill = '#b5943a'; dot.strokeWidth = 0;
    els.push(dot);

    // date beside the dot, opposite side from the card
    els.push({ ...makeTextElement(z++, {
      x: cx - 75, y: above ? LINE_Y + 22 : LINE_Y - 56, w: 150, h: 30,
      content: shortDate(entry.date), align: 'center',
      fontFamily: 'DM Sans', fontSize: 12, color: '#7a6a50',
      bg: 'transparent', noteFrame: 'none',
    }), id: nextId() });

    // the memory card — photo when there is one, otherwise the words
    const cardY = above ? 205 : 545;
    if (entry.photo) {
      els.push({ ...makePhotoElement(entry.photo, z++, {
        x: cx - 95, y: cardY, w: 190, h: 150,
        frame: 'polaroid', rotation: above ? -2.5 : 2.5,
        imgX: entry.photoPos?.x ?? 50, imgY: entry.photoPos?.y ?? 50,
        caption: entry.field1 ? entry.field1.slice(0, 26) : '',
      }), id: nextId() });
    } else {
      const text = (entry.field1 || entry.reflection).trim().slice(0, 110);
      els.push({ ...makeTextElement(z++, {
        x: cx - 95, y: cardY + 15, w: 190, h: 135,
        content: escapeHtml(text), rotation: above ? -1.5 : 1.5,
        fontFamily: 'Lora', fontSize: 13, noteFrame: 'tape-top',
      }), id: nextId() });
    }
  });

  // ── Overflow footnote — never silently drop memories ──
  if (entries.length > MAX_ON_BOARD) {
    els.push({ ...makeTextElement(z++, {
      x: 980, y: 840, w: 320, h: 34,
      content: `…and ${entries.length - MAX_ON_BOARD} more in this collection`,
      fontFamily: 'Lora', fontSize: 13, italic: true, align: 'right',
      color: '#8a7a5f', bg: 'transparent', noteFrame: 'none',
    }), id: nextId() });
  }

  return els;
}
