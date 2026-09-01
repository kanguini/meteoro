import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, jobTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead } from '../../ui';
import { JobForm, type JobFormData } from './JobForm';

export const dynamic = 'force-dynamic';

const EMPTY_T = { title: '', department: '', type: '', location: '', intro: '', sections: [], profile: '' };
const EMPTY: JobFormData = { id: '', slug: '', position: 0, published: true, pt: EMPTY_T, en: EMPTY_T };

export default async function EditarVagaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  if (id === 'nova') {
    const [last] = await db.select({ position: jobs.position }).from(jobs).orderBy(jobs.position);
    return (
      <>
        <AdminHead
          title="Nova vaga"
          description="O endereço é gerado a partir do título português."
          actions={
            <Link href="/admin/vagas" className="adm-btn adm-btn--ghost">
              Voltar
            </Link>
          }
        />
        <JobForm data={{ ...EMPTY, position: (last?.position ?? 0) + 1 }} />
      </>
    );
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) notFound();

  const translations = await db.select().from(jobTranslations).where(eq(jobTranslations.jobId, job.id));
  const pick = (locale: 'pt' | 'en') => {
    const row = translations.find((item) => item.locale === locale);
    return row
      ? {
          title: row.title,
          department: row.department,
          type: row.type,
          location: row.location,
          intro: row.intro,
          sections: row.sections,
          profile: row.profile,
        }
      : EMPTY_T;
  };

  return (
    <>
      <AdminHead
        title={pick('pt').title || 'Vaga'}
        description={`Página pública: /pt/carreiras#${job.slug}`}
        actions={
          <Link href="/admin/vagas" className="adm-btn adm-btn--ghost">
            Voltar
          </Link>
        }
      />
      <JobForm
        data={{
          id: job.id,
          slug: job.slug,
          position: job.position,
          published: job.published,
          pt: pick('pt'),
          en: pick('en'),
        }}
      />
    </>
  );
}
