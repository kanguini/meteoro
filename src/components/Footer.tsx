import Link from 'next/link';
import { Logo } from './Logo';
import { href, paths, serviceHref } from '@/lib/routes';
import { site } from '@/lib/site';
import type { Settings } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import type { Content } from '@/i18n/types';

export function Footer({
  locale,
  content,
  settings,
}: {
  locale: Locale;
  content: Content;
  settings: Settings;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <Logo />
            <p className="footer__slogan">{settings.slogan}</p>
            <p className="footer__descriptor">{site.descriptor[locale]}</p>
          </div>

          <div>
            <h2 className="footer__heading">{content.footer.sections.company}</h2>
            <ul className="footer__list">
              <li>
                <Link href={href(locale, paths.about)}>{content.nav.about}</Link>
              </li>
              <li>
                <Link href={href(locale, paths.method)}>{content.nav.method}</Link>
              </li>
              <li>
                <Link href={href(locale, paths.projects)}>{content.nav.projects}</Link>
              </li>
              <li>
                <Link href={href(locale, paths.careers)}>{content.nav.careers}</Link>
              </li>
              <li>
                <Link href={href(locale, paths.contact)}>{content.nav.contact}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer__heading">{content.footer.sections.services}</h2>
            <ul className="footer__list">
              {content.services.items.map((service) => (
                <li key={service.slug}>
                  <Link href={serviceHref(locale, service.slug)}>{service.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__heading">{content.footer.sections.contact}</h2>
            <ul className="footer__list">
              <li>
                <a href={`tel:${settings.phoneHref}`}>{settings.phone}</a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li>
                {settings.addressCity}, {site.address.country[locale]}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {year} {site.legalName} · {content.footer.rights}
          </span>
          <span>
            {site.descriptor[locale]} · {content.footer.country}
          </span>
        </div>
      </div>
    </footer>
  );
}
