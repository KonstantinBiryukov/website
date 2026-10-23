/**
 * The 404 view — like the previous site's catch-all route, with a way back.
 */
import { tabHref } from '../lib/routes';
import { SmartLink } from './ui/SmartLink';
import styles from './SecondaryPage.module.css';

export function NotFound({ path }: { readonly path: string }) {
  return (
    <section className={`shell view-enter ${styles.page}`} aria-labelledby="not-found-title">
      <h1 id="not-found-title" className={styles.title}>
        Off the map
      </h1>
      <p className={styles.lede}>
        Nothing lives at <code>#/{path}</code>.
      </p>
      <p className={styles.actions}>
        <SmartLink href={tabHref('about')} variant="primary">
          Take me home
        </SmartLink>
      </p>
    </section>
  );
}
