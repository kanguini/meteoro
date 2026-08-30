import { and, count, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { tryQuery } from '@/lib/db-health';
import { AdminNav } from './AdminNav';
import { logout } from '../actions';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Se esta contagem falhar, a página seguinte explica porquê — a casca não
  // pode ser o que derruba o painel inteiro.
  const unreadResult = await tryQuery(async () => {
    const [row] = await db
      .select({ total: count() })
      .from(messages)
      .where(and(isNull(messages.readAt), isNull(messages.archivedAt)));
    return row?.total ?? 0;
  });

  const unread = unreadResult.ok ? unreadResult.data : 0;

  return (
    <div className="admin">
      <div className="admin__layout">
        <aside className="admin-side">
          <p className="admin-side__brand">
            Meteoro<span>.24</span>
          </p>

          <AdminNav unread={unread} isOwner={user.role === 'owner'} />

          <div className="admin-side__foot">
            <div className="admin-side__user">
              <strong>{user.name}</strong>
              <span>{user.role === 'owner' ? 'Dono' : 'Editor'}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small" style={{ width: '100%' }}>
                Sair
              </button>
            </form>
          </div>
        </aside>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
