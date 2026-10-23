/**
 * Hash routing — pure functions only (no DOM access), so they are easy to test.
 *
 * Why hash routing: the site is hosted on GitHub Pages, which cannot rewrite
 * unknown paths to index.html. The previous Vue site used vue-router in
 * `hash` mode, so every URL already in circulation looks like
 *   https://konstantinbiryukov.github.io/website/#/portfolio
 * Keeping hash routing keeps every one of those links working.
 *
 * The site is a set of tabs, like the previous design. Each tab is its own
 * view (no long scroll):
 *   #/              → About        (legacy)
 *   #/portfolio     → Portfolio    (legacy)
 *   #/experience    → Experience
 *   #/skills        → Skills       (legacy)
 *   #/contacts      → Contacts     (legacy)
 *   #/phoneBook     → Portfolio    (legacy URL; the project was retired, so
 *                                   the link lands on the projects instead of a 404)
 *   #/publications  → Portfolio, scrolled to its Publications section
 *                     (also #/book, #/writing)
 *   anything else   → 404 view     (legacy behaviour)
 * Items can be deep-linked: #/portfolio/last-of-us highlights that project.
 */

/** The tabs, in navigation order. */
export const TAB_IDS = ['about', 'portfolio', 'experience', 'skills', 'contacts'] as const;
export type TabId = (typeof TAB_IDS)[number];

/** The parsed meaning of a URL hash. */
export type Route =
  | { readonly view: 'tab'; readonly tab: TabId; readonly item: string | null }
  | { readonly view: 'notFound'; readonly path: string };

/** Canonical hash path of each tab (legacy names where one existed). */
export const TAB_PATH: Readonly<Record<TabId, string>> = {
  about: '',
  portfolio: 'portfolio',
  experience: 'experience',
  skills: 'skills',
  contacts: 'contacts',
};

/**
 * Every accepted first path segment → tab. Lower-case keys; matching is
 * case-insensitive, like vue-router's default, so `#/Portfolio` also works.
 */
const SEGMENT_TO_TAB: Readonly<Record<string, TabId>> = {
  '': 'about',
  about: 'about',
  home: 'about',
  portfolio: 'portfolio',
  projects: 'portfolio',
  work: 'portfolio',
  phonebook: 'portfolio', // legacy #/phoneBook
  experience: 'experience',
  skills: 'skills',
  contacts: 'contacts',
  contact: 'contacts',
};

/**
 * Segments that open a tab at a specific section: the publications live on
 * the Portfolio page, so their old/short URLs land on that section.
 */
const SEGMENT_TO_SECTION: Readonly<Record<string, { tab: TabId; item: string }>> = {
  publications: { tab: 'portfolio', item: 'publications' },
  writing: { tab: 'portfolio', item: 'publications' },
  book: { tab: 'portfolio', item: 'publications' },
};

/** Item ids may only contain these characters (they become element ids). */
const ITEM_PATTERN = /^[a-z0-9-]+$/i;

/**
 * Parse a `location.hash` value into a Route.
 *
 * Tolerates what a hand-typed or legacy link might contain: a missing
 * slash (`#portfolio`), a trailing slash, a query string, any letter case.
 */
export function parseHash(hash: string): Route {
  // Strip the leading "#", then an optional leading "/".
  let path = hash.startsWith('#') ? hash.slice(1) : hash;
  if (path.startsWith('/')) path = path.slice(1);

  // Drop any query string or nested fragment — they never select a view.
  const cut = path.search(/[?#]/);
  if (cut !== -1) path = path.slice(0, cut);

  // Decode percent-escapes defensively; a malformed escape is just a 404.
  try {
    path = decodeURIComponent(path);
  } catch {
    return { view: 'notFound', path };
  }

  const [first = '', second, ...rest] = path.split('/').filter((s) => s.length > 0);
  const head = first.toLowerCase();

  const section = SEGMENT_TO_SECTION[head];
  if (section !== undefined) {
    return second === undefined ? { view: 'tab', tab: section.tab, item: section.item } : { view: 'notFound', path };
  }

  const tab = SEGMENT_TO_TAB[head];
  // Unknown tab, or more than one level below it → 404.
  if (tab === undefined || rest.length > 0) return { view: 'notFound', path };

  if (second === undefined) return { view: 'tab', tab, item: null };
  if (!ITEM_PATTERN.test(second)) return { view: 'notFound', path };
  return { view: 'tab', tab, item: second.toLowerCase() };
}

/** Build the href for a tab (optionally an item inside it). */
export function tabHref(tab: TabId, item?: string): string {
  const base = `#/${TAB_PATH[tab]}`;
  if (item === undefined) return base;
  return tab === 'about' ? `#/about/${item}` : `${base}/${item}`;
}

/** Two routes point at the same place. */
export function sameRoute(a: Route, b: Route): boolean {
  if (a.view === 'tab' && b.view === 'tab') return a.tab === b.tab && a.item === b.item;
  if (a.view === 'notFound' && b.view === 'notFound') return a.path === b.path;
  return false;
}
