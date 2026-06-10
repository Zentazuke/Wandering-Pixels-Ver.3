/**
 * exportBoardDom — DOM-snapshot board export.
 *
 * Photographs the *actual rendered board DOM* via html-to-image, so the PNG
 * is structurally faithful: every frame style, clip-path shape, filter, and
 * future visual feature exports correctly without a second hand-written
 * renderer to maintain.
 *
 * Scope: requires the board to be mounted (board view only). Archive
 * thumbnails are generated in the archive view where the board DOM doesn't
 * exist, so they keep using the canvas renderer in exportBoard.ts.
 */
import { toCanvas } from 'html-to-image';
import { BOARD_W, BOARD_H } from '../constants/board.js';

/** 2× pixel density — 2800×1800 output for crisp saves on phones/retina. */
const EXPORT_SCALE = 2;

/**
 * Render the live board DOM to a canvas, neutralizing the on-screen
 * zoom/pan transform so the capture is always the full 1400×900 board.
 * Returns null when the board isn't mounted.
 */
async function captureBoard(): Promise<HTMLCanvasElement | null> {
  const node = document.querySelector<HTMLElement>('[data-board-root]');
  if (!node) return null;

  // Wait two frames so just-applied state (e.g. deselect hiding the
  // selection handles) has actually painted before we photograph the DOM.
  // In a hidden tab rAF never fires, so fall back to a short timeout there.
  await new Promise<void>((resolve) => {
    if (document.hidden) { setTimeout(resolve, 50); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  return toCanvas(node, {
    width:      BOARD_W,
    height:     BOARD_H,
    pixelRatio: EXPORT_SCALE,
    // Embed only the woff2 variant of each font face — halves the font
    // payload html-to-image has to fetch and inline per export.
    preferredFontFormat: 'woff2',
    style: {
      // The live node carries translate(pan) scale(zoom) — strip it in the
      // clone so the export isn't offset or scaled by the current viewport.
      transform: 'none',
      margin:    '0',
    },
  });
}

function drawWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(120,100,70,0.18)';
  ctx.font = `italic ${11 * EXPORT_SCALE}px Georgia,serif`;
  ctx.textAlign = 'right';
  ctx.fillText('Wandering Pixels', canvas.width - 12 * EXPORT_SCALE, canvas.height - 8 * EXPORT_SCALE);
}

/**
 * Export the mounted board as a PNG download.
 * Returns true on success, false when the board DOM isn't available
 * (caller should fall back to the canvas renderer).
 */
export async function exportBoardDom(): Promise<boolean> {
  const canvas = await captureBoard();
  if (!canvas) return false;

  drawWatermark(canvas);

  return new Promise<boolean>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wandering-pixels-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      resolve(true);
    }, 'image/png', 1.0);
  });
}

/** Spike/debug helper: capture the board and return a data URL instead of downloading. */
export async function exportBoardDomDataUrl(): Promise<string | null> {
  const canvas = await captureBoard();
  if (!canvas) return null;
  drawWatermark(canvas);
  return canvas.toDataURL('image/png');
}
