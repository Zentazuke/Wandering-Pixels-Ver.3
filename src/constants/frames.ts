/**
 * Legacy frame ids → current frame keys. Boards saved by older versions
 * may still carry these; remap on read everywhere frames are resolved.
 */
export const FRAME_REMAP: Record<string, string> = {
  dark: 'polaroid', navy: 'polaroid', sage: 'polaroid', rose: 'polaroid',
  kraft: 'vintage', black: 'thick',
  rounded: 'none', round14: 'none',
};

/** Resolve an element's stored frame id to a current FRAMES key. */
export function resolveFrameKey(frame: string | undefined): string {
  return FRAME_REMAP[frame ?? ''] || frame || 'polaroid';
}

/** Decorative border frame applied around a photo element. */
export interface Frame {
  pt:          string;
  bg:          string;
  br:          string;
  capColor:    string;
  capFont:     string;
  wrapStyle?:  string;
  overlay?:    string;
  double?:     boolean;
  shadowOnly?: boolean;
}

export const FRAMES: Record<string, Frame> = {
  none:      { pt: '0px',             bg: 'transparent', br: '0px',  capColor: '',        capFont: '' },
  polaroid:  { pt: '8px 8px 32px 8px', bg: '#ffffff',   br: '0px',  capColor: '#3b3328', capFont: "'Playfair Display',serif" },
  vintage:   { pt: '10px 10px 38px 10px', bg: '#f0e6cc', br: '1px', capColor: '#5a3e1a', capFont: 'Georgia,serif' },
  thick:     { pt: '16px',            bg: '#ffffff',    br: '0px',  capColor: '',        capFont: '' },
  thin:      { pt: '3px',             bg: '#ffffff',    br: '0px',  capColor: '',        capFont: '' },
  double:    { pt: '6px',             bg: '#ffffff',    br: '0px',  capColor: '',        capFont: '', double: true },
  shadow:    { pt: '0px',             bg: 'transparent', br: '0px', capColor: '',        capFont: '', shadowOnly: true },

  painting: {
    pt: '14px', bg: '#f5e6c0', br: '0px',
    capColor: '#3b2a0a', capFont: "'Playfair Display',serif",
    wrapStyle: 'border:6px solid #b5943a;outline:2px solid #8a6a1a;outline-offset:-2px;box-shadow:inset 0 0 0 3px #d4a830,4px 6px 22px rgba(0,0,0,0.38),0 0 0 8px #c9952a;',
  },

  burned: {
    pt: '22px', bg: 'transparent', br: '0px',
    capColor: '', capFont: '',
    wrapStyle: 'box-shadow:3px 4px 20px rgba(0,0,0,0.55);',
    overlay: '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;" preserveAspectRatio="none"><defs><filter id="burn-edge" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="0.035 0.028" numOctaves="4" seed="7" result="turb"/><feDisplacementMap in="SourceGraphic" in2="turb" scale="28" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="burn-glow" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="0.045 0.038" numOctaves="3" seed="13" result="turb2"/><feDisplacementMap in="SourceGraphic" in2="turb2" scale="18" xChannelSelector="G" yChannelSelector="R"/><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#0d0905" stroke-width="44" filter="url(#burn-edge)" opacity="0.97"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#1a0f06" stroke-width="32" filter="url(#burn-edge)" opacity="0.85"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#c45a00" stroke-width="18" filter="url(#burn-glow)" opacity="0.75"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#e87820" stroke-width="8" filter="url(#burn-glow)" opacity="0.6"/><rect x="0" y="0" width="100%" height="100%" rx="3" ry="3" fill="none" stroke="#ffd580" stroke-width="3" filter="url(#burn-glow)" opacity="0.35"/></svg>',
  },

  comic: {
    pt: '6px 6px 36px 6px', bg: '#ffffff', br: '2px',
    capColor: '#000000', capFont: "Impact,'Arial Black',sans-serif",
    wrapStyle: 'border:4px solid #111111;box-shadow:6px 6px 0 #111111;',
    overlay: '<div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(0,0,0,0.08) 1px,transparent 1px);background-size:5px 5px;pointer-events:none;border-radius:2px;mix-blend-mode:multiply;"></div>',
  },

  torn: {
    pt: '12px', bg: '#faf6ee', br: '0px',
    capColor: '', capFont: '',
    wrapStyle: 'box-shadow:2px 3px 12px rgba(0,0,0,0.22);',
    overlay: '<div style="position:absolute;inset:0;pointer-events:none;border:0px;box-shadow:inset 2px 2px 0 1px rgba(200,185,155,0.5),inset -2px -2px 0 1px rgba(200,185,155,0.5);clip-path:polygon(0% 2%,1.5% 0%,4% 1.5%,7% 0%,10% 2%,13% 0.5%,17% 2%,21% 0%,25% 1.5%,30% 0%,35% 2%,40% 0.5%,45% 2%,50% 0%,55% 1.5%,60% 0%,65% 2%,70% 0.5%,75% 1.5%,80% 0%,85% 2%,90% 0.5%,95% 1.5%,100% 0%,100% 98%,98.5% 100%,95% 98.5%,92% 100%,88% 98%,84% 100%,80% 98.5%,76% 100%,72% 98%,68% 100%,63% 98.5%,58% 100%,53% 98%,48% 100%,43% 98.5%,38% 100%,33% 98%,28% 100%,23% 98.5%,18% 100%,13% 98%,8% 100%,4% 98.5%,0% 100%);"></div>',
  },

  filmstrip: {
    pt: '22px 8px', bg: '#111111', br: '0px',
    capColor: '#cccccc', capFont: "'DM Sans',sans-serif",
    wrapStyle: 'box-shadow:3px 4px 18px rgba(0,0,0,0.55);',
    overlay: '<div style="position:absolute;top:0;left:0;right:0;height:20px;display:flex;align-items:center;justify-content:space-around;padding:0 6px;pointer-events:none;"><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span></div><div style="position:absolute;bottom:0;left:0;right:0;height:20px;display:flex;align-items:center;justify-content:space-around;padding:0 6px;pointer-events:none;"><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span><span style="display:block;width:10px;height:7px;background:#333;border-radius:1px;border:1px solid #555;"></span></div>',
  },

  stamp: {
    pt: '10px 10px 32px 10px', bg: '#ffffff', br: '0px',
    capColor: '#5a3e1a', capFont: "'Lora',serif",
    wrapStyle: 'box-shadow:2px 3px 14px rgba(0,0,0,0.3);',
    overlay: '<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 0% 0%,transparent 6px,transparent 6px),radial-gradient(circle at 50% 0%,transparent 6px,transparent 6px),radial-gradient(circle at 100% 0%,transparent 6px,transparent 6px);outline:2px dashed rgba(0,0,0,0.12);outline-offset:-5px;"></div>',
  },
};
