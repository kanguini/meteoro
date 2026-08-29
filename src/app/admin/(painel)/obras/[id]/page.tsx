import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { media, projects, projectTranslations, services, serviceTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead } from '../../ui';
import { ProjectForm, type ProjectFormData } from './ProjectForm';

export const dynamic = 'force-dynamic';

const EMPTY: ProjectFormData = {
  id: '',
  slug: '',
  position: 0,
  published: true,
  year: '',
  client: '',
  location: '',
  coverImage: '',
  gallery: [],
  serviceSlugs: [],
  pt: { title: '', summary: '', body: [] },
  en: { title: '', summary: '', body: [] },
};

export default async function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const [library, serviceRows] = await Promise.all([
    db.select({ url: media.url, filename: media.filename }).from(media).limit(60),
    db
      .select({ slug: services.slug, title: serviceTranslations.title })
      .from(services)
      .leftJoin(serviceTranslations, eq(serviceTranslations.serviceId, services.id))
      .orderBy(asc(services.position)),
  ]);

  const serviceOptions = [...new Map(serviceRows.map((row) => [row.slug, row])).values()].map((row) => ({
    slug: row.slug,
    title: row.title ?? row.slug,
  }));

  if (id === 'nova') {
    const [last] = await db.select({ position: projects.position }).from(projects).orderBy(projects.position);
    return (
      <>
        <AdminHead
          title="Nova obra"
          description="Só aparece no site depois de publicada."
          actions={
            <Link href="/admin/obras" className="adm-btn adm-btn--ghost">
              Voltar
            </Link>
          }
        />
        <ProjectForm
          data={{ ...EMPTY, position: (last?.position ?? 0) + 1 }}
          library={library}
          serviceOptions={serviceOptions}
        />
      </>
    );
  }

  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();

  const translations = await db
    .select()
    .from(projectTranslations)
    .where(eq(projectTranslations.projectId, project.id));

  const pick = (locale: 'pt' | 'en') => {
    const row = translations.find((item) => item.locale === locale);
    return row ? { title: row.title, summary: row.summary, body: row.body } : EMPTY[locale];
  };

  return (
    <>
      <AdminHead
        title={pick('pt').title || 'Obra'}
        description={`Página pública: /pt/obras/${project.slug}`}
        actions={
          <Link href="/admin/obras" className="adm-btn adm-btn--ghost">
            Voltar
          </Link>
        }
      />
      <ProjectForm
        data={{
          id: project.id,
          slug: project.slug,
          position: project.position,
          published: project.published,
          year: project.year,
          client: project.client,
          location: project.location,
          coverImage: project.coverImage ?? '',
          gallery: project.gallery,
          serviceSlugs: project.serviceSlugs,
          pt: pick('pt'),
          en: pick('en'),
        }}
        library={library}
        serviceOptions={serviceOptions}
      />
    </>
  );
}
