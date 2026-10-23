/**
 * Scrolling helpers for view changes and item deep links.
 */

/**
 * Document-relative top of an element from layout offsets.
 *
 * Deliberately NOT getBoundingClientRect()/scrollIntoView(): those include
 * CSS transforms, and items in a freshly opened tab are still mid-way
 * through their entrance animation (translated a few px) — scrolling to the
 * transformed box would land slightly off. offsetTop ignores transforms.
 */
function layoutTop(element: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node !== null) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

/** The root's scroll-padding-top (clears the sticky header), in px. */
function scrollPaddingTop(): number {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

/**
 * Scroll an item (by element id) into view below the header.
 * @returns false if no such element exists.
 */
export function scrollToItem(id: string, smooth: boolean): boolean {
  const target = document.getElementById(id);
  if (target === null) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, layoutTop(target) - scrollPaddingTop()), behavior: smooth && !reduced ? 'smooth' : 'auto' });
  return true;
}
