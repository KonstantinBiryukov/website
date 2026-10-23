/**
 * Contacts tab (#/contacts): email and public profiles as equal buttons.
 * Only details already public on the previous site (no phone number).
 */
import { profile } from '../../data/profile';
import { Icon, type IconName } from '../ui/Icon';
import { View } from './View';
import styles from './ContactsView.module.css';

/** `external` links open in a new tab; mailto: opens the mail app. */
const CHANNELS: readonly { label: string; href: string; icon: IconName; external: boolean }[] = [
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'mail', external: false },
  { label: 'LinkedIn', href: profile.links.linkedin, icon: 'linkedin', external: true },
  { label: 'GitHub', href: profile.links.github, icon: 'github', external: true },
  { label: 'Google Scholar', href: profile.links.scholar, icon: 'scholar', external: true },
  { label: 'Résumé', href: profile.links.resume, icon: 'download', external: true },
];

export function ContactsView() {
  return (
    <View id="contacts" title="Contacts">
      <p className={styles.lede}>Say hi — about maps, graphics, games or anything else.</p>
      <ul className={styles.profiles}>
        {CHANNELS.map((item) => (
          <li key={item.label}>
            <a
              className={styles.profile}
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Icon name={item.icon} size={22} />
              {item.label}
              <Icon name="arrowUpRight" size={16} className={styles.arrow} />
              {item.external && <span className="sr-only"> (opens in a new tab)</span>}
            </a>
          </li>
        ))}
      </ul>
    </View>
  );
}
