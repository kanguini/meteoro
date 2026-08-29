import { revalidatePath } from 'next/cache';

/**
 * Depois de gravar no painel, o site público tem de reflectir a alteração já.
 * As páginas são pré-renderizadas, por isso é preciso invalidá-las à mão —
 * `layout` apanha a árvore inteira de cada idioma.
 */
export function revalidateSite() {
  revalidatePath('/[locale]', 'layout');
}
