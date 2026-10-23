/**
 * Publications for the Publications tab — computer science and GIS only.
 *
 * Sources: Google Scholar (book, thesis, IJCA article), the SCSU thesis
 * repository, the résumé (AAG 2021 talk, flood-risk article) and the
 * Amazon listing. The flood-risk article has no public link yet; add one
 * here when it is available.
 */
import { AMAZON_URL } from './profile';
import type { Publication } from './types';

export const SCHOLAR_URL = 'https://scholar.google.com/citations?user=z6AKyKcAAAAJ&hl=en';

/** A paper's Google Scholar record. */
const scholarRecord = (key: string): string =>
  `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=z6AKyKcAAAAJ&citation_for_view=z6AKyKcAAAAJ:${key}`;

export const publications: readonly Publication[] = [
  {
    id: 'book',
    kind: 'Book',
    title: 'Interactive Storytelling Maps Classification: Development of Interactive Storytelling Maps using Mapbox GL JS',
    venue: 'Nasledie Publishing',
    year: '2022',
    image: { id: 'book-cover', alt: 'Cover of the book Interactive Storytelling Maps Classification by Konstantin Biriukov.' },
    links: [{ label: 'Amazon', href: AMAZON_URL, kind: 'book' }],
  },
  {
    id: 'thesis',
    kind: 'Thesis',
    title: 'Storytelling Maps Classification',
    venue: 'Master’s thesis, St. Cloud State University',
    year: '2021',
    links: [
      { label: 'Read', href: 'https://repository.stcloudstate.edu/gp_etds/10/', kind: 'paper' },
      { label: 'Demo site', href: 'https://konstantinbiryukov.github.io/storytelling-classification/', kind: 'live' },
    ],
  },
  {
    id: 'aag-2021',
    kind: 'Talk',
    title: 'Storytelling map classification for web developers',
    venue: 'AAG Annual Meeting',
    year: '2021',
    links: [
      { label: 'Abstract', href: 'https://aag.secure-abstracts.com/AAG%20Annual%20Meeting%202021/abstracts-gallery/50675', kind: 'paper' },
    ],
  },
  {
    id: 'ijca-2021',
    kind: 'Article',
    title: 'Current and Upcoming Challenges of the Main Memory System',
    venue: 'International Journal of Computer Applications',
    year: '2021',
    links: [{ label: 'Scholar', href: scholarRecord('u-x6o8ySG0sC'), kind: 'evidence' }],
  },
  {
    id: 'flooding',
    kind: 'Article',
    title: 'Mapping exposure to flooding — a flood alert system for Malawi',
    venue: 'Journal of Flood Risk Management · co-author',
    year: null,
    links: [],
  },
];
