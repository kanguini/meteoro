'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { applications, type ApplicationStatus } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { deleteCv } from '@/lib/storage';

const STATUSES: ApplicationStatus[] = ['nova', 'em_analise', 'entrevista', 'aceite', 'recusada'];

function refresh() {
  revalidatePath('/admin/candidaturas');
  revalidatePath('/admin');
}

export async function setStatus(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as ApplicationStatus;
  if (!id || !STATUSES.includes(status)) return;

  // Mudar o estado marca como lida — deixa de estar por triar.
  await db.update(applications).set({ status, readAt: new Date() }).where(eq(applications.id, id));
  refresh();
}

export async function markRead(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await db.update(applications).set({ readAt: new Date() }).where(eq(applications.id, id));
  refresh();
}

export async function saveNotes(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const notes = String(formData.get('notes') ?? '').slice(0, 5000);
  await db.update(applications).set({ notes }).where(eq(applications.id, id));
  refresh();
}

export async function deleteApplication(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  // Apaga o CV do disco antes de remover o registo, para não ficar órfão.
  const [row] = await db.select({ cvPath: applications.cvPath }).from(applications).where(eq(applications.id, id)).limit(1);
  if (row?.cvPath) await deleteCv(row.cvPath);

  await db.delete(applications).where(eq(applications.id, id));
  refresh();
}
