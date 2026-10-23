/**
 * Entry point: fonts, global styles, then mount the app.
 *
 * Fonts are self-hosted (Fontsource, bundled and fingerprinted by Vite):
 * no third-party request, and only the weights actually used.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/latin-700.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import './styles/global.css';
import { App } from './App';

// The router decides where each view starts; don't let the browser restore
// an old scroll position on reload.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

const container = document.getElementById('root');
if (container === null) throw new Error('#root element is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
