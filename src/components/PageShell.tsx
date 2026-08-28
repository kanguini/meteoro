import { Header } from './Header';
import { Footer } from './Footer';
import type { Locale } from '@/i18n/config';
import type { Content } from '@/i18n/types';

export function PageShell({
  locale,
  content,
  transparentHeader = false,
  children,
}: {
  locale: Locale;
  content: Content;
  transparentHeader?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header locale={locale} content={content} transparent={transparentHeader} />
      <main id="main">{children}</main>
      <Footer locale={locale} content={content} />
    </>
  );
}
