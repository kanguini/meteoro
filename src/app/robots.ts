import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // O painel não deve ser rastreado (também tem noindex e X-Robots-Tag).
      disallow: ['/admin', '/api'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
