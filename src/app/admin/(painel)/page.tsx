import Link from 'next/link';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { media, messages, projects, services, settings } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { mailerConfigured } from '@/lib/mailer';
import { tryQuery } from '@/lib/db-health';
import { AdminHead, Empty, Panel } from './ui';

export const dynamic = 'force-dynamic';

export default async function ResumoPage() {
  const user = await requireUser();

  const result = await tryQuery(async () => {
    const [[unread], [publishedServices], [publishedProjects], [mediaCount], [config], recent] = await Promise.all([
      db
        .select({ total: count() })
        .from(messages)
        .where(and(isNull(messages.readAt), isNull(messages.archivedAt))),
      db.select({ total: count() }).from(services).where(eq(services.published, true)),
      db.select({ total: count() }).from(projects).where(eq(projects.published, true)),
      db.select({ total: count() }).from(media),
      db.select().from(settings).limit(1),
      db.select().from(messages).where(isNull(messages.archivedAt)).orderBy(desc(messages.createdAt)).limit(5),
    ]);

    return { unread, publishedServices, publishedProjects, mediaCount, config, recent };
  });

  if (!result.ok) {
    return (
      <>
        <AdminHead title="Resumo" description="O painel não conseguiu ler a base de dados." />
        <Panel title="O que se passa">
          <p className="adm-note adm-note--error">{result.problem}</p>
          <p className="adm-field__hint" style={{ marginTop: '1rem' }}>
            O site público continua a funcionar: quando a base de dados não responde, ele serve o conteúdo original.
          </p>
        </Panel>
      </>
    );
  }

  const { unread, publishedServices, publishedProjects, mediaCount, config, recent } = result.data;

  const cards = [
    { label: 'Mensagens por ler', value: unread?.total ?? 0, href: '/admin/mensagens' },
    { label: 'Serviços publicados', value: publishedServices?.total ?? 0, href: '/admin/servicos' },
    { label: 'Obras publicadas', value: publishedProjects?.total ?? 0, href: '/admin/obras' },
    { label: 'Imagens na biblioteca', value: mediaCount?.total ?? 0, href: '/admin/imagens' },
  ];

  const warnings: string[] = [];
  if (!config) warnings.push('As definições ainda não foram gravadas — o site está a servir os contactos do código.');
  if (!mailerConfigured()) warnings.push('O envio de email não está configurado: as mensagens ficam guardadas no painel mas ninguém é avisado por email.');

  return (
    <>
      <AdminHead
        title={`Olá, ${user.name.split(' ')[0]}`}
        description="Resumo do site. Tudo o que altera aqui aparece no site público em segundos."
        actions={
          <a className="adm-btn adm-btn--ghost" href="/pt" target="_blank" rel="noreferrer">
            Ver o site
          </a>
        }
      />

      {warnings.length > 0 && (
        <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {warnings.map((warning) => (
            <p className="adm-note adm-note--warn" key={warning}>
              {warning}
            </p>
          ))}
        </div>
      )}

      <div className="admin-grid admin-grid--cards">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-panel" style={{ display: 'block' }}>
            <div style={{ fontSize: '2rem', fontWeight: 300, lineHeight: 1 }}>{card.value}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--admin-soft)' }}>{card.label}</div>
          </Link>
        ))}
      </div>

      <Panel title="Últimas mensagens">
        {recent.length === 0 ? (
          <Empty>Ainda não chegou nenhuma mensagem pelo formulário.</Empty>
        ) : (
          <table className="adm-table">
            <tbody>
              {recent.map((row) => (
                <tr key={row.id} className={!row.readAt ? 'adm-table__row--unread' : undefined}>
                  <td style={{ width: '14rem' }}>
                    <div className="adm-table__main">{row.name}</div>
                    <div className="adm-table__meta">{row.email}</div>
                  </td>
                  <td style={{ color: 'var(--admin-soft)' }}>
                    {row.body.length > 140 ? `${row.body.slice(0, 140)}...` : row.body}
                  </td>
                  <td style={{ width: '8rem', color: 'var(--admin-faint)' }}>
                    {row.createdAt.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
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
