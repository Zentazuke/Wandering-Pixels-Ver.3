import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import useAppStore from './store/appStore';
import useBoardStore from './store/boardStore';
import { exportBoardDomDataUrl } from './utils/exportBoardDom';

// Dev-only: expose stores + export helper on window for console debugging
// and visual spikes. Stripped from production builds by the DEV guard.
if (import.meta.env.DEV) {
  Object.assign(window, { WP: { useAppStore, useBoardStore, exportBoardDomDataUrl } });
}

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found in index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
