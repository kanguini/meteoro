'use server';

import { revalidatePath } from 'next/cache';
import { eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';

export async function markRead(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db.update(messages).set({ readAt: new Date() }).where(eq(messages.id, id));
  revalidatePath('/admin/mensagens');
  revalidatePath('/admin');
}

export async function markAllRead() {
  await requireUser();
  await db.update(messages).set({ readAt: new Date() }).where(isNull(messages.readAt));
  revalidatePath('/admin/mensagens');
  revalidatePath('/admin');
}

export async function archiveMessage(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  // Arquivar não apaga: as mensagens ficam para consulta, só saem da lista.
  await db.update(messages).set({ archivedAt: new Date(), readAt: new Date() }).where(eq(messages.id, id));
  revalidatePath('/admin/mensagens');
  revalidatePath('/admin');
}

export async function restoreMessage(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db.update(messages).set({ archivedAt: null }).where(eq(messages.id, id));
  revalidatePath('/admin/mensagens');
}

export async function deleteMessage(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db.delete(messages).where(eq(messages.id, id));
  revalidatePath('/admin/mensagens');
  revalidatePath('/admin');
}
