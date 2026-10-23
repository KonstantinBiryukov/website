/**
 * Footer: one quiet line.
 */
import { profile } from '../data/profile';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>
          The map behind this page is drawn live by a WebGL shader.{' '}
          <a href="https://github.com/KonstantinBiryukov/website" target="_blank" rel="noopener noreferrer">
            Source<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
