/**
 * Site header: wordmark + the tab bar.
 *
 * Tabs are links (each is a URL), marked with aria-current="page" when
 * active. On narrow screens the tab bar becomes a horizontally scrollable
 * row under the wordmark — always visible, no hamburger menu needed — and
 * the active tab scrolls itself into view within that row.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import { onInternalLinkClick } from '../lib/router';
import { tabHref, type TabId } from '../lib/routes';
import { TABS } from '../lib/tabs';
import { profile } from '../data/profile';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  /** Active tab, or null on non-tab views. */
  readonly active: TabId | null;
}

export function SiteHeader({ active }: SiteHeaderProps) {
  const navRef = useRef<HTMLElement>(null);

  // Keep the active tab visible in the (horizontally scrollable) tab row.
  // Scrolls only the row itself — never the page.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav == null || link == null || nav.scrollWidth <= nav.clientWidth) return;
    const left = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  return (
    <header className={styles.header}>
      <div className={`shell ${styles.bar}`}>
        <a className={styles.wordmark} href={tabHref('about')} onClick={onInternalLinkClick}>
          <span className={styles.mark} aria-hidden="true">
            KB
          </span>
          <span className={styles.name}>{profile.name}</span>
        </a>

        <nav ref={navRef} aria-label="Main" className={styles.nav}>
          <ul className={styles.tabs}>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <a
                  className={styles.tab}
                  href={tabHref(tab.id)}
                  aria-current={active === tab.id ? 'page' : undefined}
                  style={{ '--tab-accent': tab.accent } as CSSProperties}
                  onClick={onInternalLinkClick}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
