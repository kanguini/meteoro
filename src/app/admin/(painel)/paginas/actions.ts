'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { pageContent } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { revalidateSite } from '@/lib/revalidate';
import { applyLeaves, type LeafKind } from '@/lib/json-form';
import { getContent } from '@/i18n';
import { locales, type Locale } from '@/i18n/config';
import { isContentPage } from './pages';
import type { ActionState } from '../ui';

export async function savePageContent(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const page = String(formData.get('__page') ?? '');
  if (!isContentPage(page)) {
    return { error: 'Página desconhecida.' };
  }

  // Os campos chegam como "pt::caminho.para.o.texto"; o tipo de cada um vem
  // num campo escondido "kind::caminho", para saber o que é lista e o que é texto.
  const kinds = new Map<string, LeafKind>();
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('kind::')) kinds.set(key.slice(6), String(value) as LeafKind);
  }

  try {
    for (const locale of locales) {
      const entries: { path: string; kind: LeafKind; value: string }[] = [];

      for (const [key, value] of formData.entries()) {
        if (!key.startsWith(`${locale}::`)) continue;
        const path = key.slice(locale.length + 2);
        entries.push({ path, kind: kinds.get(path) ?? 'string', value: String(value) });
      }

      if (entries.length === 0) continue;

      const base = await currentData(locale, page);
      const data = applyLeaves(base, entries);

      const row = { locale, page, data: data as never, updatedAt: new Date() };
      await db.insert(pageContent).values(row).onDuplicateKeyUpdate({ set: row });
    }
  } catch (error) {
    console.error('[admin] falha a guardar textos da página', error);
    return { error: 'Não foi possível guardar. Tente novamente.' };
  }

  revalidateSite();
  return { ok: true, message: 'Textos guardados e site actualizado.' };
}

/** O que está guardado, ou o texto original do site se ainda nunca foi editado. */
async function currentData(locale: Locale, page: string): Promise<unknown> {
  const [row] = await db
    .select({ data: pageContent.data })
    .from(pageContent)
    .where(and(eq(pageContent.locale, locale), eq(pageContent.page, page as never)))
    .limit(1);

  if (row) return row.data;
  return (getContent(locale) as unknown as Record<string, unknown>)[page];
}
