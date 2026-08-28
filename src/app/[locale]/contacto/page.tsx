import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { PlainHero } from '@/components/Blocks';
import { ContactForm } from '@/components/ContactForm';
import { getContent, isLocale, locales } from '@/i18n';
import { href, paths } from '@/lib/routes';
import { site } from '@/lib/site';

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
    title: content.nav.contact,
    description: content.contact.hero.lead,
    alternates: { canonical: href(locale, paths.contact) },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getContent(locale);
  const { contact } = content;

  return (
    <PageShell locale={locale} content={content}>
      <PlainHero eyebrow={contact.hero.eyebrow} title={contact.hero.title} lead={contact.hero.lead} />

      <section className="section section--tight">
        <div className="container contact-grid">
          <Reveal>
            <h2 className="h3">{contact.details.title}</h2>
            <div style={{ marginTop: '2rem' }}>
              <div className="contact-detail">
                <span className="contact-detail__label">{contact.details.phoneLabel}</span>
                <p className="contact-detail__value">
                  <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
                </p>
              </div>
              <div className="contact-detail">
                <span className="contact-detail__label">{contact.details.emailLabel}</span>
                <p className="contact-detail__value">
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </p>
              </div>
              <div className="contact-detail">
                <span className="contact-detail__label">{contact.details.addressLabel}</span>
                <p className="contact-detail__value">
                  {site.address.street}, {site.address.country[locale]}
                </p>
              </div>
              <div className="contact-detail">
                <span className="contact-detail__label">{contact.details.hoursLabel}</span>
                <p className="contact-detail__value">{site.hours[locale]}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ContactForm content={content} />
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
