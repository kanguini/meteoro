import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { readCv } from '@/lib/storage';

/**
 * Descarrega o CV de uma candidatura. SÓ com sessão de admin — os CVs contêm
 * dados pessoais e nunca são servidos pela rota pública /uploads. O ficheiro é
 * localizado pelo id da candidatura, não pelo nome do ficheiro no URL, por isso
 * não há forma de adivinhar ou enumerar CVs a partir daqui.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const [row] = await db
    .select({ cvPath: applications.cvPath, cvFilename: applications.cvFilename })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  if (!row?.cvPath) return new Response('Not found', { status: 404 });

  const cv = await readCv(row.cvPath);
  if (!cv) return new Response('Not found', { status: 404 });

  // Nome legível para o download; aspas escapadas para não partir o cabeçalho.
  const safeName = (row.cvFilename || 'cv').replace(/["\r\n]/g, '');

  return new Response(new Uint8Array(cv.buffer), {
    headers: {
      'Content-Type': cv.contentType,
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
