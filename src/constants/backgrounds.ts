export interface BgOption {
  id:    string;
  label: string;
  group: string;
  style: string;
}

export const BG_OPTIONS: BgOption[] = [
  // Paper & Fabric
  { id: 'paper',     label: 'Paper',      group: 'Light',    style: 'background:#f7f2e8' },
  { id: 'linen',     label: 'Linen',      group: 'Light',    style: 'background:#f0ebe0' },
  { id: 'cream',     label: 'Cream',      group: 'Light',    style: 'background:#faf6ee' },
  { id: 'white',     label: 'White',      group: 'Light',    style: 'background:#ffffff' },
  { id: 'rose',      label: 'Rose',       group: 'Light',    style: 'background:#f5e8e8' },
  { id: 'sage',      label: 'Sage',       group: 'Light',    style: 'background:#e8ede4' },
  { id: 'lavender',  label: 'Lavender',   group: 'Light',    style: 'background:#ede8f5' },
  { id: 'peach',     label: 'Peach',      group: 'Light',    style: 'background:#f7ece4' },
  // Grids & Patterns
  { id: 'grid',      label: 'Grid',       group: 'Pattern',  style: 'background:#f7f2e8;background-image:linear-gradient(rgba(181,148,58,0.18)1px,transparent 1px),linear-gradient(90deg,rgba(181,148,58,0.18)1px,transparent 1px);background-size:30px 30px' },
  { id: 'dot',       label: 'Dots',       group: 'Pattern',  style: 'background:#f7f2e8;background-image:radial-gradient(rgba(181,148,58,0.35)1.5px,transparent 1.5px);background-size:22px 22px' },
  { id: 'crosshatch',label: 'Crosshatch', group: 'Pattern',  style: 'background:#f7f2e8;background-image:repeating-linear-gradient(45deg,rgba(181,148,58,0.1) 0,rgba(181,148,58,0.1) 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(181,148,58,0.1) 0,rgba(181,148,58,0.1) 1px,transparent 0,transparent 50%);background-size:16px 16px' },
  { id: 'lines',     label: 'Ruled',      group: 'Pattern',  style: 'background:#f7f2e8;background-image:linear-gradient(rgba(100,120,200,0.12)1px,transparent 1px);background-size:100% 28px' },
  // Dark
  { id: 'dark',      label: 'Dark',       group: 'Dark',     style: 'background:#1a1712' },
  { id: 'slate',     label: 'Slate',      group: 'Dark',     style: 'background:#0f1117' },
  { id: 'midnight',  label: 'Midnight',   group: 'Dark',     style: 'background:#0a0c18' },
  { id: 'dark-grid', label: 'Dark Grid',  group: 'Dark',     style: 'background:#1a1712;background-image:linear-gradient(rgba(181,148,58,0.09)1px,transparent 1px),linear-gradient(90deg,rgba(181,148,58,0.09)1px,transparent 1px);background-size:30px 30px' },
  { id: 'dark-dot',  label: 'Dark Dots',  group: 'Dark',     style: 'background:#1a1712;background-image:radial-gradient(rgba(181,148,58,0.18)1.5px,transparent 1.5px);background-size:22px 22px' },
  // Gradients
  { id: 'grad-warm', label: 'Warm',       group: 'Gradient', style: 'background:linear-gradient(135deg,#f7e8d4,#e8a87c)' },
  { id: 'grad-cool', label: 'Cool',       group: 'Gradient', style: 'background:linear-gradient(135deg,#e8f0f7,#7ca8d4)' },
  { id: 'grad-sage', label: 'Sage',       group: 'Gradient', style: 'background:linear-gradient(135deg,#e8f0e8,#a8c8a8)' },
  { id: 'grad-dusk', label: 'Dusk',       group: 'Gradient', style: 'background:linear-gradient(135deg,#2a1a2a,#502848)' },
  { id: 'grad-gold', label: 'Gold',       group: 'Gradient', style: 'background:linear-gradient(135deg,#1a1208,#5a3a18)' },
  { id: 'grad-mid',  label: 'Midnight',   group: 'Gradient', style: 'background:linear-gradient(135deg,#0a0c18,#0c1428)' },
  { id: 'grad-ros',  label: 'Rose',       group: 'Gradient', style: 'background:linear-gradient(135deg,#fce4ec,#f48fb1)' },
  { id: 'grad-for',  label: 'Forest',     group: 'Gradient', style: 'background:linear-gradient(135deg,#0d1f10,#0a2a18)' },
  // Textures
  { id: 'cork',      label: 'Cork',       group: 'Texture',  style: 'background:#c8a96e' },
  { id: 'kraft',     label: 'Kraft',      group: 'Texture',  style: 'background:#b5834a' },
  { id: 'blueprint', label: 'Blueprint',  group: 'Texture',  style: 'background:#0d2a4a' },
];
