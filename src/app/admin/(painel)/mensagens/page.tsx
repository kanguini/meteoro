import { desc, isNotNull, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { AdminHead, Empty, Panel } from '../ui';
import { archiveMessage, deleteMessage, markAllRead, markRead, restoreMessage } from './actions';

export const dynamic = 'force-dynamic';

function formatDate(value: Date): string {
  return value.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function MensagensPage({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string }>;
}) {
  await requireUser();
  const { ver } = await searchParams;
  const showArchived = ver === 'arquivadas';

  const list = await db
    .select()
    .from(messages)
    .where(showArchived ? isNotNull(messages.archivedAt) : isNull(messages.archivedAt))
    .orderBy(desc(messages.createdAt))
    .limit(200);

  const unread = list.filter((row) => !row.readAt).length;

  return (
    <>
      <AdminHead
        title="Mensagens"
        description="Tudo o que chega pelo formulário de contacto fica guardado aqui, mesmo que o envio por email falhe."
        actions={
          <>
            <a
              className="adm-btn adm-btn--ghost"
              href={showArchived ? '/admin/mensagens' : '/admin/mensagens?ver=arquivadas'}
            >
              {showArchived ? 'Ver activas' : 'Ver arquivadas'}
            </a>
            {!showArchived && unread > 0 && (
              <form action={markAllRead}>
                <button type="submit" className="adm-btn adm-btn--ghost">
                  Marcar todas como lidas
                </button>
              </form>
            )}
          </>
        }
      />

      <Panel>
        {list.length === 0 ? (
          <Empty>{showArchived ? 'Não há mensagens arquivadas.' : 'Ainda não chegou nenhuma mensagem.'}</Empty>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '15rem' }}>De</th>
                <th>Mensagem</th>
                <th style={{ width: '12rem' }}>Recebida</th>
                <th style={{ width: '9rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className={!row.readAt ? 'adm-table__row--unread' : undefined}>
                  <td>
                    <div className="adm-table__main">{row.name}</div>
                    <div className="adm-table__meta">
                      <a href={`mailto:${row.email}`}>{row.email}</a>
                      {row.phone && (
                        <>
                          <br />
                          <a href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}>{row.phone}</a>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    {row.subject && (
                      <div style={{ marginBottom: '0.35rem' }}>
                        <span className="adm-tag">{row.subject}</span>
                        {!row.emailed && (
                          <span className="adm-tag adm-tag--off" style={{ marginLeft: '0.4rem' }}>
                            Email não enviado
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--admin-soft)' }}>{row.body}</div>
                  </td>
                  <td style={{ color: 'var(--admin-faint)' }}>{formatDate(row.createdAt)}</td>
                  <td>
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      {!row.readAt && (
                        <form action={markRead}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small">
                            Marcar lida
                          </button>
                        </form>
                      )}
                      {showArchived ? (
                        <form action={restoreMessage}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small">
                            Restaurar
                          </button>
                        </form>
                      ) : (
                        <form action={archiveMessage}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small">
                            Arquivar
                          </button>
                        </form>
                      )}
                      <form action={deleteMessage}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="adm-btn adm-btn--danger adm-btn--small">
                          Apagar
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
