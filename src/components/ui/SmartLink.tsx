/**
 * One link component for the whole site.
 *
 * - Internal hash routes ("#/portfolio") go through the router, so repeated
 *   clicks still scroll and modified clicks (new tab) still work.
 * - External links open in a new tab with rel="noopener noreferrer", and
 *   announce that to screen readers.
 * - An optional icon is chosen from the link's `kind`.
 */
import type { ReactNode } from 'react';
import type { Link } from '../../data/types';
import { onInternalLinkClick } from '../../lib/router';
import { Icon, type IconName } from './Icon';
import styles from './SmartLink.module.css';

/** Icon for each link kind. */
const KIND_ICON: Record<NonNullable<Link['kind']>, IconName> = {
  live: 'arrowUpRight',
  code: 'code',
  paper: 'paper',
  book: 'book',
  article: 'paper',
  evidence: 'arrowUpRight',
};

interface SmartLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly kind?: Link['kind'];
  /** Visual variant: plain inline text link, or a bordered "pill" action. */
  readonly variant?: 'inline' | 'action' | 'primary';
  readonly className?: string | undefined;
}

/** True for links that leave the site. */
const isExternal = (href: string): boolean => /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');

export function SmartLink({ href, children, kind, variant = 'inline', className }: SmartLinkProps) {
  const external = isExternal(href);
  const opensTab = external && !href.startsWith('mailto:');
  const classes = [styles.link, styles[variant], className].filter(Boolean).join(' ');

  return (
    <a
      className={classes}
      href={href}
      {...(opensTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(!external && href.startsWith('#') ? { onClick: onInternalLinkClick } : {})}
    >
      <span>{children}</span>
      {kind !== undefined && <Icon name={KIND_ICON[kind]} size={14} className={styles.icon} />}
      {opensTab && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
