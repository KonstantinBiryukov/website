/**
 * Who Konstantin is, in as few words as possible.
 *
 * Sources: LinkedIn (profile, Featured section and experience, as shared by
 * Konstantin on 2026-10-23), the résumé, the previous site. Contact details
 * are limited to what was already public (email); no phone number.
 */
import type { Profile } from './types';

export const AMAZON_URL = 'https://www.amazon.com/Interactive-Storytelling-Maps-Classification-Development/dp/1735962902';

export const profile: Profile = {
  name: 'Konstantin Biriukov',
  tagline: 'Software engineer · maps, 3D & games',
  intro: 'I build interactive maps and real-time graphics for the web — and now games at Naughty Dog.',

  badges: [
    'Fulbright scholar',
    'Edmund S. Muskie scholar',
    'Leaflet contributor',
    'HackUIowa ’19 winner',
    'MIT Bitcoin Hackathon ’20 winner',
    'R&D 100 Award project',
  ],

  featured: [
    {
      id: 'book',
      kind: 'Book',
      title: 'Interactive Storytelling Maps Classification',
      source: 'Nasledie Publishing · 2022',
      href: AMAZON_URL,
      image: { id: 'book-cover', alt: 'Cover of the book Interactive Storytelling Maps Classification by Konstantin Biriukov.' },
    },
    {
      id: 'esquire',
      kind: 'Interview',
      title: 'A conversation with a geospatial developer',
      source: 'Esquire Kazakhstan · 2024',
      href: 'https://esquire.kz/kazahstancy-v-amerike-razgovor-s-geoprostranstvennym-razrabotchim-iz-ssha',
    },
    {
      id: 'skillbox',
      kind: 'Article',
      title: 'Vue.js: what it is and how it differs from React',
      source: 'Skillbox Media · 2022',
      href: 'https://skillbox.ru/media/code/vuejs-chto-takoe-kak-on-ustroen-i-chem-otlichaetsya-ot-react/',
    },
  ],

  email: 'kostya.igm@gmail.com',
  links: {
    github: 'https://github.com/KonstantinBiryukov',
    linkedin: 'https://www.linkedin.com/in/konstantin-biriukov/',
    scholar: 'https://scholar.google.com/citations?user=z6AKyKcAAAAJ&hl=en',
    // The résumé link already published on the previous site (kept unchanged).
    resume: 'https://drive.google.com/file/d/1AauAhjBg-4sR1A3H4UQnF-VsTR7llS0e',
  },
};
