/**
 * Tab configuration: label, accent colour and the place on the map each
 * tab "lives" at. Switching tabs flies the background map camera from one
 * place to the next, so navigating the site feels like moving across a map.
 */
import type { MapView } from '../gl/TerrainRenderer';
import type { TabId } from './routes';

export interface TabConfig {
  readonly id: TabId;
  readonly label: string;
  /** CSS colour; also drives the map lens colour. */
  readonly accent: string;
  readonly view: MapView;
}

/** "#ff6b4a" → [1, 0.42, 0.29] for the shader. */
export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Build a tab entry; `dim` < 1 darkens the map behind text-heavier tabs. */
function tab(id: TabId, label: string, accent: string, x: number, y: number, dim: number, animate: boolean): TabConfig {
  return { id, label, accent, view: { x, y, accent: hexToRgb(accent), dim, animate } };
}

export const TABS: readonly TabConfig[] = [
  tab('about', 'About', '#ff6b4a', 0.35, -0.2, 1, true),
  tab('portfolio', 'Portfolio', '#ffb547', 2.6, 1.3, 0.6, false),
  tab('experience', 'Experience', '#3dd6b5', -1.9, 2.1, 0.6, false),
  tab('skills', 'Skills', '#a594ff', 3.4, -2.4, 0.7, false),
  tab('contacts', 'Contacts', '#c9e265', -2.8, -1.5, 0.6, false),
];

/** Lookup by id (TABS covers every TabId, so this never fails). */
export function tabConfig(id: TabId): TabConfig {
  return TABS.find((t) => t.id === id) ?? (TABS[0] as TabConfig);
}
