// ─── Board element types ──────────────────────────────────────────────────────
// Every element on the board extends BaseElement.
// Using a discriminated union on `type` so TypeScript narrows automatically:
//   if (el.type === 'photo') { el.src ... } // ✓ TypeScript knows it's PhotoElement

export interface BaseElement {
  id:        string;
  x:         number;
  y:         number;
  w:         number;
  h:         number;
  rotation:  number;
  zIndex:    number;
  locked:    boolean;
}

// ── Photo ─────────────────────────────────────────────────────────────────────
export interface PhotoElement extends BaseElement {
  type:         'photo';
  src:          string;
  thumb?:       string;

  // Frame & shape
  frame?:       string;
  shape?:       string;
  frameColor?:  string;
  shadow?:      boolean;

  // Crop & orientation
  flipH?:       boolean;
  flipV?:       boolean;
  imgZoom?:     number;   // 1 = 100%
  imgX?:        number;   // 0–100 crop position
  imgY?:        number;

  // Filters (short names match CSS filter order)
  br?:          number;   // brightness  0–200  default 100
  co?:          number;   // contrast    0–200  default 100
  sa?:          number;   // saturation  0–200  default 100
  bl?:          number;   // blur        0–20   default 0
  se?:          number;   // sepia       0–100  default 0
  hr?:          number;   // hue-rotate  0–360  default 0
  iv?:          number;   // invert      0–100  default 0
  op?:          number;   // opacity     10–100 default 100

  // Caption
  caption?:         string;
  captionSize?:     number;
  captionColor?:    string;
  captionBold?:     boolean;
  captionItalic?:   boolean;
}

// ── Text / note ───────────────────────────────────────────────────────────────
export interface TextElement extends BaseElement {
  type:         'text';
  content:      string;
  placeholder?: string;

  // Typography
  fontFamily?:  string;
  fontSize?:    number;
  bold?:        boolean;
  italic?:      boolean;
  align?:       'left' | 'center' | 'right';
  color?:       string;

  // Background & frame
  bg?:          string;
  noteFrame?:   string;
}

// ── Sticker ───────────────────────────────────────────────────────────────────
export interface StickerElement extends BaseElement {
  type:          'sticker';
  svg:           string;
  customColor?:  string;
  opacity?:      number;
}

// ── Union ─────────────────────────────────────────────────────────────────────
export type BoardElement = PhotoElement | TextElement | StickerElement;
