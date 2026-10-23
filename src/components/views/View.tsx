/**
 * The frame every tab shares: a landmark section with a heading, entering
 * with a short staggered animation (CSS only; disabled for reduced motion).
 * Each tab is its own "page", so each view has its own <h1>.
 */
import type { ReactNode } from 'react';
import styles from './View.module.css';

interface ViewProps {
  readonly id: string;
  /** Visible heading. Pass `hiddenTitle` to keep it for screen readers only. */
  readonly title: string;
  readonly hiddenTitle?: boolean;
  readonly children: ReactNode;
}

export function View({ id, title, hiddenTitle = false, children }: ViewProps) {
  return (
    <section id={`view-${id}`} className={`shell view-enter ${styles.view}`} aria-labelledby={`view-${id}-title`}>
      <h1 id={`view-${id}-title`} className={hiddenTitle ? 'sr-only' : styles.title}>
        {title}
      </h1>
      {children}
    </section>
  );
}
