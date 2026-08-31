'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession } from '@/lib/auth/session';
import { clientIp, hit, reset } from '@/lib/rate-limit';

export type LoginState = { error?: string };

// Hash falso com os MESMOS parâmetros e comprimento (64 bytes) de um hash real.
// Usa-se quando o email não existe, para o tempo de resposta não denunciar isso.
// (O anterior tinha 4 bytes e era mais rápido — revelava a diferença.)
const DUMMY_HASH =
  'scrypt$16384$8$1$reHac4ZxR/y0qz/Jv4cm8A==$1dh9mTRsV/rygXvXsM2EKwlLOGijp85oAc9U2QC26Y4wv5iIxZ8VHcfOYFBYmoRErLu3P/4cu93kYgfxS+pNfQ==';

// No máximo 8 tentativas falhadas por IP em 15 minutos.
const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('seguinte') ?? '/admin');

  if (!email || !password) {
    return { error: 'Preencha o email e a password.' };
  }

  // Trava a força bruta antes de tocar na base de dados.
  const ip = await clientIp();
  const gate = hit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!gate.ok) {
    const minutes = Math.ceil(gate.retryAfterSeconds / 60);
    return { error: `Demasiadas tentativas. Tente novamente dentro de ${minutes} min.` };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Mensagem igual para email inexistente, password errada e conta desactivada:
  // dizer qual dos três falhou revelaria que emails existem no sistema.
  const genericError = { error: 'Email ou password incorrectos.' };

  if (!user) {
    // Verificação contra o hash falso para o tempo de resposta ser igual.
    await verifyPassword(password, DUMMY_HASH);
    return genericError;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid || !user.active) return genericError;

  // Login válido: liberta o contador deste IP.
  reset(`login:${ip}`);

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id);

  // Só aceita caminhos internos — "seguinte" vem do URL e podia levar para fora.
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}
