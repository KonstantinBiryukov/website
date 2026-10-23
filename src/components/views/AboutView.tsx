/**
 * About tab (#/): name, one line, one sentence, links, badges and three
 * featured items. The live map behind it reacts to the pointer here.
 */
import { profile } from '../../data/profile';
import { Icon, type IconName } from '../ui/Icon';
import { Img } from '../ui/Img';
import styles from './AboutView.module.css';

/** Icon per featured kind. */
const FEATURED_ICON: Record<'Book' | 'Interview' | 'Article', IconName> = {
  Book: 'book',
  Interview: 'mic',
  Article: 'paper',
};

/** Primary links under the intro. */
const LINKS: readonly { label: string; href: string; icon: IconName }[] = [
  { label: 'LinkedIn', href: profile.links.linkedin, icon: 'linkedin' },
  { label: 'GitHub', href: profile.links.github, icon: 'github' },
  { label: 'Résumé', href: profile.links.resume, icon: 'download' },
];

export function AboutView() {
  return (
    <section id="view-about" className={`shell view-enter ${styles.about}`} aria-labelledby="view-about-title">
      <div className={styles.intro}>
        <h1 id="view-about-title" className={styles.name}>
          {/* The space keeps the accessible name "Konstantin Biriukov". */}
          Konstantin <br />
          Biriukov
        </h1>
        <p className={styles.tagline}>{profile.tagline}</p>
        <p className={styles.text}>{profile.intro}</p>
        <p className={styles.links}>
          {LINKS.map((link) => (
            <a key={link.label} className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
              <Icon name={link.icon} size={18} />
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </p>
      </div>

      <ul className={styles.badges} aria-label="Highlights">
        {profile.badges.map((badge) => (
          <li key={badge}>{badge}</li>
        ))}
      </ul>

      <ul className={styles.featured} aria-label="Featured">
        {profile.featured.map((item) => (
          <li key={item.id}>
            <a className={styles.card} href={item.href} target="_blank" rel="noopener noreferrer" data-kind={item.kind}>
              {item.image !== undefined ? (
                <Img id={item.image.id} alt={item.image.alt} sizes="64px" className={styles.cover} />
              ) : (
                <span className={styles.cardIcon} aria-hidden="true">
                  <Icon name={FEATURED_ICON[item.kind]} size={22} />
                </span>
              )}
              <span className={styles.cardText}>
                <span className={styles.cardKind}>{item.kind}</span>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardSource}>{item.source}</span>
              </span>
              <Icon name="arrowUpRight" size={16} className={styles.cardArrow} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
