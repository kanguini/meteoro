import Link from 'next/link';
import { db } from '@/db';
import { pageContent } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead, Panel } from '../ui';
import { CONTENT_PAGES } from './pages';

export const dynamic = 'force-dynamic';

export default async function PaginasPage() {
  await requireUser();

  const edited = await db.select({ page: pageContent.page, updatedAt: pageContent.updatedAt }).from(pageContent);
  const lastEdit = new Map<string, Date>();
  for (const row of edited) {
    const current = lastEdit.get(row.page);
    if (!current || row.updatedAt > current) lastEdit.set(row.page, row.updatedAt);
  }

  return (
    <>
      <AdminHead
        title="Textos das páginas"
        description="Cada secção abre com o português e o inglês lado a lado. O que nunca foi editado mostra o texto original do site."
      />

      <Panel>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Secção</th>
              <th>O que inclui</th>
              <th style={{ width: '12rem' }}>Última alteração</th>
            </tr>
          </thead>
          <tbody>
            {CONTENT_PAGES.map((page) => {
              const updated = lastEdit.get(page.key);
              return (
                <tr key={page.key}>
                  <td>
                    <Link href={`/admin/paginas/${page.key}`} className="adm-table__main">
                      {page.label}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--admin-soft)' }}>{page.description}</td>
                  <td style={{ color: 'var(--admin-faint)' }}>
                    {updated
                      ? updated.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Texto original'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
