/**
 * Vite build configuration.
 *
 * The site is a GitHub Pages *project* site served from
 * https://konstantinbiryukov.github.io/website/ — not from the domain root —
 * so every generated asset URL must start with `/website/`. The previous
 * Vue CLI build used `publicPath: '/website/'` for the same purpose; keeping
 * the identical base path is what keeps all existing public URLs working.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/** The public base path. Must match the GitHub Pages project URL. */
export const BASE_PATH = '/website/';

export default defineConfig({
  // Used for dev, preview and build alike, so local URLs look exactly like
  // production: http://localhost:5173/website/#/portfolio
  base: BASE_PATH,

  plugins: [react()],

  build: {
    outDir: 'dist',
    // Modern evergreen browsers only: smaller output, native ES modules,
    // no legacy polyfills. WebGL2 is feature-detected at runtime anyway.
    target: 'es2022',
    // Images below this size are inlined as data URIs (saves a request for
    // tiny icons); every real photograph is far larger and stays a file.
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
    // Source maps are not published: they would roughly double the upload
    // and add nothing for visitors. Enable locally when debugging a build.
    sourcemap: false,
    rollupOptions: {
      output: {
        // React rarely changes, so it lives in its own long-cacheable chunk.
        // Everything else (our own code) is small and changes together.
        manualChunks(id: string) {
          if (id.includes('node_modules/react')) return 'react';
          return undefined;
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
