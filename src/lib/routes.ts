import type { Locale } from '@/i18n/config';

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
