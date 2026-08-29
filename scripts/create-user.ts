/**
 * Cria (ou repõe a password de) um utilizador do painel.
 *
 *   npm run admin:create -- --email pessoa@empresa.ao --nome "Nome" --papel owner
 *
 * A password é pedida no terminal e nunca é passada por argumento — os
 * argumentos ficam no histórico da shell e na lista de processos.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { hashPassword, validatePassword } from '../src/lib/auth/password';

const CTRL_C = '\u0003';
const BACKSPACE = '\u007f';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

/** Lê sem ecoar os caracteres, para a password não ficar visível no terminal. */
async function readHidden(prompt: string): Promise<string> {
  stdout.write(prompt);

  const wasRaw = stdin.isRaw;
  stdin.setRawMode?.(true);
  stdin.resume();

  let value = '';
  for await (const chunk of stdin) {
    const text = chunk.toString('utf8');

    if (text === '\r' || text === '\n') break;

    if (text === CTRL_C) {
      stdout.write('\n');
      process.exit(130);
    }

    if (text === BACKSPACE) {
      value = value.slice(0, -1);
      continue;
    }

    value += text;
  }

  stdin.setRawMode?.(wasRaw ?? false);
  stdin.pause();
  stdout.write('\n');
  return value;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não está definida.');
    process.exit(1);
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const email = (arg('email') ?? (await rl.question('Email: '))).trim().toLowerCase();
  const name = arg('nome') ?? (await rl.question('Nome: '));
  const role = (arg('papel') ?? 'editor') as 'owner' | 'editor';
  rl.close();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Email inválido.');
    process.exit(1);
  }

  if (role !== 'owner' && role !== 'editor') {
    console.error('O papel tem de ser "owner" ou "editor".');
    process.exit(1);
  }

  const password = await readHidden('Password: ');
  const confirmation = await readHidden('Confirmar: ');

  if (password !== confirmation) {
    console.error('As passwords não coincidem.');
    process.exit(1);
  }

  const problem = validatePassword(password);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    await db.update(users).set({ passwordHash, name, role, active: true }).where(eq(users.email, email));
    console.log(`Password de ${email} actualizada.`);
  } else {
    await db.insert(users).values({ email, name, role, passwordHash });
    console.log(`Utilizador ${email} criado como ${role}.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Falhou:', error);
  process.exit(1);
});
