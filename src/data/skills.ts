/**
 * Skills for the Skills tab, grouped as in Konstantin's résumé (2026 version).
 */
import type { SkillGroup } from './types';

export const skillGroups: readonly SkillGroup[] = [
  { id: 'frontend', title: 'Front-end', skills: ['TypeScript', 'JavaScript', 'React', 'Vue', 'HTML', 'CSS'] },
  { id: 'maps', title: 'Maps', skills: ['Mapbox GL JS', 'Leaflet', 'MapLibre', 'Google Maps', 'Turf.js', 'Geoman'] },
  { id: 'graphics', title: 'Graphics', skills: ['WebGL', 'Three.js', 'GLSL', 'Gaussian Splatting', 'Deck.gl', 'D3', 'GSAP'] },
  { id: 'backend', title: 'Back-end', skills: ['Node.js', 'Express', 'Python', 'Django', 'Java', 'PostgreSQL', 'MySQL'] },
  { id: 'ai', title: 'AI', skills: ['Claude Code', 'Cursor', 'LangChain', 'Ollama', 'n8n'] },
  { id: 'other', title: 'Also', skills: ['Unity / C#', 'C++', 'Docker', 'Jest', 'Cypress', 'Storybook', 'WebSockets'] },
];
