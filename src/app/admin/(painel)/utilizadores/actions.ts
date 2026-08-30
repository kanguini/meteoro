'use server';

import { revalidatePath } from 'next/cache';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireOwner } from '@/lib/auth/guard';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { destroyAllSessions, getSessionUser } from '@/lib/auth/session';
import { newId } from '@/lib/id';
import type { ActionState } from '../ui';

export async function createUser(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireOwner();

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'editor') as 'owner' | 'editor';

  if (!email || !name) return { error: 'Nome e email são obrigatórios.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'O email não é válido.' };

  const problem = validatePassword(password);
  if (problem) return { error: problem };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return { error: 'Já existe uma conta com esse email.' };

  await db.insert(users).values({
    id: newId(),
    email,
    name,
    role: role === 'owner' ? 'owner' : 'editor',
    passwordHash: await hashPassword(password),
  });

  revalidatePath('/admin/utilizadores');
  return { ok: true, message: `Conta de ${name} criada.` };
}

export async function resetUserPassword(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireOwner();

  const id = String(formData.get('id') ?? '');
  const password = String(formData.get('password') ?? '');
  if (!id) return { error: 'Utilizador não indicado.' };

  const problem = validatePassword(password);
  if (problem) return { error: problem };

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, id));

  // Mudar a password termina as sessões abertas dessa conta noutros dispositivos.
  await destroyAllSessions(id);

  revalidatePath('/admin/utilizadores');
  return { ok: true, message: 'Password alterada. As sessões abertas dessa conta foram terminadas.' };
}

export async function toggleUser(formData: FormData) {
  const owner = await requireOwner();

  const id = String(formData.get('id') ?? '');
  if (!id || id === owner.id) return; // ninguém se desactiva a si próprio

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return;

  // Tem de sobrar sempre pelo menos um dono activo, ou ninguém consegue gerir contas.
  if (user.active && user.role === 'owner') {
    const [owners] = await db.select({ total: count() }).from(users).where(eq(users.role, 'owner'));
    if ((owners?.total ?? 0) <= 1) return;
  }

  await db.update(users).set({ active: !user.active }).where(eq(users.id, id));
  if (user.active) await destroyAllSessions(id);

  revalidatePath('/admin/utilizadores');
}

export async function changeOwnPassword(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Sessão expirada.' };

  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');

  if (password !== confirmation) return { error: 'As passwords não coincidem.' };

  const problem = validatePassword(password);
  if (problem) return { error: problem };

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id));

  return { ok: true, message: 'Password alterada.' };
}
