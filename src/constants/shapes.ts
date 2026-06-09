/** Photo clip shape definition. */
export interface Shape {
  label:     string;
  br:        string;
  clipPath:  string | null;
  svgPath:   string | null;
}

export const SHAPES: Record<string, Shape> = {
  square:   { label: 'Square',   br: '0px',  clipPath: null, svgPath: null },
  rounded:  { label: 'Rounded',  br: '14px', clipPath: null, svgPath: null },
  circle:   { label: 'Circle',   br: '50%',  clipPath: null, svgPath: null },
  squircle: { label: 'Squircle', br: '28%',  clipPath: null, svgPath: null },
  diamond:  { label: 'Diamond',  br: '0px',  clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', svgPath: null },
  hexagon:  { label: 'Hexagon',  br: '0px',  clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)', svgPath: null },
  heart: {
    label: 'Heart',
    br: '0px',
    clipPath: null,
    svgPath: 'M0.5,0.25 C0.5,0.25 0.5,0.13 0.35,0.06 C0.2,-0.02 0.02,0.08 0.02,0.28 C0.02,0.48 0.18,0.64 0.5,0.92 C0.82,0.64 0.98,0.48 0.98,0.28 C0.98,0.08 0.8,-0.02 0.65,0.06 C0.5,0.13 0.5,0.25 0.5,0.25 Z',
  },
};
