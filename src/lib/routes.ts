import type { Locale } from '@/i18n/config';

export const paths = {
  home: '',
  about: 'sobre',
  services: 'servicos',
  method: 'metodo',
  projects: 'projectos',
  contact: 'contacto',
} as const;

export function href(locale: Locale, path: string = '', slug?: string): string {
  const parts = ['', locale, path, slug].filter((part) => part !== '' && part !== undefined);
  return parts.join('/') || `/${locale}`;
}

export function serviceHref(locale: Locale, slug: string): string {
  return href(locale, paths.services, slug);
}
