/**
 * Small, dependency-free React hooks shared across the site.
 */
import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

/**
 * Subscribe to a CSS media query. Uses useSyncExternalStore so the value is
 * correct on the very first render (no flash of the wrong layout).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor asked the OS to minimise motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Report whether an element is (or has been) in the viewport.
 *
 * With `once` (the default) the value latches to `true` and the observer
 * disconnects after the first intersection — ideal for lazy work such as
 * mounting a demo, because it costs nothing afterwards. With `once: false`
 * the value follows visibility in both directions.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = '0px', once = true }: { rootMargin?: string; once?: boolean } = {},
): boolean {
  // Without IntersectionObserver (very old browsers) treat everything as
  // visible, so lazily-mounted content still appears.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (element === null || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (!once) {
          setInView(visible);
        } else if (visible) {
          setInView(true);
          observer.disconnect(); // latched — stop observing
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin, once]);

  return inView;
}
