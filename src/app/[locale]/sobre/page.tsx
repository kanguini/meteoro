import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { Keywords, Pillars, PlainHero } from '@/components/Blocks';
import { ArrowRight } from '@/components/Icons';
import { isLocale, locales } from '@/i18n';
import { getSiteContent } from '@/lib/content';
import { href, paths, alternatesFor } from '@/lib/routes';

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
    title: content.nav.about,
    description: content.about.hero.lead,
    alternates: alternatesFor(locale, paths.about),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = await getSiteContent(locale);
  const { about } = content;

  return (
    <PageShell locale={locale} content={content}>
      <PlainHero eyebrow={about.hero.eyebrow} title={about.hero.title} lead={about.hero.lead} />

      <section className="section section--tight">
        <div className="container">
          <Reveal className="figure">
            <Image
              src="/images/equipa-gabinete.jpg"
              alt={content.services.items[0].image?.alt ?? ''}
              width={2000}
              height={1126}
              sizes="100vw"
              priority
            />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{about.story.title}</span>
            </Reveal>
            <div className="split__main">
              {about.story.body.map((paragraph, index) => (
                <Reveal key={paragraph} delay={index * 90}>
                  <p className={index === 0 ? 'lead' : 'body-text'} style={index > 0 ? { marginTop: '1.5rem' } : undefined}>
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked">{content.home.about.eyebrow}</span>
            </Reveal>
            <div className="split__main">
              <Reveal>
                <h2 className="h2">{about.principle.title}</h2>
              </Reveal>
              {about.principle.body.map((paragraph, index) => (
                <Reveal key={paragraph} delay={100 + index * 80}>
                  <p className="body-text" style={{ marginTop: '1.75rem' }}>
                    {paragraph}
                  </p>
                </Reveal>
              ))}
              <Reveal delay={280}>
                <div style={{ marginTop: '2.5rem' }}>
                  <Keywords items={about.principle.keywords} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <h2 className="h2" style={{ maxWidth: '24ch' }}>
              {about.pillars.title}
            </h2>
          </Reveal>
          <Pillars items={about.pillars.items} />
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
                {content.home.cta.button}
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
