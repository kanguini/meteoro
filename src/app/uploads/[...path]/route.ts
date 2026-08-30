import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { UPLOAD_DIR } from '@/lib/storage';

/**
 * Serve os ficheiros carregados pelo painel.
 *
 * A pasta de uploads fica fora do projecto (para sobreviver aos deploys), por
 * isso o Next não a serve como conteúdo estático — é preciso esta rota.
 *
 * Suporta pedidos parciais (Range). Não é um extra: o Safari recusa-se a
 * reproduzir vídeo servido por quem não responde 206.
 */

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

// O nome tem sufixo aleatório, por isso o conteúdo nunca muda para o mesmo
// endereço — pode ficar em cache indefinidamente.
const CACHE = 'public, max-age=31536000, immutable';

function toWeb(stream: ReturnType<typeof createReadStream>): ReadableStream {
  return Readable.toWeb(stream) as ReadableStream;
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
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

  let size: number;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response('Not found', { status: 404 });
    size = info.size;
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const range = request.headers.get('range');

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());

    if (match) {
      const [, rawStart, rawEnd] = match;
      const start = rawStart ? Number(rawStart) : 0;
      const end = rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
        return new Response('Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${size}` },
        });
      }

      return new Response(toWeb(createReadStream(filePath, { start, end })), {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': CACHE,
        },
      });
    }
  }

  return new Response(toWeb(createReadStream(filePath)), {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': CACHE,
    },
  });
}
