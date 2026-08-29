'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession } from '@/lib/auth/session';

export type LoginState = { error?: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('seguinte') ?? '/admin');

  if (!email || !password) {
    return { error: 'Preencha o email e a password.' };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Mensagem igual para email inexistente, password errada e conta desactivada:
  // dizer qual dos três falhou revelaria que emails existem no sistema.
  const genericError = { error: 'Email ou password incorrectos.' };

  if (!user) {
    // Corre a verificação na mesma contra um hash falso, para o tempo de
    // resposta não denunciar se o email existe.
    await verifyPassword(password, 'scrypt$16384$8$1$YWFhYWFhYWFhYWFhYWFhYQ==$YWFhYQ==');
    return genericError;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid || !user.active) return genericError;

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id);

  // Só aceita caminhos internos — "seguinte" vem do URL e podia levar para fora.
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}
