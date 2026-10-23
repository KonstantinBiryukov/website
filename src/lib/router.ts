/**
 * The browser side of hash routing: a tiny external store over
 * `location.hash`, consumed by React through `useSyncExternalStore`.
 *
 * Clicking a link to the hash already in the address bar fires no
 * `hashchange`; `navigate()` detects that and bumps a counter instead, so
 * e.g. re-clicking a project deep link still scrolls to it.
 */
import { useSyncExternalStore, type MouseEvent } from 'react';
import { parseHash, sameRoute, type Route } from './routes';

/** A route plus a counter that changes on every navigation request. */
export interface RouterState {
  readonly route: Route;
  /** Increments on every navigation, including repeats of the same route. */
  readonly navigation: number;
  /** True only for the very first state (initial page load). */
  readonly initial: boolean;
}

type Listener = () => void;

let state: RouterState = { route: parseHash(window.location.hash), navigation: 0, initial: true };
const listeners = new Set<Listener>();

/** Replace the state and notify React. */
function commit(route: Route): void {
  state = { route, navigation: state.navigation + 1, initial: false };
  for (const listener of listeners) listener();
}

/** Browser back/forward and typed URLs arrive here. */
function onHashChange(): void {
  commit(parseHash(window.location.hash));
}

/** Subscribe function for useSyncExternalStore; attaches the DOM listener lazily. */
function subscribe(listener: Listener): () => void {
  if (listeners.size === 0) window.addEventListener('hashchange', onHashChange);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('hashchange', onHashChange);
  };
}

const getSnapshot = (): RouterState => state;

/** React hook: the current route state. Re-renders only on navigation. */
export function useRouter(): RouterState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Navigate to a hash such as "#/portfolio": assign `location.hash` (adds a
 * history entry; `hashchange` updates the store), or — if it is already
 * the current route — commit directly so the view still reacts.
 */
export function navigate(hash: string): void {
  const target = parseHash(hash);
  if (sameRoute(target, parseHash(window.location.hash))) {
    commit(target);
  } else {
    window.location.hash = hash;
  }
}

/**
 * Click handler for internal `<a href="#/…">` links. Lets modified clicks
 * (new tab, etc.) through untouched; otherwise routes via `navigate()`.
 */
export function onInternalLinkClick(event: MouseEvent<HTMLAnchorElement>): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const href = event.currentTarget.getAttribute('href');
  if (href?.startsWith('#') !== true) return;
  event.preventDefault();
  navigate(href);
}
