import { BG_OPTIONS } from '../constants/backgrounds.js';
import { FRAMES, resolveFrameKey } from '../constants/frames.js';
import { NOTE_FRAME_BG_OVERRIDES } from '../constants/noteFrames.js';
import { BOARD_W, BOARD_H } from '../constants/board.js';
import { buildFilter } from '../store/boardStore.js';
import type { BoardElement } from '../types';

function colorizeSvg(svg: string, color: string): string {
  return svg
    .replace(/fill="(?!none)[^"]*"/g,   `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);
}

function parsePt(pt: string): { t: number; r: number; b: number; l: number } {
  if (!pt || pt === '0px') return { t:0, r:0, b:0, l:0 };
  const vals = pt.trim().split(/\s+/).map((v) => parseInt(v) || 0);
  if (vals.length === 1) return { t:vals[0], r:vals[0], b:vals[0], l:vals[0] };
  if (vals.length === 2) return { t:vals[0], r:vals[1], b:vals[0], l:vals[1] };
  if (vals.length === 3) return { t:vals[0], r:vals[1], b:vals[2], l:vals[1] };
  return { t:vals[0], r:vals[1], b:vals[2], l:vals[3] };
}

/** Renders the board to a PNG download or a JPEG thumbnail data URL. */
export async function exportBoard(
  elements:      BoardElement[],
  currentBg:     string,
  customBgColor: string | null,
  customBgImage: string | null,
  returnDataUrl  = false,
): Promise<string | void> {
  const W   = returnDataUrl ? 480  : BOARD_W;
  const H   = returnDataUrl ? 300  : BOARD_H;
  const DPR = returnDataUrl ? 1    : 2;

  const canvas  = document.createElement('canvas');
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(DPR, DPR);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ── 1. Background ──────────────────────────────────────────────────────────
  if (currentBg === 'custom-image' && customBgImage) {
    await new Promise<void>((res) => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, W, H); res(); };
      img.onerror = () => res();
      img.src = customBgImage;
    });
  } else {
    const bgOpt = BG_OPTIONS.find((b) => b.id === currentBg);
    let baseColor = '#f7f2e8';
    if (currentBg === 'custom' && customBgColor) {
      baseColor = customBgColor;
    } else if (bgOpt) {
      const m = bgOpt.style.match(/background(?:-color)?:\s*(#[0-9a-fA-F]+)/);
      if (m) baseColor = m[1];
    }
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, W, H);

    if (bgOpt) {
      const s = bgOpt.style;
      if (s.includes('linear-gradient') && s.includes('1px,transparent 1px')) {
        const dark = currentBg.includes('dark');
        ctx.strokeStyle = dark ? 'rgba(181,148,58,0.09)' : 'rgba(181,148,58,0.18)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
        for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      } else if (s.includes('radial-gradient') && s.includes('1.5px,transparent')) {
        const dark = currentBg.includes('dark');
        ctx.fillStyle = dark ? 'rgba(181,148,58,0.18)' : 'rgba(181,148,58,0.35)';
        for (let x = 11; x < W; x += 22) for (let y = 11; y < H; y += 22) {
          ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (currentBg === 'lines') {
        ctx.strokeStyle = 'rgba(100,120,200,0.12)'; ctx.lineWidth = 0.5;
        for (let y = 28; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      } else if (currentBg.startsWith('grad-')) {
        const gradMap: Record<string, [string, string]> = {
          'grad-warm':['#f7e8d4','#e8a87c'], 'grad-cool':['#e8f0f7','#7ca8d4'],
          'grad-sage':['#e8f0e8','#a8c8a8'], 'grad-dusk':['#2a1a2a','#502848'],
          'grad-gold':['#1a1208','#5a3a18'], 'grad-mid': ['#0a0c18','#0c1428'],
          'grad-ros': ['#fce4ec','#f48fb1'], 'grad-for': ['#0d1f10','#0a2a18'],
        };
        const stops = gradMap[currentBg];
        if (stops) {
          const g = ctx.createLinearGradient(0, 0, W, H);
          g.addColorStop(0, stops[0]); g.addColorStop(1, stops[1]);
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
      }
    }
  }

  // ── 2. Elements ────────────────────────────────────────────────────────────
  const sorted = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  for (const el of sorted) {
    ctx.save();

    if (el.rotation) {
      const cx = el.x + el.w / 2;
      const cy = el.y + el.h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(el.rotation * Math.PI / 180);
      ctx.translate(-cx, -cy);
    }

    if (el.type === 'photo' && el.src) {
      await new Promise<void>((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const fk = resolveFrameKey(el.frame);
          const fr = FRAMES[fk] || FRAMES.polaroid;
          const isFL = fk === 'none';
          const pt = isFL ? {t:0,r:0,b:0,l:0} : parsePt(fr.pt);
          const shadow = el.shadow !== false && fk !== 'none';

          if (!isFL) {
            if (shadow) { ctx.shadowColor='rgba(0,0,0,0.25)'; ctx.shadowBlur=18; ctx.shadowOffsetX=3; ctx.shadowOffsetY=5; }
            ctx.fillStyle = el.frameColor || fr.bg || '#fff';
            ctx.fillRect(el.x, el.y, el.w + pt.l + pt.r, el.h + pt.t + pt.b);
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
          }

          const ix = el.x + pt.l, iy = el.y + pt.t;
          ctx.save();
          ctx.filter = buildFilter(el);
          ctx.beginPath(); ctx.rect(ix, iy, el.w, el.h); ctx.clip();
          if (el.flipH || el.flipV) {
            ctx.translate(ix + el.w/2, iy + el.h/2);
            ctx.scale(el.flipH ? -1 : 1, el.flipV ? -1 : 1);
            ctx.translate(-(ix + el.w/2), -(iy + el.h/2));
          }
          const sc = Math.max(el.w / img.naturalWidth, el.h / img.naturalHeight) * (el.imgZoom ?? 1);
          const sw = el.w / sc, sh = el.h / sc;
          const sx = (img.naturalWidth  - sw) * ((el.imgX ?? 50) / 100);
          const sy = (img.naturalHeight - sh) * ((el.imgY ?? 50) / 100);
          ctx.drawImage(img, sx, sy, sw, sh, ix, iy, el.w, el.h);
          ctx.restore(); ctx.filter = 'none';

          if (el.caption && fr.capColor) {
            ctx.fillStyle = el.captionColor || fr.capColor;
            ctx.font = `${el.captionItalic !== false ? 'italic ' : ''}${el.captionBold ? '600 ' : ''}${el.captionSize || 11}px ${fr.capFont || 'Georgia,serif'}`;
            ctx.textAlign = 'center';
            ctx.fillText(el.caption, el.x + (el.w + pt.l + pt.r) / 2, el.y + el.h + pt.t + pt.b - 8, el.w + pt.l + pt.r - 10);
          }
          res();
        };
        img.onerror = () => res();
        img.src = el.src;
      });
    } else if (el.type === 'text') {
      const bgFill = NOTE_FRAME_BG_OVERRIDES[el.noteFrame ?? ''] || (el.bg === 'transparent' ? null : el.bg);
      if (bgFill) {
        ctx.fillStyle = bgFill;
        ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 7; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3;
        ctx.fillRect(el.x, el.y, el.w, el.h);
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      }
      const ff = el.fontFamily === 'Playfair' ? "'Playfair Display',Georgia,serif"
               : el.fontFamily === 'DM Sans'  ? "'DM Sans',Arial,sans-serif" : 'Georgia,serif';
      ctx.fillStyle = el.color || '#3b3328';
      ctx.font = `${el.italic?'italic ':''}${el.bold?'600 ':''}${el.fontSize||15}px ${ff}`;
      ctx.textAlign = (el.align as CanvasTextAlign) || 'left';
      const lines = (el.content || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').split('\n');
      const tx = el.align === 'center' ? el.x + el.w/2 : el.align === 'right' ? el.x + el.w - 12 : el.x + 12;
      lines.forEach((line, i) => ctx.fillText(line, tx, el.y + 18 + i * (el.fontSize || 15) * 1.5, el.w - 16));
    } else if (el.type === 'sticker' && el.svg) {
      const svgContent = el.customColor ? colorizeSvg(el.svg, el.customColor) : el.svg;
      const sz = el.w * DPR;
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="0 0 24 24">${svgContent}</svg>`;
      await new Promise<void>((res) => {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = (el.opacity ?? 100) / 100;
          ctx.drawImage(img, el.x, el.y, el.w, el.h);
          ctx.globalAlpha = 1;
          ctx.restore();
          res();
        };
        img.onerror = () => res();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
      });
    }

    ctx.restore();
  }

  // ── Watermark ──────────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(120,100,70,0.18)';
  ctx.font = 'italic 11px Georgia,serif';
  ctx.textAlign = 'right';
  ctx.fillText('Wandering Pixels', W - 12, H - 8);

  if (returnDataUrl) return canvas.toDataURL('image/jpeg', 0.82);

  return new Promise<void>((res) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob!);
      const a = document.createElement('a');
      a.href = url; a.download = `wandering-pixels-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      res();
    }, 'image/png', 1.0);
  });
}
