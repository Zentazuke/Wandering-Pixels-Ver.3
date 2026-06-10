# Wandering Pixels ✦

A visual journal / moodboard app. Arrange photos, text notes, stickers, and
shapes on a freeform canvas; style them with frames, filters, and colour
palettes; save board snapshots to the Archive; export the result as a PNG.

Local-first: everything is stored in your browser's IndexedDB — no account,
no server.

**Live:** deployed on Vercel (auto-deploys from `main`).

## Stack

- React 19 + Vite 8 + TypeScript (strict)
- Zustand 5 for state, [zundo](https://github.com/charkour/zundo) for undo/redo
- CSS Modules + design tokens (`src/styles/tokens.css`)
- IndexedDB persistence (`src/db/boardDB.ts`)
- Vitest + Testing Library

## Getting started

```bash
npm install
npm run dev        # → http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck (`tsc --noEmit`) then production build |
| `npm run lint` | ESLint over all TS/TSX source |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests with coverage report |

All three gates (typecheck, lint, tests) also run in CI on every push.

## Project structure

See [CAPTAINS_LOG.md](./CAPTAINS_LOG.md) for the full architecture map,
state design, element data model, and the prioritised backlog.
