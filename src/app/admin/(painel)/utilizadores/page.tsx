import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireOwner } from '@/lib/auth/guard';
import { AdminHead, Panel } from '../ui';
import { NewUserForm, PasswordResetForm } from './forms';
import { toggleUser } from './actions';

export const dynamic = 'force-dynamic';

export default async function UtilizadoresPage() {
  const owner = await requireOwner();

  const list = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return (
    <>
      <AdminHead
        title="Utilizadores"
        description="Quem tem acesso ao painel. Desactivar uma conta termina imediatamente as sessões abertas dessa pessoa."
      />

      <Panel title="Contas">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Pessoa</th>
              <th style={{ width: '7rem' }}>Papel</th>
              <th style={{ width: '11rem' }}>Última entrada</th>
              <th style={{ width: '20rem' }}>Password</th>
              <th style={{ width: '9rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="adm-table__main">{user.name}</div>
                  <div className="adm-table__meta">{user.email}</div>
                </td>
                <td>
                  <span className="adm-tag">{user.role === 'owner' ? 'Dono' : 'Editor'}</span>
                </td>
                <td style={{ color: 'var(--admin-faint)' }}>
                  {user.lastLoginAt
                    ? user.lastLoginAt.toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Nunca entrou'}
                </td>
                <td>
                  <PasswordResetForm userId={user.id} />
                </td>
                <td>
                  {user.id === owner.id ? (
                    <span className="adm-tag adm-tag--on">Você</span>
                  ) : (
                    <form action={toggleUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <button
                        type="submit"
                        className={`adm-btn adm-btn--small ${user.active ? 'adm-btn--danger' : 'adm-btn--ghost'}`}
                      >
                        {user.active ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Nova conta">
        <NewUserForm />
      </Panel>
    </>
  );
}
