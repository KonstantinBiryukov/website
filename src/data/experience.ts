/**
 * Work history for the Experience tab, newest first — one line per role.
 * Source: LinkedIn experience section (titles, dates, descriptions).
 */
import type { Role } from './types';

export const roles: readonly Role[] = [
  {
    id: 'naughty-dog',
    title: 'Development Support',
    company: 'Naughty Dog',
    start: '2026-05',
    end: null,
    line: 'Working on Intergalactic: The Heretic Prophet.',
  },
  {
    id: 'lightbox',
    title: 'Frontend Engineer',
    company: 'LightBox',
    start: '2022-04',
    end: '2026-03',
    line: 'Core mapping team — made maps with millions of polygons 10× faster.',
  },
  {
    id: 'aqueous',
    title: 'Software Engineer',
    company: 'Aqueous',
    start: '2021-10',
    end: '2022-04',
    line: 'Built a report-generation service for a real-estate trading platform.',
  },
  {
    id: 'nrel',
    title: 'Software Engineer',
    company: 'National Renewable Energy Laboratory',
    start: '2021-05',
    end: '2021-09',
    line: 'Foresee™ home energy management — an R&D 100 Award project.',
  },
  {
    id: 'ati',
    title: 'Software Engineer',
    company: 'Advanced Technologies Integration',
    start: '2020-07',
    end: '2020-09',
    line: 'Web CRM for tax resolution firms.',
  },
];

/** Education, shown under the roles. */
export const education = {
  school: 'St. Cloud State University',
  degree: 'Master’s, Computer Science · GIS',
  years: '2019 – 2021',
  note: 'Fulbright scholar',
} as const;

/**
 * Stops on the career map, oldest first. Company/school locations (city
 * centres — public geographic data, used only to draw the chart). `refs`
 * link a stop to roles for hover highlighting.
 */
export interface RouteStop {
  readonly id: string;
  /** Short map label. */
  readonly label: string;
  readonly coordinates: readonly [lat: number, lng: number];
  readonly refs: readonly string[];
}

export const routeStops: readonly RouteStop[] = [
  { id: 'st-cloud', label: 'St. Cloud State · 2019', coordinates: [45.5579, -94.1632], refs: ['scsu'] },
  { id: 'minneapolis', label: 'ATI · 2020', coordinates: [44.9778, -93.265], refs: ['ati'] },
  { id: 'golden', label: 'NREL · 2021', coordinates: [39.7555, -105.2211], refs: ['nrel'] },
  { id: 'los-angeles', label: 'Aqueous · 2021', coordinates: [34.0522, -118.2437], refs: ['aqueous'] },
  { id: 'irvine', label: 'LightBox · 2022', coordinates: [33.6846, -117.8265], refs: ['lightbox'] },
  { id: 'santa-monica', label: 'Naughty Dog · 2026', coordinates: [34.0195, -118.4912], refs: ['naughty-dog'] },
];
