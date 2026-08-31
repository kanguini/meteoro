'use server';

import { redirect } from 'next/navigation';
import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { services, serviceTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { revalidateSite } from '@/lib/revalidate';
import { slugify } from '@/lib/slug';
import { newId } from '@/lib/id';
import { locales } from '@/i18n/config';
import type { ActionState } from '../ui';

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function lines(formData: FormData, key: string): string[] {
  return String(formData.get(key) ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Os pontos chegam como pares indexados: pontos.pt.0.title / pontos.pt.0.text */
function points(formData: FormData, locale: string): { title: string; text: string }[] {
  const collected: { title: string; text: string }[] = [];

  for (let index = 0; ; index += 1) {
    const title = formData.get(`pontos.${locale}.${index}.title`);
    const body = formData.get(`pontos.${locale}.${index}.text`);
    if (title === null && body === null) break;

    const cleanTitle = String(title ?? '').trim();
    const cleanText = String(body ?? '').trim();
    // Linha totalmente vazia significa "removido".
    if (cleanTitle || cleanText) collected.push({ title: cleanTitle, text: cleanText });
  }

  return collected;
}

export async function saveService(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = text(formData, 'id');
  const titlePt = text(formData, 'pt.title');
  const titleEn = text(formData, 'en.title');

  if (!titlePt || !titleEn) {
    return { error: 'O título é obrigatório nos dois idiomas.' };
  }

  const slug = slugify(text(formData, 'slug') || titlePt);
  if (!slug) {
    return { error: 'Não foi possível gerar um endereço a partir do título.' };
  }

  // O slug é a morada pública do serviço — não pode repetir-se.
  const clash = await db
    .select({ id: services.id })
    .from(services)
    .where(id ? and(eq(services.slug, slug), ne(services.id, id)) : eq(services.slug, slug))
    .limit(1);

  if (clash.length > 0) {
    return { error: `Já existe um serviço com o endereço "${slug}".` };
  }

  const image = text(formData, 'image');
  const base = {
    slug,
    number: text(formData, 'number') || '00',
    position: Number(text(formData, 'position') || '0'),
    published: formData.get('published') === 'on',
    image: image || null,
    imageAltPt: text(formData, 'imageAltPt'),
    imageAltEn: text(formData, 'imageAltEn'),
    updatedAt: new Date(),
  };

  let serviceId = id;

  try {
    if (id) {
      await db.update(services).set(base).where(eq(services.id, id));
    } else {
      // O identificador é gerado antes de inserir: o MySQL não devolve a chave.
      serviceId = newId();
      await db.insert(services).values({ ...base, id: serviceId });
    }

    for (const locale of locales) {
      const translation = {
        serviceId,
        locale,
        title: text(formData, `${locale}.title`),
        short: text(formData, `${locale}.short`),
        lead: text(formData, `${locale}.lead`),
        body: lines(formData, `${locale}.body`),
        points: points(formData, locale),
        keywords: lines(formData, `${locale}.keywords`),
      };

      await db.insert(serviceTranslations).values(translation).onDuplicateKeyUpdate({ set: translation });
    }
  } catch (error) {
    console.error('[admin] falha a guardar serviço', error);
    return { error: 'Não foi possível guardar. Tente novamente.' };
  }

  revalidateSite();

  if (!id) redirect(`/admin/servicos/${serviceId}`);
  return { ok: true, message: 'Serviço guardado e site actualizado.' };
}

export async function deleteService(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  // Não há chaves estrangeiras, por isso as traduções não desaparecem sozinhas:
  // apagam-se explicitamente, na mesma transação, para não ficarem órfãs.
  await db.transaction(async (tx) => {
    await tx.delete(serviceTranslations).where(eq(serviceTranslations.serviceId, id));
    await tx.delete(services).where(eq(services.id, id));
  });
  revalidateSite();
  redirect('/admin/servicos');
}

export async function moveService(formData: FormData) {
  await requireUser();

  const id = String(formData.get('id') ?? '');
  const direction = String(formData.get('direction') ?? '');
  if (!id || (direction !== 'up' && direction !== 'down')) return;

  const all = await db
    .select({ id: services.id, position: services.position })
    .from(services)
    .orderBy(asc(services.position));

  const index = all.findIndex((row) => row.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= all.length) return;

  // Reescreve as posições todas em sequência: evita empates e buracos que se
  // acumulariam com o tempo se só trocássemos os dois valores.
  const reordered = [...all];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  // Numa transação: uma falha a meio não deixa a ordem parcialmente reescrita.
  await db.transaction(async (tx) => {
    for (const [position, row] of reordered.entries()) {
      await tx.update(services).set({ position }).where(eq(services.id, row.id));
    }
  });

  revalidateSite();
}
