import { Header } from './Header';
import { Footer } from './Footer';
import { getSettings } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import type { Content } from '@/i18n/types';

export async function PageShell({
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
  // O rodapé precisa dos contactos em todas as páginas; buscá-los aqui evita
  // repetir a chamada em cada página.
  const settings = await getSettings(locale);

  return (
    <>
      <Header locale={locale} content={content} transparent={transparentHeader} />
      <main id="main">{children}</main>
      <Footer locale={locale} content={content} settings={settings} />
    </>
  );
}
