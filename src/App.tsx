/**
 * App shell: the map backdrop, header with tabs, the current view, footer —
 * and the glue between the hash router and the page.
 *
 * Each tab is its own view (no long scroll), like the previous site:
 *   about · portfolio (projects + publications) · experience · skills · contacts
 * plus a 404 view.
 */
import { useEffect, useLayoutEffect, type MouseEvent } from 'react';
import { MapBackdrop } from './components/backdrop/MapBackdrop';
import { NotFound } from './components/NotFound';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { AboutView } from './components/views/AboutView';
import { ContactsView } from './components/views/ContactsView';
import { ExperienceView } from './components/views/ExperienceView';
import { PortfolioView } from './components/views/PortfolioView';
import { SkillsView } from './components/views/SkillsView';
import { profile } from './data/profile';
import { useRouter } from './lib/router';
import type { Route, TabId } from './lib/routes';
import { scrollToItem } from './lib/scroll';
import { tabConfig } from './lib/tabs';

/** Document title for a route. */
function titleFor(route: Route): string {
  if (route.view === 'notFound') return `Not found — ${profile.name}`;
  if (route.tab === 'about') return `${profile.name} — ${profile.tagline}`;
  return `${tabConfig(route.tab).label} — ${profile.name}`;
}

export function App() {
  const { route, navigation, initial } = useRouter();
  const tab: TabId | null = route.view === 'tab' ? route.tab : null;
  const item = route.view === 'tab' ? route.item : null;

  // The accent colour follows the tab (CSS reads <html data-tab>).
  useEffect(() => {
    document.documentElement.dataset.tab = tab ?? 'contacts';
    document.title = titleFor(route);
  }, [route, tab]);

  // After every navigation: start the new view at the top (or at the
  // deep-linked item), and — except on first load — move keyboard focus to
  // the view's heading so screen readers announce the new tab. A layout
  // effect runs after the DOM is committed, so targets can be measured.
  useLayoutEffect(() => {
    if (item !== null && scrollToItem(item, !initial)) return;
    window.scrollTo(0, 0);
    if (!initial) {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (heading !== null) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [route, item, navigation, initial]);

  return (
    <>
      <a className="sr-only skip-link" href="#main" onClick={skipToMain}>
        Skip to content
      </a>
      <MapBackdrop tab={tab} />
      <SiteHeader active={tab} />
      {/* key: remount on tab change so the entrance animation replays. */}
      <main id="main" key={tab ?? route.view} tabIndex={-1}>
        {tab === 'about' && <AboutView />}
        {tab === 'portfolio' && <PortfolioView highlight={item} />}
        {tab === 'experience' && <ExperienceView highlight={item} />}
        {tab === 'skills' && <SkillsView />}
        {tab === 'contacts' && <ContactsView />}
        {route.view === 'notFound' && <NotFound path={route.path} />}
      </main>
      <SiteFooter />
    </>
  );
}

/**
 * The skip link must not change the hash: "#main" is not a route and would
 * show the 404 view. Move focus programmatically instead.
 */
function skipToMain(event: MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
  document.getElementById('main')?.focus();
}
