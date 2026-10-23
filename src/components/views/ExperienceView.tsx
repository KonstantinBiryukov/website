/**
 * Experience tab (#/experience): the career map beside a compact timeline.
 * Hovering (or focusing a link inside) a role highlights its city.
 */
import { useState } from 'react';
import { education, roles } from '../../data/experience';
import { formatDuration, formatYearMonth } from '../../lib/format';
import { CareerRoute } from '../experience/CareerRoute';
import { View } from './View';
import styles from '../experience/Experience.module.css';

export function ExperienceView({ highlight }: { readonly highlight: string | null }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? highlight;

  /** Mouse handlers that drive the map highlight. */
  const hover = (id: string) => ({
    onMouseEnter: () => {
      setHovered(id);
    },
    onMouseLeave: () => {
      setHovered(null);
    },
  });

  return (
    <View id="experience" title="Experience">
      <div className={styles.layout}>
        <CareerRoute highlight={active} />

        <ol className={styles.roles}>
          {roles.map((role) => (
            <li key={role.id} id={role.id} className={styles.role} data-active={active === role.id} {...hover(role.id)}>
              <p className={styles.when}>
                <time dateTime={role.start}>{formatYearMonth(role.start)}</time>
                {' – '}
                {role.end === null ? 'now' : <time dateTime={role.end}>{formatYearMonth(role.end)}</time>}
                {/* Current roles show no length — it would go stale as time passes. */}
                {role.end !== null && <span className={styles.duration}> · {formatDuration(role.start, role.end)}</span>}
              </p>
              <h2 className={styles.company}>{role.company}</h2>
              <p className={styles.title}>{role.title}</p>
              <p className={styles.line}>{role.line}</p>
            </li>
          ))}
          <li id="scsu" className={`${styles.role} ${styles.school}`} data-active={active === 'scsu'} {...hover('scsu')}>
            <p className={styles.when}>{education.years}</p>
            <h2 className={styles.company}>{education.school}</h2>
            <p className={styles.title}>{education.degree}</p>
            <p className={styles.line}>{education.note}</p>
          </li>
        </ol>
      </div>
    </View>
  );
}
