/**
 * Regression tests for URL compatibility. Every legacy URL of the previous
 * Vue site must keep resolving to the equivalent tab.
 */
import { describe, expect, it } from 'vitest';
import { parseHash, sameRoute, tabHref, TAB_IDS, TAB_PATH } from './routes';

describe('parseHash — legacy URLs from the Vue site', () => {
  it.each([
    ['', 'about'],
    ['#', 'about'],
    ['#/', 'about'],
    ['#/portfolio', 'portfolio'],
    ['#/skills', 'skills'],
    ['#/contacts', 'contacts'],
  ] as const)('%s → tab %s', (hash, tab) => {
    expect(parseHash(hash)).toEqual({ view: 'tab', tab, item: null });
  });

  it('sends the retired #/phoneBook URL to the Portfolio tab instead of a 404', () => {
    expect(parseHash('#/phoneBook')).toEqual({ view: 'tab', tab: 'portfolio', item: null });
    expect(parseHash('#/phonebook')).toEqual({ view: 'tab', tab: 'portfolio', item: null });
  });

  it('opens the Publications section of the Portfolio page from its aliases', () => {
    for (const hash of ['#/publications', '#/book', '#/writing', '#/Publications/']) {
      expect(parseHash(hash)).toEqual({ view: 'tab', tab: 'portfolio', item: 'publications' });
    }
    expect(parseHash('#/publications/x').view).toBe('notFound');
  });

  it('shows the 404 view for unknown paths, like the old catch-all route', () => {
    expect(parseHash('#/does-not-exist')).toEqual({ view: 'notFound', path: 'does-not-exist' });
  });
});

describe('parseHash — tolerant parsing', () => {
  it.each(['#portfolio', '#/portfolio/', '#/Portfolio', '#/portfolio?utm=x', '#//portfolio'])('%s → portfolio', (hash) => {
    expect(parseHash(hash)).toEqual({ view: 'tab', tab: 'portfolio', item: null });
  });

  it('parses deep links to a single item', () => {
    expect(parseHash('#/portfolio/last-of-us')).toEqual({ view: 'tab', tab: 'portfolio', item: 'last-of-us' });
    expect(parseHash('#/experience/LightBox')).toEqual({ view: 'tab', tab: 'experience', item: 'lightbox' });
  });

  it('rejects unsafe or too-deep item paths', () => {
    expect(parseHash('#/portfolio/<script>').view).toBe('notFound');
    expect(parseHash('#/portfolio/a/b').view).toBe('notFound');
    expect(parseHash('#/skills/a/b').view).toBe('notFound');
  });

  it('treats malformed percent-escapes as not found instead of throwing', () => {
    expect(parseHash('#/%E0%A4%A').view).toBe('notFound');
  });
});

describe('tabHref', () => {
  it('round-trips through parseHash for every tab', () => {
    for (const tab of TAB_IDS) {
      expect(parseHash(tabHref(tab))).toEqual({ view: 'tab', tab, item: null });
      expect(parseHash(tabHref(tab, 'x'))).toEqual({ view: 'tab', tab, item: 'x' });
    }
  });

  it('uses the legacy names as canonical paths', () => {
    expect(TAB_PATH.portfolio).toBe('portfolio');
    expect(TAB_PATH.skills).toBe('skills');
    expect(TAB_PATH.contacts).toBe('contacts');
    expect(tabHref('about')).toBe('#/');
  });
});

describe('sameRoute', () => {
  it('compares routes structurally', () => {
    expect(sameRoute(parseHash('#/portfolio'), parseHash('#portfolio'))).toBe(true);
    expect(sameRoute(parseHash('#/portfolio'), parseHash('#/skills'))).toBe(false);
    expect(sameRoute(parseHash('#/nope'), parseHash('#/nope'))).toBe(true);
  });
});
