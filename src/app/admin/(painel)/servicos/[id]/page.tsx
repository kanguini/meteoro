import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media, services, serviceTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead } from '../../ui';
import { ServiceForm, type ServiceFormData } from './ServiceForm';

export const dynamic = 'force-dynamic';

const EMPTY: ServiceFormData = {
  id: '',
  slug: '',
  number: '',
  position: 0,
  published: true,
  image: '',
  imageAltPt: '',
  imageAltEn: '',
  pt: { title: '', short: '', lead: '', body: [], points: [], keywords: [] },
  en: { title: '', short: '', lead: '', body: [], points: [], keywords: [] },
};

export default async function EditarServicoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const library = await db.select({ url: media.url, filename: media.filename }).from(media).limit(60);

  if (id === 'novo') {
    const [last] = await db.select({ position: services.position }).from(services).orderBy(services.position);
    return (
      <>
        <AdminHead
          title="Novo serviço"
          description="O endereço da página é gerado a partir do título português, e pode ser corrigido à mão."
          actions={
            <Link href="/admin/servicos" className="adm-btn adm-btn--ghost">
              Voltar
            </Link>
          }
        />
        <ServiceForm data={{ ...EMPTY, position: (last?.position ?? 0) + 1 }} library={library} />
      </>
    );
  }

  const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  if (!service) notFound();

  const translations = await db
    .select()
    .from(serviceTranslations)
    .where(eq(serviceTranslations.serviceId, service.id));

  const pick = (locale: 'pt' | 'en') => {
    const row = translations.find((item) => item.locale === locale);
    return row
      ? {
          title: row.title,
          short: row.short,
          lead: row.lead,
          body: row.body,
          points: row.points,
          keywords: row.keywords,
        }
      : EMPTY[locale];
  };

  return (
    <>
      <AdminHead
        title={pick('pt').title || 'Serviço'}
        description={`Página pública: /pt/servicos/${service.slug}`}
        actions={
          <Link href="/admin/servicos" className="adm-btn adm-btn--ghost">
            Voltar
          </Link>
        }
      />
      <ServiceForm
        data={{
          id: service.id,
          slug: service.slug,
          number: service.number,
          position: service.position,
          published: service.published,
          image: service.image ?? '',
          imageAltPt: service.imageAltPt,
          imageAltEn: service.imageAltEn,
          pt: pick('pt'),
          en: pick('en'),
        }}
        library={library}
      />
    </>
  );
}
