'use server';

import { redirect } from 'next/navigation';
import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { projects, projectTranslations } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { revalidateSite } from '@/lib/revalidate';
import { slugify } from '@/lib/slug';
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

/** Galeria: campos indexados galeria.0.url / galeria.0.altPt / galeria.0.altEn */
function gallery(formData: FormData): { url: string; altPt: string; altEn: string }[] {
  const items: { url: string; altPt: string; altEn: string }[] = [];

  for (let index = 0; ; index += 1) {
    const url = formData.get(`galeria.${index}.url`);
    if (url === null) break;

    const clean = String(url).trim();
    if (!clean) continue; // linha esvaziada = removida

    items.push({
      url: clean,
      altPt: String(formData.get(`galeria.${index}.altPt`) ?? '').trim(),
      altEn: String(formData.get(`galeria.${index}.altEn`) ?? '').trim(),
    });
  }

  return items;
}

export async function saveProject(_previous: ActionState, formData: FormData): Promise<ActionState> {
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
    .select({ id: projects.id })
    .from(projects)
    .where(id ? and(eq(projects.slug, slug), ne(projects.id, id)) : eq(projects.slug, slug))
    .limit(1);

  if (clash.length > 0) {
    return { error: `Já existe uma obra com o endereço "${slug}".` };
  }

  const cover = text(formData, 'coverImage');
  const base = {
    slug,
    position: Number(text(formData, 'position') || '0'),
    published: formData.get('published') === 'on',
    year: text(formData, 'year'),
    client: text(formData, 'client'),
    location: text(formData, 'location'),
    coverImage: cover || null,
    gallery: gallery(formData),
    serviceSlugs: formData.getAll('serviceSlugs').map(String),
    updatedAt: new Date(),
  };

  let projectId = id;

  try {
    if (id) {
      await db.update(projects).set(base).where(eq(projects.id, id));
    } else {
      const [row] = await db.insert(projects).values(base).returning({ id: projects.id });
      projectId = row.id;
    }

    for (const locale of locales) {
      const translation = {
        projectId,
        locale,
        title: text(formData, `${locale}.title`),
        summary: text(formData, `${locale}.summary`),
        body: lines(formData, `${locale}.body`),
      };

      await db
        .insert(projectTranslations)
        .values(translation)
        .onConflictDoUpdate({
          target: [projectTranslations.projectId, projectTranslations.locale],
          set: translation,
        });
    }
  } catch (error) {
    console.error('[admin] falha a guardar obra', error);
    return { error: 'Não foi possível guardar. Tente novamente.' };
  }

  revalidateSite();

  if (!id) redirect(`/admin/obras/${projectId}`);
  return { ok: true, message: 'Obra guardada e site actualizado.' };
}

export async function deleteProject(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db.delete(projects).where(eq(projects.id, id));
  revalidateSite();
  redirect('/admin/obras');
}

export async function moveProject(formData: FormData) {
  await requireUser();

  const id = String(formData.get('id') ?? '');
  const direction = String(formData.get('direction') ?? '');
  if (!id || (direction !== 'up' && direction !== 'down')) return;

  const all = await db
    .select({ id: projects.id, position: projects.position })
    .from(projects)
    .orderBy(asc(projects.position));

  const index = all.findIndex((row) => row.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= all.length) return;

  const reordered = [...all];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  for (const [position, row] of reordered.entries()) {
    await db.update(projects).set({ position }).where(eq(projects.id, row.id));
  }

  revalidateSite();
}
