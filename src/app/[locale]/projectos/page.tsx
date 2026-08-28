import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { PlainHero } from '@/components/Blocks';
import { ArrowRight } from '@/components/Icons';
import { getContent, isLocale, locales } from '@/i18n';
import { href, paths, serviceHref } from '@/lib/routes';

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
  const content = getContent(locale);
  return {
    title: content.nav.projects,
    description: content.projects.hero.lead,
    alternates: { canonical: href(locale, paths.projects) },
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getContent(locale);
  const { projects } = content;

  return (
    <PageShell locale={locale} content={content}>
      <PlainHero eyebrow={projects.hero.eyebrow} title={projects.hero.title} lead={projects.hero.lead} />

      <section className="section section--tight">
        <div className="container">
          <Reveal className="notice">
            <h2 className="h4">{projects.notice.title}</h2>
            <p className="body-text">{projects.notice.body}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{projects.typologies.title}</span>
            </Reveal>
            <Reveal className="split__main">
              <p className="lead">{projects.typologies.lead}</p>
            </Reveal>
          </div>

          <div className="typology-grid">
            {content.services.items.map((service, index) => (
              <Reveal key={service.slug} delay={index * 60}>
                <Link
                  href={serviceHref(locale, service.slug)}
                  className={['typology', service.image ? '' : 'typology--plain'].filter(Boolean).join(' ')}
                >
                  {service.image && (
                    <>
                      <Image
                        src={service.image.src}
                        alt={service.image.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                      <span className="typology__scrim" />
                    </>
                  )}
                  <span className="typology__content">
                    <span className="typology__num">{service.number}</span>
                    <span className="typology__title" style={{ display: 'block' }}>
                      {service.title}
                    </span>
                    <span className="typology__text" style={{ display: 'block' }}>
                      {service.short}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--red section--tight">
        <div className="container">
          <Reveal>
            <h2 className="h2" style={{ maxWidth: '22ch' }}>
              {content.home.cta.title}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <div style={{ marginTop: '2.5rem' }}>
              <Link href={href(locale, paths.contact)} className="btn btn--ghost">
                {content.common.talkToUs}
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
