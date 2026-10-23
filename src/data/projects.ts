/**
 * Projects for the Portfolio tab — one line each. `group: 'featured'`
 * projects get a full-width row; `group: 'other'` ones go in the
 * "Other projects" folder below.
 * Sources: the projects' repositories, Devpost, the previous site, résumé.
 */
import { AMAZON_URL } from './profile';
import type { Project } from './types';

export const projects: readonly Project[] = [
  {
    id: 'last-of-us',
    title: 'The Last of Us — The Journey',
    kind: 'personal',
    year: '2026',
    line: 'Follow Joel and Ellie across America on a cinematic 3D map.',
    tags: ['React', 'Mapbox GL', 'Three.js'],
    image: {
      id: 'lou-bus-depot',
      alt: 'The journey map at the Bus Depot chapter in Salt Lake City: Ellie and Joel beside a 3D giraffe on satellite terrain, a story panel with a game still, and the player bar.',
    },
    links: [
      { label: 'Open', href: 'https://konstantinbiryukov.github.io/last-of-us-map/#/', kind: 'live' },
      { label: 'Code', href: 'https://github.com/KonstantinBiryukov/last-of-us-map', kind: 'code' },
    ],
    group: 'featured',
  },
  {
    id: 'storytelling-maps',
    title: 'Storytelling Maps Classification',
    kind: 'research',
    year: '2021',
    line: 'A field guide to storytelling maps — my thesis, then a book.',
    tags: ['Vue 3', 'Mapbox GL', 'D3'],
    image: { id: 'storytelling', alt: 'Street map of downtown Los Angeles with round photo markers of famous buildings.' },
    links: [
      { label: 'Open', href: 'https://konstantinbiryukov.github.io/storytelling-classification/', kind: 'live' },
      { label: 'Book', href: AMAZON_URL, kind: 'book' },
    ],
    group: 'featured',
  },
  {
    id: 'geojobs',
    title: 'GeoJobs',
    kind: 'hackathon',
    year: '2019',
    line: 'Where in the US each programming language is in demand.',
    tags: ['Mapbox', 'D3'],
    award: 'Collins Aerospace Award · HackUIowa',
    image: { id: 'geojobs', alt: 'Map of the United States with job-posting clusters for a programming language.' },
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/geojobs', kind: 'evidence' },
      { label: 'Code', href: 'https://github.com/KonstantinBiryukov/Iowa_hackaton', kind: 'code' },
    ],
    group: 'other',
  },
  {
    id: 'faang-jobs',
    title: 'FAANG Jobs Map',
    kind: 'personal',
    year: '2020',
    line: 'Big-tech job openings, scraped, geocoded and clustered.',
    tags: ['Mapbox GL', 'JavaScript'],
    image: { id: 'faang', alt: 'San Francisco Bay Area map with donut-chart clusters of job postings by company.' },
    links: [
      { label: 'Open', href: 'https://konstantinbiryukov.github.io/geo_jobs/', kind: 'live' },
      { label: 'Code', href: 'https://github.com/KonstantinBiryukov/geo_jobs', kind: 'code' },
    ],
    group: 'other',
  },
  {
    id: 'game-of-grants',
    title: 'Game of Grants',
    kind: 'hackathon',
    year: '2020',
    line: 'Crypto investors funding academic research.',
    tags: ['Angular', 'Ethereum'],
    award: 'dApp & DeFi Track Prize · MIT Bitcoin Expo',
    image: { id: 'game-of-grants', alt: 'Game of Grants landing page.' },
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/gameofgrants', kind: 'evidence' }],
    group: 'other',
  },
  {
    id: 'earthquakes-2020',
    title: 'Earthquakes of 2020',
    kind: 'coursework',
    year: '2020',
    line: 'A month-by-month map of every M6+ earthquake.',
    tags: ['Mapbox GL', 'USGS data'],
    links: [
      { label: 'Open', href: 'https://konstantinbiryukov.github.io/GIS_finalProject/', kind: 'live' },
      { label: 'Code', href: 'https://github.com/KonstantinBiryukov/GIS_finalProject', kind: 'code' },
    ],
    group: 'other',
  },
];

/** Short labels for project kinds. */
export const projectKindLabel: Record<Project['kind'], string> = {
  personal: 'Personal',
  research: 'Research',
  hackathon: 'Hackathon',
  coursework: 'Course',
};
