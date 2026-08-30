/**
 * Traduz uma falha da base de dados em algo accionável.
 *
 * O painel mostrava um "server error" cego quando o esquema da base não
 * acompanhava o código — tipicamente uma coluna nova ainda por criar. Quem está
 * do outro lado não tem como adivinhar o que falta.
 */

type MysqlError = { code?: string; sqlMessage?: string; message?: string };

export function describeDbError(error: unknown): string {
  const { code, sqlMessage, message } = (error ?? {}) as MysqlError;
  const detail = sqlMessage ?? message ?? '';

  switch (code) {
    case 'ER_BAD_FIELD_ERROR':
      return `A base de dados está desactualizada: falta uma coluna que o site já usa (${detail}). Cole no phpMyAdmin o SQL de instalação mais recente — ele acrescenta o que falta sem apagar nada.`;

    case 'ER_NO_SUCH_TABLE':
      return `Falta uma tabela na base de dados (${detail}). Cole no phpMyAdmin o SQL de instalação.`;

    case 'ER_ACCESS_DENIED_ERROR':
      return 'O utilizador ou a password da base de dados não estão certos. Confirme a DATABASE_URL nas variáveis de ambiente.';

    case 'ER_BAD_DB_ERROR':
      return 'A base de dados indicada na DATABASE_URL não existe. Confirme o nome no hPanel.';

    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
    case 'ENOTFOUND':
      return 'Não foi possível ligar ao servidor de base de dados. Confirme o endereço na DATABASE_URL.';

    default:
      return `A base de dados devolveu um erro${code ? ` (${code})` : ''}. ${detail}`.trim();
  }
}

/**
 * Corre uma leitura e devolve o valor ou a explicação da falha, em vez de
 * deixar a página inteira rebentar.
 */
export async function tryQuery<T>(read: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; problem: string }> {
  try {
    return { ok: true, data: await read() };
  } catch (error) {
    console.error('[painel] leitura falhou', error);
    return { ok: false, problem: describeDbError(error) };
  }
}
