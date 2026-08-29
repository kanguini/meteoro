'use server';

import { db } from '@/db';
import { settings } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { revalidateSite } from '@/lib/revalidate';
import type { ActionState } from '../ui';

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export async function saveSettings(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const phone = text(formData, 'phone');
  const email = text(formData, 'email');
  const slogan = text(formData, 'slogan');
  const coverImage = text(formData, 'coverImage');

  if (!phone || !email || !slogan || !coverImage) {
    return { error: 'Telefone, email, slogan e imagem de capa são obrigatórios.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'O email não é válido.' };
  }

  const values = {
    id: 'singleton',
    phone,
    email,
    addressStreet: text(formData, 'addressStreet'),
    addressCity: text(formData, 'addressCity'),
    slogan,
    hoursPt: text(formData, 'hoursPt'),
    hoursEn: text(formData, 'hoursEn'),
    linkedin: text(formData, 'linkedin'),
    instagram: text(formData, 'instagram'),
    facebook: text(formData, 'facebook'),
    coverImage,
    coverAltPt: text(formData, 'coverAltPt'),
    coverAltEn: text(formData, 'coverAltEn'),
    updatedAt: new Date(),
  };

  try {
    await db.insert(settings).values(values).onConflictDoUpdate({ target: settings.id, set: values });
  } catch (error) {
    console.error('[admin] falha a guardar definições', error);
    return { error: 'Não foi possível guardar. Tente novamente.' };
  }

  revalidateSite();
  return { ok: true, message: 'Definições guardadas e site actualizado.' };
}
