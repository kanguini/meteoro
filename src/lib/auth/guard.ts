import { redirect } from 'next/navigation';
import { getSessionUser, type SessionUser } from './session';

/**
 * Usar no topo de cada página e de cada server action do painel.
 *
 * O middleware só verifica se o cookie existe — não valida nada, porque corre
 * antes de haver acesso à base de dados. A verificação a sério é esta, e tem de
 * ser repetida em cada action: um pedido pode chegar directamente à action sem
 * passar pela página.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

/** Operações reservadas ao dono: gerir utilizadores. */
export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'owner') redirect('/admin');
  return user;
}
