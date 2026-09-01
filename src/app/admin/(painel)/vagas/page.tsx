import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, jobTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { tryQuery } from '@/lib/db-health';
import { AdminHead, Empty, Panel } from '../ui';
import { moveJob } from './actions';

export const dynamic = 'force-dynamic';

export default async function VagasPage() {
  await requireUser();

  const result = await tryQuery(async () => {
    const rows = await db
      .select({
        id: jobs.id,
        slug: jobs.slug,
        published: jobs.published,
        title: jobTranslations.title,
        department: jobTranslations.department,
      })
      .from(jobs)
      .leftJoin(jobTranslations, eq(jobTranslations.jobId, jobs.id))
      .orderBy(asc(jobs.position));

    const unique = new Map<string, (typeof rows)[number]>();
    for (const row of rows) if (!unique.has(row.id)) unique.set(row.id, row);
    return [...unique.values()];
  });

  return (
    <>
      <AdminHead
        title="Vagas"
        description="As vagas em aberto na página de carreiras. A ordem aqui é a ordem no site. Uma vaga oculta desaparece do site e deixa de aceitar candidaturas por essa via."
        actions={
          <Link href="/admin/vagas/nova" className="adm-btn">
            Nova vaga
          </Link>
        }
      />

      {!result.ok ? (
        <Panel title="O que se passa">
          <p className="adm-note adm-note--error">{result.problem}</p>
        </Panel>
      ) : (
        <Panel>
          {result.data.length === 0 ? (
            <Empty>Ainda não há vagas. Corra `npm run db:seed` para carregar as iniciais, ou crie uma nova.</Empty>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Vaga</th>
                  <th style={{ width: '8rem' }}>Estado</th>
                  <th style={{ width: '7rem' }}>Ordem</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/admin/vagas/${row.id}`} className="adm-table__main">
                        {row.title ?? '(sem título)'}
                      </Link>
                      <div className="adm-table__meta">
                        {[row.department, `/carreiras#${row.slug}`].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    <td>
                      <span className={`adm-tag ${row.published ? 'adm-tag--on' : 'adm-tag--off'}`}>
                        {row.published ? 'Publicada' : 'Oculta'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <form action={moveJob}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small" aria-label="Subir">
                            ↑
                          </button>
                        </form>
                        <form action={moveJob}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small" aria-label="Descer">
                            ↓
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}
    </>
  );
}
