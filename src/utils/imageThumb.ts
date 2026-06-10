/**
 * makeThumb — downscale an image data URL to a small JPEG preview.
 *
 * Why: photos are stored as full-resolution base64. The props panel renders
 * a photo ~29 times at once (16 filter presets + 13 frame previews); doing
 * that with multi-MB originals makes selecting a photo feel heavy. Panels
 * render `el.thumb` instead — the original `src` is only used on the board
 * itself and in exports.
 */
export function makeThumb(src: string, maxDim = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas  = document.createElement('canvas');
      canvas.width  = Math.max(1, Math.round(img.naturalWidth  * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas 2d context unavailable')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('image failed to load'));
    img.src = src;
  });
}
