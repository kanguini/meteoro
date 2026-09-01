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
import { jobs, jobTranslations, pageContent, services, serviceTranslations, settings } from '../src/db/schema';
import { pt } from '../src/i18n/pt';
import { en } from '../src/i18n/en';
import { site } from '../src/lib/site';
import { newId } from '../src/lib/id';
import { SEED_JOBS } from '../src/lib/careers-seed';

const force = process.argv.includes('--force');

const PAGES = ['meta', 'nav', 'common', 'home', 'about', 'method', 'projects', 'careers', 'contact', 'footer'] as const;

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

  await db.insert(settings).values(values).onDuplicateKeyUpdate({ set: values });
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
        await db.insert(pageContent).values(row).onDuplicateKeyUpdate({ set: row });
      } else {
        // MySQL não tem "do nothing"; reescrever a chave por si própria é o
        // equivalente idiomático e deixa a linha existente intacta.
        await db.insert(pageContent).values(row).onDuplicateKeyUpdate({ set: { locale: row.locale } });
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

    // O MySQL não devolve a chave inserida, por isso o identificador é gerado
    // aqui e relido a seguir quando a linha já existia.
    const serviceId = existing[0]?.id ?? newId();

    await db
      .insert(services)
      .values({
        id: serviceId,
        slug: service.slug,
        number: service.number,
        position: index,
        published: true,
        image: service.image?.src ?? null,
        imageAltPt: service.image?.alt ?? '',
        imageAltEn: englishService.image?.alt ?? '',
      })
      .onDuplicateKeyUpdate({
        set: {
          number: service.number,
          position: index,
          image: service.image?.src ?? null,
          imageAltPt: service.image?.alt ?? '',
          imageAltEn: englishService.image?.alt ?? '',
          updatedAt: new Date(),
        },
      });

    for (const [locale, source] of [
      ['pt', service],
      ['en', englishService],
    ] as const) {
      const translation = {
        serviceId,
        locale,
        title: source.title,
        short: source.short,
        lead: source.lead,
        body: source.body,
        points: source.points,
        keywords: source.keywords,
      };

      await db.insert(serviceTranslations).values(translation).onDuplicateKeyUpdate({ set: translation });
    }

    console.log(`· serviço "${service.slug}" carregado`);
  }
}

async function seedJobs() {
  for (const [index, job] of SEED_JOBS.entries()) {
    const existing = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.slug, job.slug));
    if (existing.length > 0 && !force) {
      console.log(`· vaga "${job.slug}" já existe, ignorada`);
      continue;
    }

    const jobId = existing[0]?.id ?? newId();

    await db
      .insert(jobs)
      .values({ id: jobId, slug: job.slug, position: index, published: true })
      .onDuplicateKeyUpdate({ set: { position: index, updatedAt: new Date() } });

    for (const locale of ['pt', 'en'] as const) {
      const t = job[locale];
      const translation = { jobId, locale, ...t };
      await db.insert(jobTranslations).values(translation).onDuplicateKeyUpdate({ set: translation });
    }

    console.log(`· vaga "${job.slug}" carregada`);
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
  await seedJobs();
  console.log('\nFeito.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Falhou:', error);
  process.exit(1);
});
