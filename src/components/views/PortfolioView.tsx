/**
 * Portfolio tab (#/portfolio): compact cards — the featured projects two
 * in a row, then an "Other projects" folder (a native <details> element,
 * so it is keyboard and screen-reader accessible for free) holding the
 * smaller projects four in a row.
 *
 * Below them, the Publications section.
 *
 * A deep link to a project inside the folder (#/portfolio/geojobs) opens
 * the folder and highlights that tile.
 */
import { useState } from 'react';
import { projectKindLabel, projects } from '../../data/projects';
import type { Project } from '../../data/types';
import { Icon } from '../ui/Icon';
import { Img } from '../ui/Img';
import { SmartLink } from '../ui/SmartLink';
import { Publications } from './Publications';
import { View } from './View';
import styles from './PortfolioView.module.css';

const featured = projects.filter((p) => p.group === 'featured');
const others = projects.filter((p) => p.group === 'other');

export function PortfolioView({ highlight }: { readonly highlight: string | null }) {
  // Start open when the deep-linked project lives in the folder; after that
  // the visitor controls it. (The view remounts on every tab switch, so the
  // initial value is re-evaluated each time the tab opens.)
  const [open, setOpen] = useState(() => others.some((p) => p.id === highlight));

  return (
    <View id="portfolio" title="Portfolio">
      <ul className={styles.featured}>
        {featured.map((project, i) => (
          <ProjectTile key={project.id} project={project} index={i} highlighted={highlight === project.id} />
        ))}
      </ul>

      <details
        className={styles.folder}
        open={open}
        onToggle={(event) => {
          setOpen(event.currentTarget.open);
        }}
      >
        <summary className={styles.folderSummary}>
          <Icon name="folder" size={22} />
          {/* A summary may hold one heading: it makes the folder an outline level. */}
          <h2 className={styles.folderTitle}>Other projects</h2>
          <span className={styles.folderCount}>{others.length}</span>
          <Icon name="chevronDown" size={18} className={styles.folderChevron} />
        </summary>
        <ul className={styles.grid}>
          {others.map((project, i) => (
            <ProjectTile key={project.id} project={project} index={i + featured.length} highlighted={highlight === project.id} />
          ))}
        </ul>
      </details>

      <Publications highlight={highlight} />
    </View>
  );
}

function ProjectTile({ project, index, highlighted }: { readonly project: Project; readonly index: number; readonly highlighted: boolean }) {
  const isFeatured = project.group === 'featured';
  return (
    <li id={project.id} className={styles.tile} data-featured={isFeatured} data-highlight={highlighted} data-tone={index % 5}>
      {project.image !== undefined ? (
        <Img
          id={project.image.id}
          alt={project.image.alt}
          sizes={isFeatured ? '(min-width: 1240px) 590px, (min-width: 700px) 48vw, 92vw' : '(min-width: 1240px) 290px, (min-width: 520px) 46vw, 92vw'}
          className={styles.image}
          priority={index === 0}
        />
      ) : (
        // No screenshot: a coloured contour placeholder instead of a fake image.
        <div className={styles.placeholder} aria-hidden="true" />
      )}
      <div className={styles.body}>
        <p className={styles.meta}>
          <span>{projectKindLabel[project.kind]}</span>
          <span>{project.year}</span>
        </p>
        {/* Featured rows are h2; tiles inside the "Other projects" folder (h2) are h3. */}
        {isFeatured ? <h2 className={styles.title}>{project.title}</h2> : <h3 className={styles.title}>{project.title}</h3>}
        <p className={styles.line}>{project.line}</p>
        {project.award !== undefined && (
          <p className={styles.award}>
            <Icon name="trophy" size={16} />
            {project.award}
          </p>
        )}
        <ul className={styles.tags} aria-label="Built with">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <p className={styles.links}>
          {project.links.map((link) => (
            <SmartLink key={link.href} href={link.href} kind={link.kind} variant="action">
              {link.label}
            </SmartLink>
          ))}
        </p>
      </div>
    </li>
  );
}
