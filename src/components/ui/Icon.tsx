/**
 * A tiny inline-SVG icon set (stroke icons on a 24-unit grid).
 *
 * Hand-drawn paths instead of an icon library: the site needs about a dozen
 * glyphs, and inlining them costs a few hundred bytes with no extra request
 * and no dependency to maintain. Icons are decorative (aria-hidden) — every
 * control that uses one also has a text label.
 */
import type { SVGProps } from 'react';

const PATHS = {
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7',
  code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  play: 'M7 5v14l11-7z',
  paper: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  github:
    'M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  linkedin: 'M4 9h4v11H4zM6 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM11 9h4v1.7c.6-1 1.9-1.9 3.6-1.9 3 0 3.4 2 3.4 4.6V20h-4v-5.6c0-1.3 0-3-1.8-3S14 12.8 14 14.3V20h-3z',
  scholar: 'M12 3 2 9l10 6 10-6zM6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5',
  mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4',
  folder: 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  chevronDown: 'M6 9l6 6 6-6',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  readonly name: IconName;
  /** Rendered size in px (width = height). */
  readonly size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
