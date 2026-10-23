/**
 * Skills tab (#/skills): skill groups as colourful "map layers" — each
 * group a card with its own colour and a legend swatch, skills as chips.
 * No percentages or star ratings.
 */
import { skillGroups } from '../../data/skills';
import { View } from './View';
import styles from './SkillsView.module.css';

export function SkillsView() {
  return (
    <View id="skills" title="Skills">
      <ul className={styles.groups}>
        {skillGroups.map((group, i) => (
          <li key={group.id} className={styles.group} data-tone={i % 6}>
            <h2 className={styles.title}>
              <span className={styles.swatch} aria-hidden="true" />
              {group.title}
            </h2>
            <ul className={styles.skills}>
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </View>
  );
}
