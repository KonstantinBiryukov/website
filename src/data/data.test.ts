/**
 * Content integrity: catches broken references in the data files before
 * they ship (unknown image ids, duplicate anchors, malformed URLs).
 */
import { describe, expect, it } from 'vitest';
import { mediaIds, resolveImage } from '../lib/media';
import { parseHash, TAB_IDS } from '../lib/routes';
import { TABS } from '../lib/tabs';
import { roles, routeStops } from './experience';
import { profile } from './profile';
import { projects } from './projects';
import { publications } from './publications';
import { skillGroups } from './skills';

describe('media', () => {
  it('every referenced image exists and has real alt text', () => {
    const refs = [
      ...projects.flatMap((p) => (p.image ? [p.image] : [])),
      ...profile.featured.flatMap((f) => (f.image ? [f.image] : [])),
      ...publications.flatMap((p) => (p.image ? [p.image] : [])),
    ];
    for (const ref of refs) {
      expect(mediaIds, ref.id).toContain(ref.id);
      expect(() => resolveImage(ref.id)).not.toThrow();
      expect(ref.alt.length, `${ref.id} needs alt text`).toBeGreaterThan(10);
    }
  });
});

describe('references', () => {
  it('every map stop refers to a real role (or the school)', () => {
    const ids = new Set([...roles.map((r) => r.id), 'scsu']);
    for (const stop of routeStops) for (const ref of stop.refs) expect(ids.has(ref), ref).toBe(true);
  });

  it('ids are unique and valid deep links', () => {
    const ids = [...projects.map((p) => p.id), ...roles.map((r) => r.id), ...publications.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of projects) expect(parseHash(`#/portfolio/${p.id}`)).toEqual({ view: 'tab', tab: 'portfolio', item: p.id });
  });

  it('every tab has a configuration, in order', () => {
    expect(TABS.map((t) => t.id)).toEqual([...TAB_IDS]);
  });
});

describe('links', () => {
  it('external links use https and internal links are valid routes', () => {
    const hrefs = [
      ...projects.flatMap((p) => p.links.map((l) => l.href)),
      ...publications.flatMap((p) => p.links.map((l) => l.href)),
      ...profile.featured.map((f) => f.href),
      ...Object.values(profile.links),
    ];
    for (const href of hrefs) {
      expect(href).toMatch(/^(https:\/\/|#\/)/);
      if (href.startsWith('#/')) expect(parseHash(href).view, href).not.toBe('notFound');
    }
  });

  it('the book links to its Amazon listing', () => {
    expect(profile.featured.find((f) => f.kind === 'Book')?.href).toMatch(/\/dp\/1735962902$/);
  });
});

describe('copy stays short', () => {
  it('one-liners are one line', () => {
    for (const p of projects) expect(p.line.length, p.id).toBeLessThanOrEqual(80);
    for (const r of roles) expect(r.line.length, r.id).toBeLessThanOrEqual(80);
    expect(profile.intro.length).toBeLessThanOrEqual(120);
  });

  it('skills are grouped and non-empty', () => {
    for (const g of skillGroups) expect(g.skills.length).toBeGreaterThan(0);
  });
});
