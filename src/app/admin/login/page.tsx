import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ seguinte?: string }>;
}) {
  // Quem já tem sessão válida não precisa de ver o formulário.
  if (await getSessionUser()) redirect('/admin');

  const { seguinte } = await searchParams;

  return (
    <div className="admin">
      <div className="admin-login">
        <div className="admin-login__card">
          <p className="admin-login__brand">
            Meteoro<span>.24</span>
          </p>
          <h1 className="admin-login__title">Entrar no painel</h1>
          <LoginForm next={seguinte} />
        </div>
      </div>
    </div>
  );
}
