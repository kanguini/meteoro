/**
 * Carrega o conteúdo estático actual (pt.ts / en.ts / site.ts) para a base de dados.
 *
 *   npm run db:push    # cria as tabelas
 *   npm run db:seed    # enche-as com o conteúdo que já está no site
 *
 * É idempotente: pode correr-se as vezes que forem precisas. Não toca em
 * registos que já existam — para repor o conteúdo original de raiz, usar
 * `npm run db:seed -- --force`.
 */
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { pageContent, services, serviceTranslations, settings } from '../src/db/schema';
import { pt } from '../src/i18n/pt';
import { en } from '../src/i18n/en';
import { site } from '../src/lib/site';

const force = process.argv.includes('--force');

const PAGES = ['meta', 'nav', 'common', 'home', 'about', 'method', 'projects', 'contact', 'footer'] as const;

async function seedSettings() {
  const existing = await db.select().from(settings).limit(1);

  if (existing.length > 0 && !force) {
    console.log('· definições já existem, ignorado');
    return;
  }

  const values = {
    id: 'singleton',
    phone: site.phone,
    email: site.email,
    addressStreet: site.address.street,
    addressCity: site.address.city,
    slogan: site.slogan,
    hoursPt: site.hours.pt,
    hoursEn: site.hours.en,
    linkedin: site.social.linkedin,
    instagram: site.social.instagram,
    facebook: site.social.facebook,
    coverImage: '/images/hero-obra.jpg',
    coverAltPt: '',
    coverAltEn: '',
    updatedAt: new Date(),
  };

  await db.insert(settings).values(values).onConflictDoUpdate({ target: settings.id, set: values });
  console.log('· definições carregadas');
}

async function seedPages() {
  for (const [locale, content] of [
    ['pt', pt],
    ['en', en],
  ] as const) {
    for (const page of PAGES) {
      const row = {
        locale,
        page,
        // Os serviços vivem em tabelas próprias — o JSON das páginas não os inclui.
        data: (content as unknown as Record<string, unknown>)[page] as never,
        updatedAt: new Date(),
      };

      if (force) {
        await db
          .insert(pageContent)
          .values(row)
          .onConflictDoUpdate({ target: [pageContent.locale, pageContent.page], set: row });
      } else {
        await db.insert(pageContent).values(row).onConflictDoNothing();
      }
    }

    console.log(`· textos ${locale.toUpperCase()} carregados`);
  }
}

async function seedServices() {
  for (const [index, service] of pt.services.items.entries()) {
    const englishService = en.services.items.find((item) => item.slug === service.slug);

    if (!englishService) {
      console.warn(`! serviço "${service.slug}" não tem tradução inglesa, ignorado`);
      continue;
    }

    const existing = await db.select({ id: services.id }).from(services).where(eq(services.slug, service.slug));

    if (existing.length > 0 && !force) {
      console.log(`· serviço "${service.slug}" já existe, ignorado`);
      continue;
    }

    const [row] = await db
      .insert(services)
      .values({
        slug: service.slug,
        number: service.number,
        position: index,
        published: true,
        image: service.image?.src ?? null,
        imageAltPt: service.image?.alt ?? '',
        imageAltEn: englishService.image?.alt ?? '',
      })
      .onConflictDoUpdate({
        target: services.slug,
        set: {
          number: service.number,
          position: index,
          image: service.image?.src ?? null,
          imageAltPt: service.image?.alt ?? '',
          imageAltEn: englishService.image?.alt ?? '',
          updatedAt: new Date(),
        },
      })
      .returning({ id: services.id });

    for (const [locale, source] of [
      ['pt', service],
      ['en', englishService],
    ] as const) {
      const translation = {
        serviceId: row.id,
        locale,
        title: source.title,
        short: source.short,
        lead: source.lead,
        body: source.body,
        points: source.points,
        keywords: source.keywords,
      };

      await db
        .insert(serviceTranslations)
        .values(translation)
        .onConflictDoUpdate({
          target: [serviceTranslations.serviceId, serviceTranslations.locale],
          set: translation,
        });
    }

    console.log(`· serviço "${service.slug}" carregado`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não está definida. Criar .env.local a partir de .env.example.');
    process.exit(1);
  }

  console.log(force ? 'A repor o conteúdo (--force)...' : 'A carregar o conteúdo...');
  await seedSettings();
  await seedPages();
  await seedServices();
  console.log('\nFeito.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Falhou:', error);
  process.exit(1);
});
