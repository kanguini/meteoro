import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { hasAnyUser } from '../setup/actions';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ seguinte?: string }>;
}) {
  // Quem já tem sessão válida não precisa de ver o formulário.
  if (await getSessionUser()) redirect('/admin');

  const { seguinte } = await searchParams;

  // Sem contas criadas, o formulário de entrada não serve para nada — a saída
  // é o arranque. Se a base estiver inacessível seguimos na mesma para o
  // formulário, que dá um erro mais útil ao tentar entrar.
  let needsSetup = false;
  try {
    needsSetup = !(await hasAnyUser());
  } catch {
    needsSetup = false;
  }

  return (
    <div className="admin">
      <div className="admin-login">
        <div className="admin-login__card">
          <p className="admin-login__brand">
            Meteoro<span>.24</span>
          </p>
          <h1 className="admin-login__title">Entrar no painel</h1>
          {needsSetup ? (
            <>
              <p className="adm-note">
                Ainda não existe nenhuma conta. Comece por criar a primeira.
              </p>
              <p style={{ marginTop: '1.25rem' }}>
                <Link href="/admin/setup" className="adm-btn" style={{ width: '100%' }}>
                  Criar a primeira conta
                </Link>
              </p>
            </>
          ) : (
            <LoginForm next={seguinte} />
          )}
        </div>
      </div>
    </div>
  );
}
