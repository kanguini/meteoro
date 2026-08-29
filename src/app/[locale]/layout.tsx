import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';
import { isLocale, locales, type Locale } from '@/i18n';
import { getSiteContent } from '@/lib/content';
import { site } from '@/lib/site';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#161616',
  width: 'device-width',
  initialScale: 1,
};

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
    metadataBase: new URL(site.url),
    title: {
      default: content.meta.defaultTitle,
      template: content.meta.titleTemplate,
    },
    description: content.meta.defaultDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: locale === 'pt' ? 'pt_AO' : 'en_GB',
      title: content.meta.defaultTitle,
      description: content.meta.defaultDescription,
      url: `/${locale}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const content = await getSiteContent(typedLocale);

  return (
    <html lang={typedLocale === 'pt' ? 'pt-AO' : 'en'} className={archivo.variable}>
      <body>
        <a className="skip-link" href="#main">
          {content.nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
