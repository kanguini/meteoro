import { locales, type Locale } from '@/i18n/config';

export const paths = {
  home: '',
  about: 'sobre',
  services: 'servicos',
  method: 'metodo',
  projects: 'projectos',
  contact: 'contacto',
} as const;

/**
 * Constrói um caminho absoluto: href('pt') -> "/pt", href('pt', 'sobre') -> "/pt/sobre".
 * A barra inicial é obrigatória — sem ela o Next resolve o link relativamente à
 * página actual e /pt/servicos leva a /pt/servicos/pt/metodo.
 */
export function href(locale: Locale, path: string = '', slug?: string): string {
  const segments = [locale, path, slug].filter((segment): segment is string => Boolean(segment));
  return `/${segments.join('/')}`;
}

export function serviceHref(locale: Locale, slug: string): string {
  return href(locale, paths.services, slug);
}

/**
 * Bloco `alternates` para o metadata de uma página: canonical do idioma actual
 * mais hreflang para cada idioma e um x-default. Sem isto o Google não sabe que
 * /pt/metodo e /en/metodo são a mesma página em idiomas diferentes.
 */
export function alternatesFor(locale: Locale, path: string = '', slug?: string) {
  const languages: Record<string, string> = {};
  for (const code of locales) languages[code] = href(code, path, slug);
  languages['x-default'] = href('pt', path, slug);

  return { canonical: href(locale, path, slug), languages };
}
