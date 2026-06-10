import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // PORT env lets tooling (e.g. preview harnesses) assign a free port;
  // defaults to Vite's standard 5173 for plain `npm run dev`.
  server: { port: Number(process.env.PORT) || 5173 },
});
