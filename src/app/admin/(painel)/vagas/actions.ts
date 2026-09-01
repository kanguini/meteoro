'use server';

import { redirect } from 'next/navigation';
import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, jobTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { revalidateSite } from '@/lib/revalidate';
import { slugify } from '@/lib/slug';
import { newId as newIdValue } from '@/lib/id';
import { locales } from '@/i18n/config';
import type { ActionState } from '../ui';

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

/** Secções indexadas: seccoes.pt.0.title + seccoes.pt.0.items (uma linha por item) */
function sections(formData: FormData, locale: string): { title: string; items: string[] }[] {
  const out: { title: string; items: string[] }[] = [];
  for (let index = 0; ; index += 1) {
    const title = formData.get(`seccoes.${locale}.${index}.title`);
    const items = formData.get(`seccoes.${locale}.${index}.items`);
    if (title === null && items === null) break;

    const cleanTitle = String(title ?? '').trim();
    const cleanItems = String(items ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (cleanTitle || cleanItems.length > 0) out.push({ title: cleanTitle, items: cleanItems });
  }
  return out;
}

export async function saveJob(_previous: ActionState, formData: FormData): Promise<ActionState> {
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

  const clash = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(id ? and(eq(jobs.slug, slug), ne(jobs.id, id)) : eq(jobs.slug, slug))
    .limit(1);

  if (clash.length > 0) {
    return { error: `Já existe uma vaga com o endereço "${slug}".` };
  }

  const base = {
    slug,
    position: Number(text(formData, 'position') || '0'),
    published: formData.get('published') === 'on',
    updatedAt: new Date(),
  };

  let jobId = id;

  try {
    if (id) {
      await db.update(jobs).set(base).where(eq(jobs.id, id));
    } else {
      jobId = newIdValue();
      await db.insert(jobs).values({ ...base, id: jobId });
    }

    for (const locale of locales) {
      const translation = {
        jobId,
        locale,
        title: text(formData, `${locale}.title`),
        department: text(formData, `${locale}.department`),
        type: text(formData, `${locale}.type`),
        location: text(formData, `${locale}.location`),
        intro: text(formData, `${locale}.intro`),
        sections: sections(formData, locale),
        profile: text(formData, `${locale}.profile`),
      };

      await db.insert(jobTranslations).values(translation).onDuplicateKeyUpdate({ set: translation });
    }
  } catch (error) {
    console.error('[admin] falha a guardar vaga', error);
    return { error: 'Não foi possível guardar. Tente novamente.' };
  }

  revalidateSite();

  if (!id) redirect(`/admin/vagas/${jobId}`);
  return { ok: true, message: 'Vaga guardada e site actualizado.' };
}

export async function deleteJob(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  // Sem FK cascade — as traduções apagam-se explicitamente, na mesma transação.
  // As candidaturas ficam (jobId passa a NULL na leitura), para não perder histórico.
  await db.transaction(async (tx) => {
    await tx.delete(jobTranslations).where(eq(jobTranslations.jobId, id));
    await tx.delete(jobs).where(eq(jobs.id, id));
  });
  revalidateSite();
  redirect('/admin/vagas');
}

export async function moveJob(formData: FormData) {
  await requireUser();

  const id = String(formData.get('id') ?? '');
  const direction = String(formData.get('direction') ?? '');
  if (!id || (direction !== 'up' && direction !== 'down')) return;

  const all = await db.select({ id: jobs.id, position: jobs.position }).from(jobs).orderBy(asc(jobs.position));
  const index = all.findIndex((row) => row.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= all.length) return;

  const reordered = [...all];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await db.transaction(async (tx) => {
    for (const [position, row] of reordered.entries()) {
      await tx.update(jobs).set({ position }).where(eq(jobs.id, row.id));
    }
  });

  revalidateSite();
}
