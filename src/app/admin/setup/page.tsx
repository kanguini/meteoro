import Link from 'next/link';
import { hasDatabase } from '@/db';
import { SetupForm } from './SetupForm';
import { hasAnyUser } from './actions';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  if (!hasDatabase()) {
    return (
      <div className="admin">
        <div className="admin-login">
          <div className="admin-login__card">
            <p className="admin-login__brand">
              Meteoro<span>.24</span>
            </p>
            <h1 className="admin-login__title">Falta a base de dados</h1>
            <p className="adm-note adm-note--warn">
              A variável DATABASE_URL não está definida nas variáveis de ambiente do alojamento. Sem ela o painel não
              funciona — o site público continua a funcionar normalmente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  let taken = false;
  let unreachable = false;

  try {
    taken = await hasAnyUser();
  } catch (error) {
    console.error('[setup] base de dados inacessível', error);
    unreachable = true;
  }

  return (
    <div className="admin">
      <div className="admin-login">
        <div className="admin-login__card">
          <p className="admin-login__brand">
            Meteoro<span>.24</span>
          </p>

          {unreachable ? (
            <>
              <h1 className="admin-login__title">Não consigo chegar à base de dados</h1>
              <p className="adm-note adm-note--error">
                A DATABASE_URL está definida mas a ligação falhou. Confirme o nome da base, o utilizador e a password
                no hPanel.
              </p>
            </>
          ) : taken ? (
            <>
              <h1 className="admin-login__title">Painel já instalado</h1>
              <p className="adm-note">Esta página só funciona enquanto não existir nenhuma conta.</p>
              <p style={{ marginTop: '1.25rem' }}>
                <Link href="/admin/login" className="adm-btn" style={{ width: '100%' }}>
                  Ir para a entrada
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="admin-login__title">Criar a primeira conta</h1>
              <SetupForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
