'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { deleteImage, uploadImage } from '@/lib/storage';
import { newId } from '@/lib/id';
import type { ActionState } from '../ui';

export async function uploadMedia(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) {
    return { error: 'Escolha pelo menos uma imagem.' };
  }

  const failures: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    const result = await uploadImage(file);

    if (!result.ok) {
      failures.push(`${file.name}: ${result.error}`);
      continue;
    }

    await db.insert(media).values({
      id: newId(),
      url: result.url,
      storagePath: result.path,
      filename: file.name,
      mimeType: result.mimeType,
      bytes: result.bytes,
      uploadedBy: user.id,
    });

    uploaded += 1;
  }

  revalidatePath('/admin/imagens');

  if (uploaded === 0) {
    return { error: failures.join(' · ') };
  }

  return {
    ok: true,
    message:
      failures.length > 0
        ? `${uploaded} carregada(s). Falhou: ${failures.join(' · ')}`
        : `${uploaded} imagem(ns) carregada(s).`,
  };
}

export async function removeMedia(formData: FormData) {
  await requireUser();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!row) return;

  // Apaga o ficheiro primeiro; se falhar, o registo fica e pode tentar-se outra
  // vez, em vez de ficar um ficheiro órfão que ninguém consegue remover.
  const removed = await deleteImage(row.storagePath);
  if (!removed) {
    console.warn('[admin] não foi possível apagar o ficheiro no storage:', row.storagePath);
  }

  await db.delete(media).where(eq(media.id, id));
  revalidatePath('/admin/imagens');
}
