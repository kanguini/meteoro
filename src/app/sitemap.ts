import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { locales } from '@/i18n/config';
import { paths } from '@/lib/routes';
import { getServices } from '@/lib/content';

/**
 * Mapa do site para os dois idiomas. Os serviços vêm da base de dados (ou do
 * fallback estático), por isso um serviço novo entra no sitemap sozinho.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices('pt').catch(() => []);
  const staticPaths = [paths.home, paths.about, paths.services, paths.method, paths.projects, paths.contact];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${site.url}/${[locale, path].filter(Boolean).join('/')}`,
        changeFrequency: 'monthly',
        priority: path === paths.home ? 1 : 0.7,
      });
    }

    for (const service of services) {
      entries.push({
        url: `${site.url}/${locale}/${paths.services}/${service.slug}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
