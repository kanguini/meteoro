import { randomUUID } from 'node:crypto';

/**
 * Identificador para as chaves primárias.
 *
 * O MySQL não tem tipo uuid nem equivalente ao `defaultRandom()` do Postgres, e
 * o Drizzle não consegue devolver a chave de uma linha inserida em MySQL (o
 * `.returning()` é exclusivo do Postgres). Gerar aqui resolve as duas coisas:
 * sabemos o identificador antes de inserir.
 */
export function newId(): string {
  return randomUUID();
}
