/**
 * Text-note frame styling — single source of truth.
 * Consumed by TextElement (board rendering) and exportBoard (canvas
 * thumbnail fallback). Keep the two in sync by editing only this file.
 */

/** Frame style strings (camelCase CSS, ';'-separated) keyed by noteFrame id. */
export const NOTE_FRAME_STYLES: Record<string, string> = {
  none:        '',
  shadow:      'boxShadow:3px 4px 14px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06)',
  border:      'border:2px solid rgba(0,0,0,0.18)',
  rounded:     'borderRadius:12px;boxShadow:2px 3px 10px rgba(0,0,0,0.14);border:1px solid rgba(0,0,0,0.06)',
  pill:        'borderRadius:99px;boxShadow:2px 3px 10px rgba(0,0,0,0.13);border:1px solid rgba(0,0,0,0.07);padding:10px 22px',
  dashed:      'border:2px dashed rgba(0,0,0,0.22);borderRadius:4px',
  'double-b':  'border:3px double rgba(0,0,0,0.25);borderRadius:2px',
  gold:        'border:2px solid rgba(181,148,58,0.7);boxShadow:2px 3px 10px rgba(181,148,58,0.15)',
  'gold-round':'border:2px solid rgba(181,148,58,0.7);borderRadius:10px;boxShadow:2px 3px 12px rgba(181,148,58,0.18)',
  polaroid:    'border:1px solid rgba(0,0,0,0.08);boxShadow:3px 5px 16px rgba(0,0,0,0.22);padding:12px 12px 32px',
  torn:        'border:1px solid rgba(0,0,0,0.1);boxShadow:2px 3px 8px rgba(0,0,0,0.12);borderRadius:1px 3px 2px 4px/3px 1px 4px 2px',
  stamp:       'border:4px solid white;outline:2px solid rgba(0,0,0,0.15);boxShadow:2px 3px 10px rgba(0,0,0,0.18)',
  tag:         'borderRadius:3px 3px 3px 12px;border:1px solid rgba(0,0,0,0.12);boxShadow:1px 2px 6px rgba(0,0,0,0.1)',
  speech:      'borderRadius:12px;border:2px solid rgba(0,0,0,0.14);boxShadow:2px 3px 10px rgba(0,0,0,0.12)',
  'tape-top':  'border:1px solid rgba(0,0,0,0.09);boxShadow:2px 4px 12px rgba(0,0,0,0.15);marginTop:10px',
  'neon-glow': 'border:1px solid rgba(181,148,58,0.5);boxShadow:0 0 12px rgba(181,148,58,0.35),0 0 24px rgba(181,148,58,0.15);borderRadius:4px',
  'dark-card': 'border:1px solid rgba(181,148,58,0.25);boxShadow:3px 5px 18px rgba(0,0,0,0.45);borderRadius:3px',
  crt:         'border:2px solid #3a7a3a;boxShadow:0 0 10px rgba(60,200,60,0.3),inset 0 0 20px rgba(0,0,0,0.5);borderRadius:2px',
  blueprint:   'border:1px solid #5a9fd4;boxShadow:0 0 8px rgba(90,159,212,0.25);borderRadius:1px',
  kraft:       'border:2px solid #8a5a1a;boxShadow:2px 3px 10px rgba(100,60,0,0.3);borderRadius:2px',
};

/** Frames that force their own background colour regardless of el.bg. */
export const NOTE_FRAME_BG_OVERRIDES: Record<string, string> = {
  polaroid: '#fff', 'dark-card': '#1a1712', crt: '#0a1a0a', blueprint: '#0d2a4a', kraft: '#c8913a',
};
