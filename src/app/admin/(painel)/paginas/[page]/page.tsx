import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { pageContent } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { getContent } from '@/i18n';
import { deepMerge } from '@/lib/deep-merge';
import { flatten } from '@/lib/json-form';
import { AdminHead } from '../../ui';
import { CONTENT_PAGES, isContentPage } from '../pages';
import { PageContentForm } from './PageContentForm';

export const dynamic = 'force-dynamic';

async function loadData(locale: 'pt' | 'en', page: string): Promise<unknown> {
  const [row] = await db
    .select({ data: pageContent.data })
    .from(pageContent)
    .where(and(eq(pageContent.locale, locale), eq(pageContent.page, page as never)))
    .limit(1);

  // O estático é a base: um campo novo do tipo Content aparece no editor mesmo
  // que o snapshot gravado (anterior a esse campo) não o tenha.
  const staticData = (getContent(locale) as unknown as Record<string, unknown>)[page];
  if (row) return deepMerge(staticData, row.data);
  return staticData;
}

export default async function EditarPaginaPage({ params }: { params: Promise<{ page: string }> }) {
  await requireUser();
  const { page } = await params;
  if (!isContentPage(page)) notFound();

  const definition = CONTENT_PAGES.find((item) => item.key === page)!;
  const [ptData, enData] = await Promise.all([loadData('pt', page), loadData('en', page)]);

  // A estrutura portuguesa manda: é a mesma nos dois idiomas, e é o PT que
  // define quais os campos que existem.
  const ptLeaves = flatten(ptData);
  const enLeaves = new Map(flatten(enData).map((leaf) => [leaf.path, leaf.value]));

  const rows = ptLeaves.map((leaf) => ({
    path: leaf.path,
    kind: leaf.kind,
    pt: leaf.value,
    en: enLeaves.get(leaf.path) ?? '',
  }));

  return (
    <>
      <AdminHead
        title={definition.label}
        description={definition.description}
        actions={
          <Link href="/admin/paginas" className="adm-btn adm-btn--ghost">
            Voltar
          </Link>
        }
      />
      <PageContentForm page={page} rows={rows} />
    </>
  );
}
