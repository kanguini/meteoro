import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __meteoroSql: ReturnType<typeof postgres> | undefined;
}

let instance: Database | undefined;

/**
 * A ligação é criada à primeira utilização, nunca no import.
 *
 * Criá-la no topo do módulo fazia o `next build` falhar sem DATABASE_URL: o
 * módulo é importado ao recolher os dados das páginas e rebentava antes de
 * qualquer guarda poder decidir usar o conteúdo estático.
 */
function getDb(): Database {
  if (instance) return instance;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL não está definida. O painel e o conteúdo dinâmico precisam dela — ver README.');
  }

  // Em dev o hot reload recria os módulos; sem isto abríamos ligações a cada save.
  const sql =
    globalThis.__meteoroSql ??
    postgres(url, {
      max: 5,
      idle_timeout: 20,
      // O pooler do Supabase (pgbouncer) não suporta prepared statements.
      prepare: false,
    });

  if (process.env.NODE_ENV !== 'production') globalThis.__meteoroSql = sql;

  instance = drizzle(sql, { schema });
  return instance;
}

/**
 * Proxy para manter a escrita `db.select(...)` em todo o código sem obrigar
 * cada chamada a passar por getDb().
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[property];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };

/** true quando há base de dados configurada — o site usa o conteúdo estático sem ela. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
