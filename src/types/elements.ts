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
  // Frame geometry overrides — absent = archetype/legacy defaults apply
  frameW?:      number;   // mat width px
  frameTail?:   number;   // extra bottom depth px (polaroid tail)
  frameRadius?: number;   // corner rounding px
  frameDouble?: boolean;  // second outline ring

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

  /** Voice-memory chips: IDB audio asset this note can play in the editor.
   *  Exports stay visual — a board is a picture; the sound lives in the app. */
  audioAssetKey?: string;
}

// ── Sticker ───────────────────────────────────────────────────────────────────
export interface StickerElement extends BaseElement {
  type:          'sticker';
  svg:           string;
  customColor?:  string;
  opacity?:      number;
}

// ── Shape ─────────────────────────────────────────────────────────────────────
export interface ShapeElement extends BaseElement {
  type:         'shape';
  shape:        'rect' | 'circle' | 'line' | 'arrow';
  fill:         string;
  stroke:       string;
  strokeWidth:  number;
  fillOpacity:  number;   // 0–100
  shapeFrame?:  string;   // preset name for rect/circle
  // line / arrow — second endpoint in absolute board coordinates
  x2?:          number;
  y2?:          number;
}

// ── Union ─────────────────────────────────────────────────────────────────────
export type BoardElement = PhotoElement | TextElement | StickerElement | ShapeElement;
