# Wandering Pixels — Captain's Log
> Paste this file at the start of every new Claude session. Keep it updated as you ship things.

---

## Project Identity

- **App:** Wandering Pixels — a visual journal / mood board app
- **Owner:** Ricardo (Zentazuke)
- **Repo:** https://github.com/Zentazuke/Wandering-Pixels-Ver.3
- **Local path:** `C:\Users\Ricardo\Desktop\Work\PROJECTOS\WANDERING PIXELS\wandering-pixels-react`
- **Dev server:** `npm run dev` → http://localhost:5173
- **Tests:** `npm test` (CI runs typecheck + lint + tests on every push — trust CI, not this line)
- **Build:** `npm run build` (runs `tsc --noEmit` first, then Vite)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| State | Zustand 5 (appStore + boardStore) |
| Undo/Redo | zundo (wraps boardStore only) |
| Types | TypeScript (strict mode) |
| CSS | CSS Modules + CSS custom properties (tokens.css) |
| Persistence | IndexedDB via boardDB.ts + usePersistence hook |
| Tests | Vitest + Testing Library |
| Fonts | @fontsource (Playfair Display, DM Sans, Lora) |

---

## Project Structure

```
src/
  types/
    elements.ts         ← BoardElement discriminated union (Photo | Text | Sticker)
    store.ts            ← AppState + BoardState interfaces
    index.ts            ← barrel export
  store/
    appStore.ts         ← UI state (view, mode, selId, zoom/pan, toast, flash)
    boardStore.ts       ← Board data (elements, bg) + buildFilter + factories
    appStore.test.ts    ← 9 tests
    boardStore.test.ts  ← 28 tests
  db/
    boardDB.ts          ← IDB wrapper (dbSave, dbLoad, dbDelete, dbGetByPrefix)
  hooks/
    usePersistence.ts   ← IDB auto-save (800ms debounce) + load on mount
    useZoom.js          ← scroll-to-zoom, Space+drag pan, fitBoard
    useBoardInteraction.js ← drag / resize / rotate elements
    useKeyboardShortcuts.js ← Delete, Ctrl+Z/Y/D, Ctrl+]/[, Escape
    useFlash.js         ← white-screen view transition
  utils/
    exportBoard.js      ← canvas render → PNG download or JPEG thumbnail
    exportBoard.test.ts ← 7 tests
  constants/
    backgrounds.js      ← BG_OPTIONS (Light/Pattern/Dark/Gradient/Texture)
    stickers.js         ← STICKER_CATS + STICKERS array
    shapes.js           ← SHAPES (square/rounded/circle/squircle/diamond/hexagon/heart)
    frames.js           ← FRAMES (13 photo frame styles)
    filterPresets.js    ← 16 FILTER_PRESETS
    workspaceModes.js   ← 5 workspace modes + templates
    board.js            ← BOARD_W=1400, BOARD_H=900
  components/
    MainMenu/           ← 5 workspace mode cards, flash transition to board
    AppShell/           ← shell layout (TopBar + body)
    TopBar/             ← logo, view tabs, undo/redo, export PNG
    Toolbar/            ← select/text/photo/sticker tools + BgPicker modal
    Board/              ← 1400×900 canvas, zoom/pan, renders all elements
      elements/
        PhotoElement    ← frames, shapes, filters, captions (React.memo)
        TextElement     ← contentEditable, 20 frame styles (React.memo)
        StickerElement  ← SVG tint (React.memo)
        SelectionHandles ← rotate + 4 corner resize handles
    PropsPanel/         ← PhotoProps / TextProps / StickerProps
    Diary/              ← mode-aware journal, saves entries to IDB
    Archive/            ← board snapshots grid, save/restore/delete
    ui/
      FlashOverlay      ← full-screen white flash transition
      Toast             ← bottom-center notifications (3s auto-clear)
      ErrorBoundary     ← catches render crashes, shows fallback UI
      BgPicker          ← background picker modal
      StickerPicker     ← sticker picker modal (4 category tabs)
  styles/
    tokens.css          ← ALL design tokens (colours, spacing, radius, shadow)
    global.css          ← reset + font imports
  test/
    setup.ts            ← @testing-library/jest-dom
```

---

## State Architecture

### appStore (UI only — resets on reload)
```
view: 'menu' | 'board' | 'diary' | 'archive'
mode: 'default' | 'travel' | 'love' | 'family' | 'game'
selId: string | null
tool: 'select' | 'text' | 'photo' | 'sticker' | 'draw'
zoom, panX, panY
flashing: boolean
toast: { id, message, type } | null
```

### boardStore (persisted to IDB)
```
elements: BoardElement[]
currentBg: string
customBgColor: string | null
customBgImage: string | null
```
Actions: addElement, updateElement, removeElement, duplicateElement,
bringForward, sendBackward, bringToFront, sendToBack, clearBoard, loadBoard
Undo/redo: useBoardStore.temporal.getState().undo() / .redo()

---

## Element Data Model

All elements extend BaseElement: `{ id, x, y, w, h, rotation, zIndex, locked }`

**PhotoElement** — type:'photo', src, frame, shape, flipH/V, imgZoom/X/Y,
  filters: br/co/sa/bl/se/hr/iv/op (short names), caption, frameColor, shadow

**TextElement** — type:'text', content (HTML), fontFamily, fontSize, bold,
  italic, align, color, bg, noteFrame

**StickerElement** — type:'sticker', svg, customColor, opacity

Factory functions: `makePhotoElement(src, zIndex)`, `makeTextElement(zIndex)`,
`makeStickerElement(svg, zIndex)` — all defaults live here, not scattered in components

---

## Design Tokens (tokens.css)

Gold palette: --gold, --gold-dark, --gold-08 through --gold-70 (alpha variants)
Ink: --ink, --ink-mid, --ink-faint
Surfaces: --surface, --surface-alt, --surface-card, --surface-dark
Semantic: --danger, --danger-bg
Layout: --topbar-h (48px), --toolbar-w (52px), --props-w (210px)
Board: --board-w (1400px), --board-h (900px)
Radius: --r-sm/md/lg
Shadow: --shadow-sm/md/lg
Transition: --t-fast, --t-mid

---

## Known Bugs Fixed (do not reintroduce)

1. ~~buildFilter used long property names (brightness) but elements store short names (br)~~
2. ~~loadedRef never set on first visit — auto-save never fired~~
3. ~~persist middleware tried to store base64 images in localStorage (5MB limit)~~
4. ~~Board deselect used e.target instead of e.currentTarget~~
5. ~~ArchiveView had dead flash variable — restore had no transition~~

---

## Quality Status

Don't write a score here — CI is the source of truth. Every push runs
`tsc --noEmit`, `eslint .`, and `vitest run` via GitHub Actions, and the
build script typechecks before bundling, so Vercel won't deploy red builds.

Established foundations:
- TypeScript strict mode on all source files; lint covers all TS/TSX
- Test suite: stores + export utilities (interaction hooks still untested)
- Toast notifications, Error Boundary, element factories, design tokens
- React.memo on element components; IDB-only persistence
- Undo history capped at 50 entries (zundo `limit`)

Known debt (from the June 2026 audit — see session notes):
- usePersistence has a save/load race when switching views fast (fix planned: Session 2)
- Drag creates one undo entry per pointermove (fix planned: Session 2)
- exportBoard doesn't render shape elements and supports only a subset of
  note frames (export overhaul planned: Session 3 — DOM-snapshot spike)
- Text content stored as raw HTML — must be sanitized before board sharing ships

---

## Backlog — Prioritised

### Round 1 — UI Polish (do these first)
- [ ] **TopBar** — too many buttons, needs reorganising
- [ ] **PropsPanel** — feels disorganised, needs visual hierarchy
- [ ] **Frames** — not premium enough, needs refinement
- [ ] **Archive** — layout needs improvement

### Round 2 — Features
- [ ] View past diary entries (saves to IDB but no read UI)
- [ ] Workspace mode changes board defaults (colours, fonts per mode)
- [ ] Drag & drop images onto board
- [ ] Arrow / shape elements
- [ ] Multi-select (shift+click)
- [ ] Snap to grid

### Round 3 — Platform
- [ ] Decide: PWA (responsive web) vs React Native (true mobile app)
- [ ] Touch-aware interactions (pointer events already used — good start)
- [ ] Mobile layout strategy for the board canvas

---

## Commands Reference

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Production build
npm run build

# Save to GitHub
git add .
git commit -m "describe what changed"
git push
```

---

## How to Brief Claude in a New Session

Paste this file, then add:

> "Today's goal: [one specific thing].
> Don't explain, just build."

---

*Last updated: 10 June 2026 — Session 1 (quality gates): CI added, ESLint now actually covers TS/TSX, `tsc --noEmit` fixed and wired into the build, all tests green, undo history capped, dead state removed, photo-upload `Image` shadowing bug fixed.*
