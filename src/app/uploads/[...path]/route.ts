import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { UPLOAD_DIR } from '@/lib/storage';

/**
 * Serve as imagens carregadas pelo painel.
 *
 * A pasta de uploads fica fora do projecto (para sobreviver aos deploys), por
 * isso o Next não a serve como conteúdo estático — é preciso esta rota.
 */

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  // Um único nome de ficheiro, sem pastas: `basename` neutraliza qualquer
  // tentativa de "../" para sair da pasta de uploads.
  const name = path.basename(segments.join('/'));
  const extension = path.extname(name).toLowerCase();
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return new Response('Not found', { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, name);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response('Not found', { status: 404 });

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

    return new Response(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        // O nome tem sufixo aleatório, por isso o conteúdo nunca muda para o
        // mesmo endereço — pode ficar em cache indefinidamente.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
