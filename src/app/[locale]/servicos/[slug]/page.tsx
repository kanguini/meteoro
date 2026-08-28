import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { ImageHero, Keywords, PlainHero } from '@/components/Blocks';
import { ArrowRight } from '@/components/Icons';
import { getContent, isLocale, locales } from '@/i18n';
import { href, paths, serviceHref } from '@/lib/routes';
import { pt } from '@/i18n/pt';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    pt.services.items.map((service) => ({ locale, slug: service.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const content = getContent(locale);
  const service = content.services.items.find((item) => item.slug === slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.short,
    alternates: { canonical: serviceHref(locale, service.slug) },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const content = getContent(locale);
  const items = content.services.items;
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const service = items[index];
  const previous = index > 0 ? items[index - 1] : items[items.length - 1];
  const next = index < items.length - 1 ? items[index + 1] : items[0];

  return (
    <PageShell locale={locale} content={content} transparentHeader={Boolean(service.image)}>
      {service.image ? (
        <ImageHero
          eyebrow={`${service.number} · ${content.nav.services}`}
          title={service.title}
          lead={service.lead}
          image={service.image}
        />
      ) : (
        <PlainHero
          eyebrow={`${service.number} · ${content.nav.services}`}
          title={service.title}
          lead={service.lead}
          aside={
            <div className="service-hero__num" aria-hidden="true" style={{ marginTop: '2.5rem' }}>
              {service.number}
            </div>
          }
        />
      )}

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <Keywords items={service.keywords} />
            </Reveal>
            <div className="split__main">
              {service.body.map((paragraph, position) => (
                <Reveal key={paragraph} delay={position * 90}>
                  <p
                    className={position === 0 ? 'lead' : 'body-text'}
                    style={position > 0 ? { marginTop: '1.5rem' } : undefined}
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="point-list">
            {service.points.map((point, position) => (
              <Reveal key={point.title} className="point" delay={position * 70}>
                <h2 className="point__title">{point.title}</h2>
                <p className="point__text">{point.text}</p>
              </Reveal>
            ))}
          </div>

          {!service.image && (
            <Reveal className="figure">
              <Image
                src="/images/equipa-gabinete.jpg"
                alt={items[0].image?.alt ?? ''}
                width={2000}
                height={1126}
                sizes="100vw"
              />
            </Reveal>
          )}

          <div className="service-pager">
            <Link href={serviceHref(locale, previous.slug)} className="service-pager__item">
              <span className="service-pager__label">{content.common.previousService}</span>
              <span className="service-pager__title">{previous.title}</span>
            </Link>
            <Link href={serviceHref(locale, next.slug)} className="service-pager__item">
              <span className="service-pager__label">{content.common.nextService}</span>
              <span className="service-pager__title">{next.title}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--dark section--tight">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--marked">{content.home.cta.eyebrow}</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="h2" style={{ maxWidth: '22ch' }}>
              {content.home.cta.title}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href={href(locale, paths.contact)} className="btn btn--red">
                {content.common.talkToUs}
                <ArrowRight />
              </Link>
              <Link href={href(locale, paths.services)} className="btn btn--ghost">
                {content.common.allServices}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
