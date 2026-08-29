import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { ArrowLink, ImageHero, Keywords, Pillars, Steps, ValueGrid } from '@/components/Blocks';
import { ArrowRight } from '@/components/Icons';
import { isLocale } from '@/i18n';
import { getSettings, getSiteContent } from '@/lib/content';
import { href, paths, serviceHref } from '@/lib/routes';
import { site } from '@/lib/site';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = await getSiteContent(locale);
  const settings = await getSettings(locale);
  const { home, services } = content;

  return (
    <PageShell locale={locale} content={content} transparentHeader>
      <ImageHero
        large
        eyebrow={home.hero.eyebrow}
        /* O H1 é o slogan da marca — não se traduz. Editável em Definições. */
        title={settings.slogan}
        statement={home.hero.statement.map((line) => (
          <span key={line}>{line}</span>
        ))}
        lead={home.hero.lead}
        image={{
          src: settings.coverImage,
          alt: settings.coverAlt || content.services.items[2]?.image?.alt || '',
        }}
        meta={[`${site.name} · ${site.descriptor[locale]}`, `${content.footer.country} · ${site.founded}`]}
        actions={
          <>
            <Link href={href(locale, paths.contact)} className="btn btn--red">
              {home.hero.ctaPrimary}
              <ArrowRight />
            </Link>
            <Link href={href(locale, paths.services)} className="btn btn--ghost">
              {home.hero.ctaSecondary}
            </Link>
          </>
        }
      />

      {/* A obra começa antes do estaleiro */}
      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{home.intro.eyebrow}</span>
            </Reveal>
            <div className="split__main">
              <Reveal>
                <h2 className="h2">{home.intro.title}</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="lead" style={{ marginTop: '1.75rem' }}>
                  {home.intro.lead}
                </p>
              </Reveal>
            </div>
          </div>
          <Pillars items={home.intro.pillars} />
        </div>
      </section>

      {/* A Meteoro 24 */}
      <section className="section section--dark">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked">{home.about.eyebrow}</span>
            </Reveal>
            <div className="split__main">
              <Reveal>
                <h2 className="h2">{home.about.title}</h2>
              </Reveal>
              {home.about.body.map((paragraph, index) => (
                <Reveal key={paragraph} delay={100 + index * 80}>
                  <p className="body-text" style={{ marginTop: '1.75rem' }}>
                    {paragraph}
                  </p>
                </Reveal>
              ))}
              <Reveal delay={220}>
                <div style={{ marginTop: '2.5rem' }}>
                  <Keywords items={home.about.keywords} />
                </div>
              </Reveal>
              <Reveal delay={300}>
                <div style={{ marginTop: '2.5rem' }}>
                  <ArrowLink href={href(locale, paths.about)}>{home.about.cta}</ArrowLink>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{home.services.eyebrow}</span>
            </Reveal>
            <div className="split__main">
              <Reveal>
                <h2 className="h2">{home.services.title}</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="lead" style={{ marginTop: '1.75rem' }}>
                  {home.services.lead}
                </p>
              </Reveal>
            </div>
          </div>

          <div className="service-list">
            {services.items.map((service, index) => (
              <Reveal key={service.slug} delay={index * 60}>
                <Link href={serviceHref(locale, service.slug)} className="service-row">
                  <span className="service-row__num">{service.number}</span>
                  <h3 className="service-row__title">{service.title}</h3>
                  <p className="service-row__desc">{service.short}</p>
                  <span className="service-row__go" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div style={{ marginTop: '2.5rem' }}>
              <ArrowLink href={href(locale, paths.services)}>{home.services.cta}</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Como trabalhamos */}
      <section className="section section--raised">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{home.method.eyebrow}</span>
            </Reveal>
            <div className="split__main">
              <Reveal>
                <h2 className="h2">{home.method.title}</h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="note-bar">{home.method.note}</p>
              </Reveal>
            </div>
          </div>

          <Steps items={content.method.steps} />

          <Reveal delay={120}>
            <div style={{ marginTop: '2.5rem' }}>
              <ArrowLink href={href(locale, paths.method)}>{home.method.cta}</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Valor para o cliente */}
      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{home.value.eyebrow}</span>
            </Reveal>
            <Reveal className="split__main">
              <h2 className="h2">{home.value.title}</h2>
            </Reveal>
          </div>
          <ValueGrid items={home.value.items} />
        </div>
      </section>

      {/* CTA final */}
      <section className="section section--red">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--marked" style={{ color: 'rgba(255,255,255,.75)' }}>
              {home.cta.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="h1" style={{ maxWidth: '20ch' }}>
              {home.cta.title}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="lead" style={{ color: 'rgba(255,255,255,.82)', marginTop: '1.75rem' }}>
              {home.cta.lead}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div style={{ marginTop: '2.75rem' }}>
              <Link href={href(locale, paths.contact)} className="btn btn--ghost">
                {home.cta.button}
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
