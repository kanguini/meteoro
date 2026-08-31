'use server';

import { redirect } from 'next/navigation';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, safeEqualString, validatePassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { newId } from '@/lib/id';

export type SetupState = { error?: string };

/** Há contas criadas? Enquanto não houver, o arranque está disponível. */
export async function hasAnyUser(): Promise<boolean> {
  const [row] = await db.select({ total: count() }).from(users);
  return (row?.total ?? 0) > 0;
}

export async function createFirstUser(_previous: SetupState, formData: FormData): Promise<SetupState> {
  // Duas travas independentes. A primeira fecha-se sozinha e para sempre assim
  // que existir uma conta; a segunda protege a janela entre pôr o site no ar e
  // a primeira entrada, em que qualquer pessoa poderia reclamar o painel.
  if (await hasAnyUser()) {
    return { error: 'O painel já tem contas criadas. Use a página de entrada.' };
  }

  const expected = process.env.SETUP_TOKEN;
  if (!expected) {
    return { error: 'Falta definir SETUP_TOKEN nas variáveis de ambiente do alojamento.' };
  }

  if (!safeEqualString(String(formData.get('token') ?? ''), expected)) {
    return { error: 'Código de instalação incorrecto.' };
  }

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');

  if (!name || !email) return { error: 'Preencha o nome e o email.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'O email não é válido.' };
  if (password !== confirmation) return { error: 'As passwords não coincidem.' };

  const problem = validatePassword(password);
  if (problem) return { error: problem };

  const id = newId();

  try {
    await db.insert(users).values({
      id,
      email,
      name,
      role: 'owner',
      passwordHash: await hashPassword(password),
    });
  } catch (error) {
    console.error('[setup] falha a criar a primeira conta', error);
    return { error: 'Não foi possível criar a conta. A base de dados está acessível?' };
  }

  // Confirma que a conta ficou mesmo criada antes de abrir sessão.
  const [created] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
  if (!created) return { error: 'A conta não foi gravada. Verifique a ligação à base de dados.' };

  await createSession(id);
  redirect('/admin');
}
