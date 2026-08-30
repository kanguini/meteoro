import { NextResponse } from 'next/server';
import { db } from '@/db';
import { media } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { uploadImage } from '@/lib/storage';
import { newId } from '@/lib/id';

/**
 * Carrega um ficheiro e devolve o endereço público.
 *
 * Existe além da server action da biblioteca porque o selector de capa vive
 * dentro do formulário das definições — e não se pode aninhar formulários.
 * Daqui o componente chama isto com fetch e preenche o campo com o resultado.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Sessão expirada. Volte a entrar.' }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Nenhum ficheiro recebido.' }, { status: 400 });
  }

  const result = await uploadImage(file);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  try {
    await db.insert(media).values({
      id: newId(),
      url: result.url,
      storagePath: result.path,
      filename: file.name,
      mimeType: result.mimeType,
      bytes: result.bytes,
      uploadedBy: user.id,
    });
  } catch (error) {
    // O ficheiro já está gravado e utilizável; só não entra na biblioteca.
    console.error('[upload] ficheiro gravado mas não registado na biblioteca', error);
  }

  return NextResponse.json({ url: result.url });
}
