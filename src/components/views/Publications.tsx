/**
 * The Publications section of the Portfolio page: a short list — kind,
 * title, venue, year, links — with the book (and its cover) first, plus a
 * link to the full Google Scholar profile.
 *
 * Reached directly via #/publications (also #/book, #/writing), which
 * opens Portfolio scrolled to this section (element id "publications").
 */
import { publications, SCHOLAR_URL } from '../../data/publications';
import { Icon, type IconName } from '../ui/Icon';
import { Img } from '../ui/Img';
import { SmartLink } from '../ui/SmartLink';
import styles from './Publications.module.css';

/** Icon per publication kind (used when there is no cover image). */
const KIND_ICON: Record<'Book' | 'Thesis' | 'Talk' | 'Article', IconName> = {
  Book: 'book',
  Thesis: 'scholar',
  Talk: 'mic',
  Article: 'paper',
};

export function Publications({ highlight }: { readonly highlight: string | null }) {
  return (
    <section id="publications" className={styles.section} aria-labelledby="publications-title">
      <h2 id="publications-title" className={styles.heading}>
        Publications
      </h2>
      <ol className={styles.list}>
        {publications.map((item) => (
          <li key={item.id} id={item.id} className={styles.item} data-kind={item.kind} data-highlight={highlight === item.id}>
            {item.image !== undefined ? (
              <Img id={item.image.id} alt={item.image.alt} sizes="88px" className={styles.cover} />
            ) : (
              <span className={styles.icon} aria-hidden="true">
                <Icon name={KIND_ICON[item.kind]} size={22} />
              </span>
            )}
            <div className={styles.body}>
              <p className={styles.meta}>
                {item.kind}
                {item.year !== null && ` · ${item.year}`}
              </p>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.venue}>{item.venue}</p>
              {item.links.length > 0 && (
                <p className={styles.links}>
                  {item.links.map((link) => (
                    <SmartLink key={link.href} href={link.href} kind={link.kind} variant="action">
                      {link.label}
                    </SmartLink>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.more}>
        <SmartLink href={SCHOLAR_URL} kind="evidence" variant="primary">
          See all on Google Scholar
        </SmartLink>
      </p>
    </section>
  );
}
