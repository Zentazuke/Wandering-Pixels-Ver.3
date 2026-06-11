/**
 * Frame archetypes + per-element customization.
 *
 * A frame is an archetype (what it IS: mat, painting, film…) plus geometry
 * the user can slide per element (width, tail, corners, double ring), stored
 * as optional fields on the photo element (frameW/frameTail/frameRadius/
 * frameDouble).
 *
 * Legacy ids (polaroid, vintage, thick, thin, double, shadow) are NOT
 * migrated — they resolve at read time to an archetype plus their historic
 * geometry via LEGACY_FRAME_DEFAULTS, so old boards render exactly as saved.
 * The moment a slider is touched, the explicit field on the element wins.
 */

/** Even older ids → ids resolvable below (kept from previous versions). */
export const FRAME_REMAP: Record<string, string> = {
  dark: 'polaroid', navy: 'polaroid', sage: 'polaroid', rose: 'polaroid',
  kraft: 'vintage', black: 'thick',
  rounded: 'none', round14: 'none',
};

/** Decorative border frame archetype. */
export interface Frame {
  label:          string;
  defaultW:       number;
  defaultTail:    number;
  defaultRadius?: number;
  /** Per-side multiplier on width (film strips are thick top/bottom only). */
  padRatio?:      { t: number; r: number; b: number; l: number };
  bg:             string;
  capColor:       string;
  capFont:        string;
  wrapStyle?:     string;
  overlay?:       string;
}

export const FRAMES: Record<string, Frame> = {
  none: { label: 'None', defaultW: 0,  defaultTail: 0,  bg: 'transparent', capColor: '', capFont: '' },

  mat:  { label: 'Mat',  defaultW: 8,  defaultTail: 24, bg: '#ffffff',
          capColor: '#3b3328', capFont: "'Playfair Display',serif" },

  painting: {
    label: 'Painting', defaultW: 14, defaultTail: 0, bg: '#f5e6c0',
    capColor: '#3b2a0a', capFont: "'Playfair Display',serif",
    wrapStyle: 'border:6px solid #b5943a;outline:2px solid #8a6a1a;outline-offset:-2px;box-shadow:inset 0 0 0 3px #d4a830,4px 6px 22px rgba(0,0,0,0.38),0 0 0 8px #c9952a;',
  },

  filmstrip: {
    label: 'Film', defaultW: 22, defaultTail: 0, padRatio: { t: 1, r: 0.36, b: 1, l: 0.36 },
    bg: '#111111', capColor: '#cccccc', capFont: "'DM Sans',sans-serif",
    wrapStyle: 'box-shadow:3px 4px 18px rgba(0,0,0,0.55);',
    overlay: '<div style="position:absolute;top:0;left:0;right:0;height:20px;display:flex;align-items:center;justify-content:space-around;padding:0 6px;pointer-events:none;"><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span></div><div style="position:absolute;bottom:0;left:0;right:0;height:20px;display:flex;align-items:center;justify-content:space-around;padding:0 6px;pointer-events:none;"><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span></div>',
  },

  torn: {
    label: 'Torn', defaultW: 12, defaultTail: 0, bg: '#faf6ee',
    capColor: '', capFont: '',
    wrapStyle: 'box-shadow:2px 3px 12px rgba(0,0,0,0.22);',
    overlay: '<div style="position:absolute;inset:0;pointer-events:none;border:0px;box-shadow:inset 2px 2px 0 1px rgba(200,185,155,0.5),inset -2px -2px 0 1px rgba(200,185,155,0.5);clip-path:polygon(0% 2%,1.5% 0%,4% 1.5%,7% 0%,10% 2%,13% 0.5%,17% 2%,21% 0%,25% 1.5%,30% 0%,35% 2%,40% 0.5%,45% 2%,50% 0%,55% 1.5%,60% 0%,65% 2%,70% 0.5%,75% 1.5%,80% 0%,85% 2%,90% 0.5%,95% 1.5%,100% 0%,100% 98%,98.5% 100%,95% 98.5%,92% 100%,88% 98%,84% 100%,80% 98.5%,76% 100%,72% 98%,68% 100%,63% 98.5%,58% 100%,53% 98%,48% 100%,43% 98.5%,38% 100%,33% 98%,28% 100%,23% 98.5%,18% 100%,13% 98%,8% 100%,4% 98.5%,0% 100%);"></div>',
  },

  burned: {
    label: 'Burned', defaultW: 22, defaultTail: 0, bg: 'transparent',
    capColor: '', capFont: '',
    wrapStyle: 'box-shadow:3px 4px 20px rgba(0,0,0,0.55);',
    overlay: '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;" preserveAspectRatio="none"><defs><filter id="burn-edge" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="0.035 0.028" numOctaves="4" seed="7" result="turb"/><feDisplacementMap in="SourceGraphic" in2="turb" scale="28" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="burn-glow" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="0.045 0.038" numOctaves="3" seed="13" result="turb2"/><feDisplacementMap in="SourceGraphic" in2="turb2" scale="18" xChannelSelector="G" yChannelSelector="R"/><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#0d0905" stroke-width="44" filter="url(#burn-edge)" opacity="0.97"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#1a0f06" stroke-width="32" filter="url(#burn-edge)" opacity="0.85"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#c45a00" stroke-width="18" filter="url(#burn-glow)" opacity="0.75"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#e87820" stroke-width="8" filter="url(#burn-glow)" opacity="0.6"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#ffd580" stroke-width="3" filter="url(#burn-glow)" opacity="0.35"/></svg>',
  },

  comic: {
    label: 'Comic', defaultW: 6, defaultTail: 30, defaultRadius: 2, bg: '#ffffff',
    capColor: '#000000', capFont: "Impact,'Arial Black',sans-serif",
    wrapStyle: 'border:4px solid #111111;box-shadow:6px 6px 0 #111111;',
    overlay: '<div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(0,0,0,0.08) 1px,transparent 1px);background-size:5px 5px;pointer-events:none;border-radius:2px;mix-blend-mode:multiply;"></div>',
  },

  stamp: {
    label: 'Stamp', defaultW: 10, defaultTail: 22, bg: '#ffffff',
    capColor: '#5a3e1a', capFont: "'Lora',serif",
    wrapStyle: 'box-shadow:2px 3px 14px rgba(0,0,0,0.3);',
    overlay: '<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 0% 0%,transparent 6px,transparent 6px),radial-gradient(circle at 50% 0%,transparent 6px,transparent 6px),radial-gradient(circle at 100% 0%,transparent 6px,transparent 6px);outline:2px dashed rgba(0,0,0,0.12);outline-offset:-5px;"></div>',
  },
};

/**
 * Historic geometry for retired frame ids. capColor:'' on thick/thin/double
 * matches the old behaviour where those frames never rendered captions.
 */
const LEGACY_FRAME_DEFAULTS: Record<string, {
  key: string; w?: number; tail?: number; radius?: number; double?: boolean;
  bg?: string; capColor?: string; capFont?: string; shadowOnly?: boolean;
}> = {
  polaroid: { key: 'mat', w: 8,  tail: 24 },
  vintage:  { key: 'mat', w: 10, tail: 28, radius: 1, bg: '#f0e6cc',
              capColor: '#5a3e1a', capFont: 'Georgia,serif' },
  thick:    { key: 'mat', w: 16, tail: 0, capColor: '' },
  thin:     { key: 'mat', w: 3,  tail: 0, capColor: '' },
  double:   { key: 'mat', w: 6,  tail: 0, double: true, capColor: '' },
  shadow:   { key: 'none', shadowOnly: true },
};

/** Everything a renderer needs, with element overrides and legacy defaults applied. */
export interface ResolvedFrame {
  key:        string;
  fr:         Frame;
  w:          number;
  tail:       number;
  radius:     number;
  double:     boolean;
  bg:         string;
  capColor:   string;
  capFont:    string;
  shadowOnly: boolean;
  pad:        { t: number; r: number; b: number; l: number };
}

interface FrameFields {
  frame?:       string;
  frameW?:      number;
  frameTail?:   number;
  frameRadius?: number;
  frameDouble?: boolean;
}

export function resolveFrame(el: FrameFields): ResolvedFrame {
  const raw    = FRAME_REMAP[el.frame ?? ''] || el.frame || 'polaroid';
  const legacy = LEGACY_FRAME_DEFAULTS[raw];
  const key    = legacy ? legacy.key : (FRAMES[raw] ? raw : 'mat');
  const fr     = FRAMES[key];

  const w      = el.frameW      ?? legacy?.w      ?? fr.defaultW;
  const tail   = el.frameTail   ?? legacy?.tail   ?? fr.defaultTail;
  const radius = el.frameRadius ?? legacy?.radius ?? fr.defaultRadius ?? 0;
  const double = el.frameDouble ?? legacy?.double ?? false;

  const ratio = fr.padRatio ?? { t: 1, r: 1, b: 1, l: 1 };
  const pad = key === 'none'
    ? { t: 0, r: 0, b: 0, l: 0 }
    : {
        t: Math.round(w * ratio.t),
        r: Math.round(w * ratio.r),
        b: Math.round(w * ratio.b) + tail,
        l: Math.round(w * ratio.l),
      };

  return {
    key, fr, w, tail, radius, double,
    bg:         legacy?.bg       ?? fr.bg,
    capColor:   legacy?.capColor ?? fr.capColor,
    capFont:    legacy?.capFont  ?? fr.capFont,
    shadowOnly: legacy?.shadowOnly ?? false,
    pad,
  };
}
