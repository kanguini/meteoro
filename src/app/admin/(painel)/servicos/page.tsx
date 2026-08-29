import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { services, serviceTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead, Empty, Panel } from '../ui';
import { moveService } from './actions';

export const dynamic = 'force-dynamic';

export default async function ServicosPage() {
  await requireUser();

  const rows = await db
    .select({
      id: services.id,
      slug: services.slug,
      number: services.number,
      published: services.published,
      title: serviceTranslations.title,
    })
    .from(services)
    .leftJoin(
      serviceTranslations,
      eq(serviceTranslations.serviceId, services.id),
    )
    .orderBy(asc(services.position));

  // O leftJoin traz uma linha por idioma; ficamos com a portuguesa para listar.
  const unique = new Map<string, (typeof rows)[number]>();
  for (const row of rows) if (!unique.has(row.id)) unique.set(row.id, row);
  const list = [...unique.values()];

  return (
    <>
      <AdminHead
        title="Serviços"
        description="A ordem aqui é a ordem no site e no menu. Um serviço despublicado desaparece do site e a sua página deixa de existir."
        actions={
          <Link href="/admin/servicos/novo" className="adm-btn">
            Novo serviço
          </Link>
        }
      />

      <Panel>
        {list.length === 0 ? (
          <Empty>Ainda não há serviços. Corra `npm run db:seed` para carregar os seis originais.</Empty>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '4rem' }}>Nº</th>
                <th>Serviço</th>
                <th style={{ width: '8rem' }}>Estado</th>
                <th style={{ width: '7rem' }}>Ordem</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--admin-red)' }}>{row.number}</td>
                  <td>
                    <Link href={`/admin/servicos/${row.id}`} className="adm-table__main">
                      {row.title ?? '(sem título)'}
                    </Link>
                    <div className="adm-table__meta">/servicos/{row.slug}</div>
                  </td>
                  <td>
                    <span className={`adm-tag ${row.published ? 'adm-tag--on' : 'adm-tag--off'}`}>
                      {row.published ? 'Publicado' : 'Oculto'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <form action={moveService}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small" aria-label="Subir">
                          ↑
                        </button>
                      </form>
                      <form action={moveService}>
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
