import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { projects, projectTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead, Empty, Panel } from '../ui';
import { moveProject } from './actions';

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  await requireUser();

  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      published: projects.published,
      year: projects.year,
      location: projects.location,
      coverImage: projects.coverImage,
      title: projectTranslations.title,
    })
    .from(projects)
    .leftJoin(
      projectTranslations,
      eq(projectTranslations.projectId, projects.id),
    )
    .orderBy(asc(projects.position));

  const unique = new Map<string, (typeof rows)[number]>();
  for (const row of rows) if (!unique.has(row.id)) unique.set(row.id, row);
  const list = [...unique.values()];

  return (
    <>
      <AdminHead
        title="Obras"
        description="O portefólio. Enquanto não houver obras publicadas, a página pública continua a mostrar as tipologias de intervenção."
        actions={
          <Link href="/admin/obras/nova" className="adm-btn">
            Nova obra
          </Link>
        }
      />

      <Panel>
        {list.length === 0 ? (
          <Empty>Ainda não há obras registadas.</Empty>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '5rem' }}></th>
                <th>Obra</th>
                <th style={{ width: '8rem' }}>Estado</th>
                <th style={{ width: '7rem' }}>Ordem</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.coverImage}
                        alt=""
                        style={{ width: '4rem', height: '3rem', objectFit: 'cover', borderRadius: '2px' }}
                      />
                    ) : (
                      <span
                        style={{ display: 'block', width: '4rem', height: '3rem', background: '#ebebe9', borderRadius: '2px' }}
                      />
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/obras/${row.id}`} className="adm-table__main">
                      {row.title ?? '(sem título)'}
                    </Link>
                    <div className="adm-table__meta">
                      {[row.location, row.year].filter(Boolean).join(' · ') || `/obras/${row.slug}`}
                    </div>
                  </td>
                  <td>
                    <span className={`adm-tag ${row.published ? 'adm-tag--on' : 'adm-tag--off'}`}>
                      {row.published ? 'Publicada' : 'Oculta'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <form action={moveProject}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small" aria-label="Subir">
                          ↑
                        </button>
                      </form>
                      <form action={moveProject}>
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
    </>
  );
}
