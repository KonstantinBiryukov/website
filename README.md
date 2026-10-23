# Konstantin Biriukov — portfolio

Source of **https://konstantinbiryukov.github.io/website/** — a small, tabbed portfolio
over a live, colourful topographic map drawn in WebGL.

React 19 · TypeScript (strict) · Vite · hand-written WebGL2/GLSL · no UI framework, no
animation library, no backend.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173/website/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type check → production build → `scripts/verify-dist.mjs` (base path, legacy URLs, sizes) |
| `npm run preview` | Serve the production build at http://localhost:4173/website/ |
| `npm test` | Unit tests (Vitest): routing, geometry, label placement, terrain field, content |
| `npm run lint` | ESLint (type-aware TypeScript + React hooks rules) |
| `npm run check` | lint + tests + build — run before every deploy |
| `npm run optimize:images` | Regenerate WebP images and `og.png` from `media/originals/` |
| `npm run icons` | Regenerate the "KB" favicon set (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`) |
| `npm run deploy` | Build, verify and publish to `gh-pages` (asks before pushing; `-- --dry-run` to rehearse) |

## Deploying

GitHub Pages serves the **`gh-pages` branch**, exactly as before; the public URL does not
change.

```bash
npm run check                  # everything green?
npm run deploy -- --dry-run    # rehearse: builds and prepares the commit, pushes nothing
npm run deploy                 # builds, shows the file changes, asks y/N, pushes
```

The script prepares `gh-pages` in a temporary git worktree, adds a commit on top of the
existing history and pushes **without** `--force`. Your working branch and uncommitted files
are never touched.

## Structure

```
src/
  data/          ALL content, typed — edit these to update the site
    profile.ts     name, one-liner, links, badges, featured book/interview/article
    projects.ts    portfolio tiles (one line each)
    experience.ts  roles (one line each) + career-map coordinates
    publications.ts book, thesis, talk, articles
    skills.ts      skill groups
  components/
    views/         one component per tab: About, Portfolio, Experience, Publications, Skills, Contacts
    backdrop/      the live map behind the site (lazy WebGL chunk + CSS fallback)
    experience/    career route map
  gl/            terrain: field.ts (CPU) ⇄ shaders.ts (GPU), TerrainRenderer
  demos/labels/  collision-aware label placement (used by the career map)
  lib/           routing, tabs, media, geo maths, hooks
public/          favicon, og.png, robots, sitemap, 404 redirect, and img/ — byte-identical
                 copies of the old site's image URLs
media/originals/ source images (not shipped)
docs/            URL inventory and content notes
```

## Tabs and URLs

Hash routes, like the previous Vue site (GitHub Pages cannot rewrite paths):
`#/` About · `#/portfolio` · `#/experience` · `#/publications` · `#/skills` · `#/contacts`
(the retired `#/phoneBook` opens Portfolio).
All old URLs keep working — see [docs/URL_INVENTORY.md](docs/URL_INVENTORY.md).
Projects can be deep-linked: `#/portfolio/last-of-us`.

## How the map works

- A domain-warped fbm height field rendered in one fragment-shader pass: hypsometric
  colours, contour lines via `fwidth`, hillshade via `dFdx/dFdy`, dithering.
- Each tab has a place on the map; switching tabs flies the camera there and changes the
  accent colour. On About the terrain slowly drifts and a "survey lens" follows the pointer;
  the readout samples the same field on the CPU (constants are shared with the GLSL).
- It renders only when needed: continuous on About, otherwise only while the camera is
  moving — then zero frames. Nothing runs when the tab is hidden; reduced motion stops the
  drift and turns flights into cuts. DPR is capped, resolution adapts to frame time, the
  context is restored after loss and freed on unmount.
- The chunk loads on idle after the first paint; without WebGL2 (or in data-saver mode) a
  CSS backdrop stays.

Budget: ~85 kB gzip JS in total (≈66 kB is React), ~5 kB CSS, self-hosted fonts
(Outfit + Manrope), responsive WebP with intrinsic sizes (no layout shift).
