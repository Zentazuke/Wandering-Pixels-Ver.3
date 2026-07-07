/**
 * exportShareImage.ts — a memory rendered as a social-ready image.
 * Two sources: an entry (drawn as a designed memory card) or a captured
 * board canvas (fitted onto the format). Privacy toggles decide what the
 * image may say; everything renders locally, nothing leaves the device
 * until the user hits share.
 */
import { SHARE_FORMATS, type ShareFormat, type SharePrivacy } from '../../types/share.js';
import { moodDef } from '../../data/moods.js';
import type { DiaryEntry } from '../../types/diary.js';
import type { Companion } from '../../types/companions.js';

const PAPER = '#f7f2e8';
const INK   = '#3b3328';
const FAINT = '#8a7a5f';

function formatSize(format: ShareFormat, srcW = 1400, srcH = 900): { w: number; h: number } {
  const def = SHARE_FORMATS.find((f) => f.format === format)!;
  return def.width ? { w: def.width, h: def.height! } : { w: srcW, h: srcH };
}

function watermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(120,100,70,0.45)';
  ctx.font = `italic ${Math.round(w * 0.016)}px Georgia,serif`;
  ctx.textAlign = 'right';
  ctx.fillText('Wandering Pixels ✦', w - Math.round(w * 0.04), h - Math.round(w * 0.03));
}

/** Word-wraps text; returns the y after the last drawn line. */
function wrapText(
  ctx: CanvasRenderingContext2D, text: string,
  x: number, y: number, maxW: number, lineH: number, maxLines: number,
): number {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  let line = '';
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      lines++;
      if (lines === maxLines) {
        ctx.fillText(`${line.replace(/[,.;\s]+$/, '')}…`, x, y);
        return y + lineH;
      }
      ctx.fillText(line, x, y);
      y += lineH;
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png', 1.0));
}

/** An entry drawn as a memory card in the chosen format. */
export async function renderEntryShareImage(
  entry: DiaryEntry, format: ShareFormat, privacy: SharePrivacy, companions: Companion[] = [],
): Promise<Blob> {
  const { w, h } = formatSize(format, 1080, 1350); // 'original' falls back to 4:5 for entries
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  const m = Math.round(w * 0.08);
  let y = m;

  // ── Photo — the upper block, cover-cropped with the diary framing ──
  if (entry.photo) {
    const img = await loadImage(entry.photo);
    if (img) {
      const ph = Math.round(h * (format === 'story' ? 0.44 : 0.5));
      const scale = Math.max(w / img.naturalWidth, ph / img.naturalHeight);
      const sw = w / scale, sh = ph / scale;
      const sx = (img.naturalWidth - sw) * ((entry.photoPos?.x ?? 50) / 100);
      const sy = (img.naturalHeight - sh) * ((entry.photoPos?.y ?? 50) / 100);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, ph);
      y = ph + Math.round(h * 0.05);
    }
  } else {
    y = Math.round(h * 0.16);
  }

  // ── Date ──
  if (!privacy.hideDate) {
    ctx.fillStyle = FAINT;
    ctx.textAlign = 'left';
    ctx.font = `600 ${Math.round(w * 0.022)}px 'DM Sans',Arial,sans-serif`;
    const date = new Date(entry.date)
      .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .toUpperCase();
    ctx.fillText(date, m, y);
    y += Math.round(h * 0.045);
  }

  // ── Title ──
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.round(w * 0.055)}px 'Playfair Display',Georgia,serif`;
  y = wrapText(ctx, entry.field1 || 'A memory', m, y, w - 2 * m, Math.round(w * 0.066), 2);
  y += Math.round(h * 0.012);

  // ── Mood + companions line ──
  const md = moodDef(entry.mood);
  const withNames = privacy.hideNames ? [] :
    entry.companionIds.map((id) => companions.find((c) => c.id === id)?.name).filter(Boolean) as string[];
  const metaBits = [
    md ? `● ${md.label}` : null,
    withNames.length ? `with ${withNames.join(' & ')}` : null,
    !privacy.hideLocation && entry.field2 ? entry.field2 : null,
  ].filter(Boolean);
  if (metaBits.length) {
    ctx.font = `italic ${Math.round(w * 0.026)}px 'Lora',Georgia,serif`;
    ctx.fillStyle = md?.color ?? FAINT;
    ctx.fillText(metaBits[0]!, m, y);
    const rest = metaBits.slice(1).join('  ·  ');
    if (rest) {
      ctx.fillStyle = FAINT;
      ctx.fillText(`   ${rest}`, m + ctx.measureText(metaBits[0]!).width, y);
    }
    y += Math.round(h * 0.05);
  }

  // ── The words ──
  if (!privacy.hideText && entry.reflection.trim()) {
    ctx.fillStyle = INK;
    ctx.font = `${Math.round(w * 0.03)}px 'Lora',Georgia,serif`;
    const lineH = Math.round(w * 0.046);
    const room = Math.floor((h - Math.round(h * 0.07) - y) / lineH);
    wrapText(ctx, entry.reflection, m, y, w - 2 * m, lineH, Math.max(2, Math.min(room, 14)));
  }

  if (privacy.watermark) watermark(ctx, w, h);
  return toBlob(canvas);
}

/** A captured board canvas fitted onto the chosen format (contain, on paper). */
export async function renderBoardShareImage(
  board: HTMLCanvasElement, format: ShareFormat, privacy: Pick<SharePrivacy, 'watermark'>,
): Promise<Blob> {
  if (format === 'original') {
    const out = document.createElement('canvas');
    out.width = board.width; out.height = board.height;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(board, 0, 0);
    if (privacy.watermark) watermark(ctx, out.width, out.height);
    return toBlob(out);
  }
  const { w, h } = formatSize(format);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const margin = Math.round(w * 0.05);
  const scale = Math.min((w - 2 * margin) / board.width, (h - 2 * margin) / board.height);
  const dw = board.width * scale, dh = board.height * scale;
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.drawImage(board, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (privacy.watermark) watermark(ctx, w, h);
  return toBlob(canvas);
}
