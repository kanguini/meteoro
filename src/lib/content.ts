import { and, asc, eq } from 'drizzle-orm';
import { db, hasDatabase } from '@/db';
import { jobs, jobTranslations, pageContent, projects, projectTranslations, services, serviceTranslations, settings } from '@/db/schema';
import { getContent as getStaticContent } from '@/i18n';
import { deepMerge } from '@/lib/deep-merge';
import { site as staticSite } from '@/lib/site';
import { SEED_JOBS, type SeedJobTranslation } from '@/lib/careers-seed';
import type { JobEntry } from '@/lib/careers-types';
export type { JobEntry };
import type { Locale } from '@/i18n/config';
import type { Content, Service } from '@/i18n/types';

export type Settings = {
  phone: string;
  phoneHref: string;
  email: string;
  addressStreet: string;
  addressCity: string;
  slogan: string;
  hours: string;
  social: { linkedin: string; instagram: string; facebook: string };
  coverImage: string;
  coverPoster: string;
  coverAlt: string;
};

export type ProjectEntry = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  year: string;
  client: string;
  location: string;
  coverImage: string | null;
  gallery: { url: string; alt: string }[];
  serviceSlugs: string[];
};

/** O telefone com espaços não serve para href="tel:" — daí a versão compacta. */
function toPhoneHref(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function staticSettings(locale: Locale): Settings {
  return {
    phone: staticSite.phone,
    phoneHref: staticSite.phoneHref,
    email: staticSite.email,
    addressStreet: staticSite.address.street,
    addressCity: staticSite.address.city,
    slogan: staticSite.slogan,
    hours: staticSite.hours[locale],
    social: { ...staticSite.social },
    coverImage: '/images/hero-obra.jpg',
    coverPoster: '',
    coverAlt: '',
  };
}

/**
 * Toda a leitura passa por aqui: sem base de dados — ou com ela em baixo — o
 * site serve o conteúdo estático em vez de rebentar. É o que permite que o
 * `next build` corra sem DATABASE_URL.
 */
async function readOrFallback<T>(read: () => Promise<T>, fallback: () => T, label: string): Promise<T> {
  if (!hasDatabase()) return fallback();

  try {
    return await read();
  } catch (error) {
    console.error(`[content] falha a ler ${label} da base de dados; a usar o conteúdo estático`, error);
    return fallback();
  }
}

export async function getSettings(locale: Locale): Promise<Settings> {
  return readOrFallback(
    async () => {
      const [row] = await db.select().from(settings).limit(1);
      if (!row) return staticSettings(locale);

      return {
        phone: row.phone,
        phoneHref: toPhoneHref(row.phone),
        email: row.email,
        addressStreet: row.addressStreet,
        addressCity: row.addressCity,
        slogan: row.slogan,
        hours: locale === 'pt' ? row.hoursPt : row.hoursEn,
        social: { linkedin: row.linkedin, instagram: row.instagram, facebook: row.facebook },
        coverImage: row.coverImage,
        coverPoster: row.coverPoster,
        coverAlt: locale === 'pt' ? row.coverAltPt : row.coverAltEn,
      };
    },
    () => staticSettings(locale),
    'as definições',
  );
}

export async function getServices(locale: Locale): Promise<Service[]> {
  return readOrFallback(
    async () => {
      const rows = await db
        .select({
          slug: services.slug,
          number: services.number,
          image: services.image,
          altPt: services.imageAltPt,
          altEn: services.imageAltEn,
          title: serviceTranslations.title,
          short: serviceTranslations.short,
          lead: serviceTranslations.lead,
          body: serviceTranslations.body,
          points: serviceTranslations.points,
          keywords: serviceTranslations.keywords,
        })
        .from(services)
        .innerJoin(
          serviceTranslations,
          and(eq(serviceTranslations.serviceId, services.id), eq(serviceTranslations.locale, locale)),
        )
        .where(eq(services.published, true))
        .orderBy(asc(services.position));

      // Base ligada mas sem serviços (nunca semeada, ou todos despublicados):
      // cai para o conteúdo estático em vez de deixar o site sem serviços.
      if (rows.length === 0) return getStaticContent(locale).services.items;

      return rows.map((row) => ({
        slug: row.slug,
        number: row.number,
        title: row.title,
        short: row.short,
        lead: row.lead,
        body: row.body,
        points: row.points,
        keywords: row.keywords,
        image: row.image ? { src: row.image, alt: locale === 'pt' ? row.altPt : row.altEn } : undefined,
      }));
    },
    () => getStaticContent(locale).services.items,
    'os serviços',
  );
}

export async function getProjects(locale: Locale): Promise<ProjectEntry[]> {
  return readOrFallback(
    async () => {
      const rows = await db
        .select({
          slug: projects.slug,
          year: projects.year,
          client: projects.client,
          location: projects.location,
          coverImage: projects.coverImage,
          gallery: projects.gallery,
          serviceSlugs: projects.serviceSlugs,
          title: projectTranslations.title,
          summary: projectTranslations.summary,
          body: projectTranslations.body,
        })
        .from(projects)
        .innerJoin(
          projectTranslations,
          and(eq(projectTranslations.projectId, projects.id), eq(projectTranslations.locale, locale)),
        )
        .where(eq(projects.published, true))
        .orderBy(asc(projects.position));

      return rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        body: row.body,
        year: row.year,
        client: row.client,
        location: row.location,
        coverImage: row.coverImage,
        gallery: row.gallery.map((item) => ({
          url: item.url,
          alt: locale === 'pt' ? item.altPt : item.altEn,
        })),
        serviceSlugs: row.serviceSlugs,
      }));
    },
    () => [],
    'as obras',
  );
}

/**
 * Devolve o `Content` completo do idioma: os textos guardados na base de dados
 * sobrepõem-se ao dicionário estático página a página, por isso uma página ainda
 * não editada continua a servir o texto original.
 */
export async function getSiteContent(locale: Locale): Promise<Content> {
  const base = getStaticContent(locale);

  const merged = await readOrFallback(
    async () => {
      const rows = await db.select().from(pageContent).where(eq(pageContent.locale, locale));
      const next = structuredClone(base) as unknown as Record<string, unknown>;

      for (const row of rows) {
        // Deep-merge, não substituição: um campo em falta no snapshot cai para o
        // valor estático em vez de ficar undefined e partir o render.
        next[row.page] = deepMerge(next[row.page], row.data);
      }

      return next as unknown as Content;
    },
    () => structuredClone(base),
    'os textos das páginas',
  );

  merged.services.items = await getServices(locale);
  return merged;
}

/** Vagas de emprego para o site público, com fallback para as vagas-semente. */
export async function getJobs(locale: Locale): Promise<JobEntry[]> {
  const fallback = (): JobEntry[] =>
    SEED_JOBS.map((job) => {
      const t: SeedJobTranslation = job[locale];
      return { slug: job.slug, ...t };
    });

  return readOrFallback(
    async () => {
      const rows = await db
        .select({
          slug: jobs.slug,
          title: jobTranslations.title,
          department: jobTranslations.department,
          type: jobTranslations.type,
          location: jobTranslations.location,
          intro: jobTranslations.intro,
          sections: jobTranslations.sections,
          profile: jobTranslations.profile,
        })
        .from(jobs)
        .innerJoin(
          jobTranslations,
          and(eq(jobTranslations.jobId, jobs.id), eq(jobTranslations.locale, locale)),
        )
        .where(eq(jobs.published, true))
        .orderBy(asc(jobs.position));

      // Base ligada mas sem vagas é um estado legítimo (não há vagas abertas):
      // devolve lista vazia, ao contrário dos serviços. A página trata o vazio.
      return rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        department: row.department,
        type: row.type,
        location: row.location,
        intro: row.intro,
        sections: row.sections,
        profile: row.profile,
      }));
    },
    fallback,
    'as vagas',
  );
}
