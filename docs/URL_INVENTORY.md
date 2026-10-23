# URL inventory and regression checklist

Audited on 2026-10-23 from the `master` and `gh-pages` branches of
`KonstantinBiryukov/website` and the live site.

**Public URL:** `https://konstantinbiryukov.github.io/website/` (GitHub Pages, served from
the `gh-pages` branch, path `/`, legacy build type, HTTPS enforced, no custom domain).

> Note: the account is **KonstantinBiryukov** (with a *y*). `konstantinbiriukov.github.io`
> (with an *i*) returns 404 — it is a different GitHub username. The repository's homepage
> field already uses the correct `konstantinbiryukov.github.io/website/`.

## Routes (vue-router, `mode: 'hash'`)

| Old URL | Old content | New behaviour | Test |
| --- | --- | --- | --- |
| `/website/` and `/website/#/` | About | About tab | ✓ |
| `/website/#/portfolio` | Project cards | Portfolio tab | ✓ |
| `/website/#/contacts` | Email, phone, social links | Contacts tab (no phone number) | ✓ |
| `/website/#/skills` | Placeholder | Skills tab | ✓ |
| `/website/#/phoneBook` | Phone Book screenshots (6) | Opens the Portfolio tab (project retired); the old screenshot files stay at their `img/` URLs | ✓ |
| any other `#/…` | 404 view | 404 view with a way home | ✓ |

Matching is case-insensitive (as vue-router was) and tolerates `#portfolio`, trailing slashes
and query strings. Unit tests: `src/lib/routes.test.ts`.

### New routes

`#/experience`, `#/publications` (aliases `#/book`, `#/writing`), `#/about`, `#/projects`,
`#/work`, `#/contact`, and item deep links
such as `#/portfolio/last-of-us` or `#/experience/lightbox` (scrolls to and highlights it).

## Static files published by the old build

| Path | Status |
| --- | --- |
| `favicon.ico` | Kept (same file) |
| `img/*.png`, `img/background.1e0a5874.jpg` (17 files) | Kept, **byte-identical**, same paths (`public/img/`) |
| `js/*.js`, `css/*.css` (hashed Vue chunks + source maps) | Removed — referenced only by the old `index.html` |

`scripts/verify-dist.mjs` fails the build if any kept file is missing.

## Other paths

- `/website/<anything>` (non-hash) never existed; `public/404.html` now forwards it to
  `/website/#/<anything>` instead of GitHub's generic 404.
- New: `/website/og.png`, `/website/robots.txt`, `/website/sitemap.xml`, `/website/favicon.svg`.

## External links carried over from the old site

All checked on 2026-10-23 (HTTP 200 unless noted):
storytelling-classification demo, last-of-us-map, geo_jobs demo, Devpost GeoJobs and Game of
Grants, SCSU thesis (bot-protected: 202 to scripts, fine in browsers), AAG abstract (403 to
scripts), Google Drive résumé, GitHub, LinkedIn (999 to scripts). The Instagram link from
the old contacts page was intentionally not carried over (not professional content).
