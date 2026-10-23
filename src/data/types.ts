/**
 * The content model — deliberately small.
 *
 * Every word on the site lives in a typed data file in src/data/ and is
 * rendered by reusable components. To add a project, job or skill, add an
 * entry to the matching file; no JSX needed.
 */

/** A labelled link. `kind` picks the icon. */
export interface Link {
  readonly label: string;
  readonly href: string;
  readonly kind?: 'live' | 'code' | 'paper' | 'book' | 'article' | 'evidence';
}

/** A month-precision date, e.g. "2022-04". */
export type YearMonth = `${number}-${string}`;

/** A responsive image produced by scripts/optimize-images.mjs. */
export interface MediaRef {
  /** Key in src/data/generated/media.json, e.g. "lou-austin". */
  readonly id: string;
  /** Required, descriptive alternative text. */
  readonly alt: string;
}

/** Something to show off on the About tab (book, interview, article). */
export interface Featured {
  readonly id: string;
  readonly kind: 'Book' | 'Interview' | 'Article';
  readonly title: string;
  /** Where it was published, e.g. "Esquire Kazakhstan · 2024". */
  readonly source: string;
  readonly href: string;
  readonly image?: MediaRef;
}

export interface Profile {
  readonly name: string;
  /** One short line under the name. */
  readonly tagline: string;
  /** One short sentence — the whole introduction. */
  readonly intro: string;
  /** Small badges: scholarships, awards, contributions. */
  readonly badges: readonly string[];
  readonly featured: readonly Featured[];
  readonly email: string;
  readonly links: {
    readonly github: string;
    readonly linkedin: string;
    readonly scholar: string;
    readonly resume: string;
  };
}

/** How a project came about, shown as a small tag. */
export type ProjectKind = 'personal' | 'research' | 'hackathon' | 'coursework';

export interface Project {
  /** Stable id; also the deep-link anchor (#/portfolio/<id>). */
  readonly id: string;
  readonly title: string;
  readonly kind: ProjectKind;
  readonly year: string;
  /** One short line. */
  readonly line: string;
  /** Two or three technologies. */
  readonly tags: readonly string[];
  /** Award won, if any (shown as a trophy badge). */
  readonly award?: string;
  readonly image?: MediaRef;
  readonly links: readonly Link[];
  /**
   * `featured` projects get a full-width row (image beside the text,
   * uncropped); `other` projects live in the "Other projects" folder.
   */
  readonly group: 'featured' | 'other';
}

export interface Role {
  readonly id: string;
  readonly title: string;
  readonly company: string;
  readonly start: YearMonth;
  /** `null` = current position. */
  readonly end: YearMonth | null;
  /** One short line. */
  readonly line: string;
}

export interface SkillGroup {
  readonly id: string;
  readonly title: string;
  readonly skills: readonly string[];
}

export interface Publication {
  /** Stable id; also the deep-link anchor (#/publications/<id>). */
  readonly id: string;
  readonly kind: 'Book' | 'Thesis' | 'Talk' | 'Article';
  readonly title: string;
  /** Publisher, journal or event. */
  readonly venue: string;
  /** `null` when the year is not known yet. */
  readonly year: string | null;
  readonly image?: MediaRef;
  readonly links: readonly Link[];
}
