import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { PlainHero } from '@/components/Blocks';
import { isLocale, locales } from '@/i18n';
import { getJobs, getSiteContent } from '@/lib/content';
import { alternatesFor, paths } from '@/lib/routes';
import { JobList } from './JobList';
import { ApplicationForm } from './ApplicationForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getSiteContent(locale);
  return {
    title: content.nav.careers,
    description: content.careers.hero.lead,
    alternates: alternatesFor(locale, paths.careers),
  };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = await getSiteContent(locale);
  const { careers } = content;
  const jobs = await getJobs(locale);

  return (
    <PageShell locale={locale} content={content}>
      <PlainHero eyebrow={careers.hero.eyebrow} title={careers.hero.title} lead={careers.hero.lead} />

      {/* Porquê a Meteoro 24 */}
      <section className="section section--tight">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--marked eyebrow--red">{careers.why.title}</span>
          </Reveal>
          <div className="value-grid">
            {careers.why.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 60} className="value-card">
                <span className="value-card__num">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="value-card__title" style={{ textTransform: 'none', letterSpacing: '-0.01em' }}>
                  {item.title}
                </h3>
                <p className="value-card__text">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vagas em aberto */}
      <section className="section section--raised" id="vagas">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{careers.jobs.title}</span>
            </Reveal>
            <Reveal className="split__main">
              <p className="lead">{careers.jobs.lead}</p>
            </Reveal>
          </div>

          <JobList jobs={jobs} careers={careers} />
        </div>
      </section>

      {/* Formulário de candidatura */}
      <section className="section" id="candidatura">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{careers.form.title}</span>
              <p className="body-text" style={{ marginTop: '1.5rem' }}>
                {careers.form.lead}
              </p>
            </Reveal>
            <Reveal className="split__main">
              <ApplicationForm careers={careers} jobs={jobs} locale={locale} />
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
