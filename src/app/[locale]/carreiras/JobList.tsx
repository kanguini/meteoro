'use client';

import { useState } from 'react';
import type { Content, JobEntry } from '@/lib/careers-types';

/**
 * Lista de vagas com detalhe expansível. O botão "Candidatar-me" avisa o
 * formulário (evento no window) para pré-seleccionar a vaga e leva o foco até lá.
 */
export function JobList({ jobs, careers }: { jobs: JobEntry[]; careers: Content['careers'] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <div className="careers-empty">
        <p>{careers.jobs.empty}</p>
        <button type="button" className="btn btn--red" onClick={() => selectJob('')}>
          {careers.spontaneous.label}
        </button>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map((job) => {
        const expanded = open === job.slug;
        return (
          <article className="job" key={job.slug} data-open={expanded}>
            <button
              type="button"
              className="job__head"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : job.slug)}
            >
              <span className="job__headings">
                <span className="job__title">{job.title}</span>
                <span className="job__tags">
                  {[job.department, job.type, job.location].filter(Boolean).map((tag) => (
                    <span className="job__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
              <span className="job__toggle" aria-hidden="true">
                {expanded ? '−' : '+'}
              </span>
            </button>

            {expanded && (
              <div className="job__body">
                <p className="job__intro">{job.intro}</p>

                {job.sections.map((section) => (
                  <div className="job__section" key={section.title}>
                    <h4 className="job__section-title">{section.title}</h4>
                    <ul className="job__items">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {job.profile && (
                  <p className="job__profile">
                    <span className="job__profile-label">{careers.jobs.profileLabel}</span> {job.profile}
                  </p>
                )}

                <button type="button" className="btn btn--red" onClick={() => selectJob(job.slug)}>
                  {careers.jobs.apply}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

/** Pré-selecciona a vaga no formulário e leva o foco até lá. */
function selectJob(slug: string) {
  window.dispatchEvent(new CustomEvent('meteoro:apply', { detail: slug }));
  document.getElementById('candidatura')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
