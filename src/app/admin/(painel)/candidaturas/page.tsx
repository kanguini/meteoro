import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { tryQuery } from '@/lib/db-health';
import { AdminHead, Empty, Panel } from '../ui';
import { deleteApplication, markRead, saveNotes, setStatus } from './actions';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  nova: 'Nova',
  em_analise: 'Em análise',
  entrevista: 'Entrevista',
  aceite: 'Aceite',
  recusada: 'Recusada',
};

const STATUS_ORDER = ['nova', 'em_analise', 'entrevista', 'aceite', 'recusada'] as const;

function formatDate(value: Date): string {
  return value.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function CandidaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; sel?: string }>;
}) {
  await requireUser();
  const { estado, sel } = await searchParams;

  const result = await tryQuery(async () => db.select().from(applications).orderBy(desc(applications.createdAt)).limit(300));

  if (!result.ok) {
    return (
      <>
        <AdminHead title="Candidaturas" description="Não foi possível ler as candidaturas." />
        <Panel title="O que se passa">
          <p className="adm-note adm-note--error">{result.problem}</p>
        </Panel>
      </>
    );
  }

  const all = result.data;
  const filtered = estado && estado !== 'all' ? all.filter((row) => row.status === estado) : all;
  const selected = sel ? all.find((row) => row.id === sel) ?? null : null;

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = all.filter((row) => row.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <AdminHead
        title="Candidaturas"
        description="Tudo o que chega pela página de carreiras. O CV só se descarrega aqui, com sessão — nunca é público."
        actions={
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <FilterChip label={`Todas · ${all.length}`} value="all" current={estado ?? 'all'} />
            {STATUS_ORDER.map((s) => (
              <FilterChip key={s} label={`${STATUS_LABEL[s]} · ${counts[s]}`} value={s} current={estado ?? 'all'} />
            ))}
          </div>
        }
      />

      <div className="candidaturas">
        <Panel>
          {filtered.length === 0 ? (
            <Empty>Nenhuma candidatura neste filtro.</Empty>
          ) : (
            <table className="adm-table">
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={!row.readAt ? 'adm-table__row--unread' : undefined}
                    style={sel === row.id ? { background: 'var(--admin-bg)' } : undefined}
                  >
                    <td>
                      <Link
                        href={`/admin/candidaturas?${new URLSearchParams({ ...(estado ? { estado } : {}), sel: row.id })}`}
                        className="adm-table__main"
                      >
                        {row.name}
                      </Link>
                      <div className="adm-table__meta">{row.jobTitle || 'Candidatura espontânea'}</div>
                    </td>
                    <td style={{ width: '9rem' }}>
                      <span className={`adm-tag status-${row.status}`}>{STATUS_LABEL[row.status] ?? row.status}</span>
                    </td>
                    <td style={{ width: '10rem', color: 'var(--admin-faint)' }}>{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {selected && (
          <Panel title="Detalhe da candidatura">
            <Detail app={selected} />
          </Panel>
        )}
      </div>
    </>
  );
}

function FilterChip({ label, value, current }: { label: string; value: string; current: string }) {
  const active = current === value;
  const params = value === 'all' ? '' : `?estado=${value}`;
  return (
    <Link
      href={`/admin/candidaturas${params}`}
      className={`adm-btn adm-btn--small ${active ? '' : 'adm-btn--ghost'}`}
    >
      {label}
    </Link>
  );
}

function Detail({ app }: { app: typeof applications.$inferSelect }) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="admin-grid admin-grid--2">
        <DetailRow label="Nome" value={app.name} />
        <DetailRow label="Email" value={<a href={`mailto:${app.email}`}>{app.email}</a>} />
        <DetailRow label="Telefone" value={app.phone ? <a href={`tel:${app.phone.replace(/[^\d+]/g, '')}`}>{app.phone}</a> : '—'} />
        <DetailRow label="Vaga" value={app.jobTitle || 'Candidatura espontânea'} />
      </div>

      {app.message && (
        <div>
          <span className="adm-field__label">Mensagem</span>
          <p style={{ whiteSpace: 'pre-wrap', color: 'var(--admin-soft)', marginTop: '0.35rem' }}>{app.message}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {app.cvPath ? (
          <a className="adm-btn" href={`/admin/cv/${app.id}`} target="_blank" rel="noreferrer">
            Descarregar CV{app.cvFilename ? ` — ${app.cvFilename}` : ''}
          </a>
        ) : (
          <span className="adm-field__hint">Sem CV anexado.</span>
        )}
        {!app.readAt && (
          <form action={markRead}>
            <input type="hidden" name="id" value={app.id} />
            <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small">
              Marcar como lida
            </button>
          </form>
        )}
      </div>

      <div>
        <span className="adm-field__label">Estado</span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
          {STATUS_ORDER.map((s) => (
            <form action={setStatus} key={s}>
              <input type="hidden" name="id" value={app.id} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                className={`adm-btn adm-btn--small ${app.status === s ? '' : 'adm-btn--ghost'}`}
              >
                {STATUS_LABEL[s]}
              </button>
            </form>
          ))}
        </div>
      </div>

      <form action={saveNotes}>
        <input type="hidden" name="id" value={app.id} />
        <div className="adm-field">
          <label className="adm-field__label" htmlFor="notes">
            Notas internas
          </label>
          <textarea className="adm-textarea" id="notes" name="notes" rows={3} defaultValue={app.notes} />
          <span className="adm-field__hint">Nunca vistas pelo candidato.</span>
        </div>
        <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small" style={{ marginTop: '0.6rem' }}>
          Guardar notas
        </button>
      </form>

      <form action={deleteApplication} className="adm-actions">
        <input type="hidden" name="id" value={app.id} />
        <button type="submit" className="adm-btn adm-btn--danger adm-btn--small">
          Eliminar candidatura
        </button>
        <span className="adm-field__hint">Apaga também o CV do servidor. Irreversível.</span>
      </form>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="adm-field__label">{label}</span>
      <p style={{ marginTop: '0.25rem' }}>{value}</p>
    </div>
  );
}
