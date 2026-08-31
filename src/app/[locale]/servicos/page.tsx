import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { PlainHero } from '@/components/Blocks';
import { ArrowRight } from '@/components/Icons';
import { isLocale, locales } from '@/i18n';
import { getSiteContent } from '@/lib/content';
import { href, paths, serviceHref, alternatesFor } from '@/lib/routes';

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
    title: content.nav.services,
    description: content.services.hero.lead,
    alternates: alternatesFor(locale, paths.services),
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = await getSiteContent(locale);

  return (
    <PageShell locale={locale} content={content}>
      <PlainHero
        eyebrow={content.services.hero.eyebrow}
        title={content.services.hero.title}
        lead={content.services.hero.lead}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="service-list">
            {content.services.items.map((service, index) => (
              <Reveal key={service.slug} delay={index * 60}>
                <Link href={serviceHref(locale, service.slug)} className="service-row">
                  <span className="service-row__num">{service.number}</span>
                  <h2 className="service-row__title">{service.title}</h2>
                  <p className="service-row__desc">{service.short}</p>
                  <span className="service-row__go" aria-hidden="true">
                    <ArrowRight size={18} />
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
