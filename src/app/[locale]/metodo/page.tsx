import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { PlainHero, Steps, ValueGrid } from '@/components/Blocks';
import { ArrowRight } from '@/components/Icons';
import { isLocale, locales } from '@/i18n';
import { getSiteContent } from '@/lib/content';
import { href, paths } from '@/lib/routes';

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
    title: content.nav.method,
    description: content.method.hero.lead,
    alternates: { canonical: href(locale, paths.method) },
  };
}

export default async function MethodPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = await getSiteContent(locale);
  const { method } = content;

  return (
    <PageShell locale={locale} content={content}>
      <PlainHero eyebrow={method.hero.eyebrow} title={method.hero.title} lead={method.hero.lead} />

      <section className="section section--tight">
        <div className="container">
          <Steps items={method.steps} />
          <Reveal delay={100}>
            <p className="note-bar">{method.note}</p>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <Reveal>
            <h2 className="h2" style={{ maxWidth: '22ch' }}>
              {method.value.title}
            </h2>
          </Reveal>
          <ValueGrid items={method.value.items} />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="split">
            <Reveal className="split__aside">
              <span className="eyebrow eyebrow--marked eyebrow--red">{content.home.services.eyebrow}</span>
            </Reveal>
            <div className="split__main">
              <Reveal>
                <h2 className="h2">{content.home.services.title}</h2>
              </Reveal>
              <Reveal delay={150}>
                <div style={{ marginTop: '2.25rem' }}>
                  <Link href={href(locale, paths.services)} className="btn">
                    {content.common.allServices}
                    <ArrowRight />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
