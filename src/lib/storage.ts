import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

/**
 * Imagens guardadas em disco, no próprio alojamento.
 *
 * A pasta tem de estar FORA do projecto, senão cada deploy apaga tudo o que foi
 * carregado. Define-se em UPLOAD_DIR, por exemplo:
 *
 *   UPLOAD_DIR=/home/u701515205/uploads
 *
 * Sem a variável usa-se ~/uploads em produção e ./uploads em desenvolvimento.
 * Os ficheiros são servidos pela rota /uploads/[...caminho].
 */

/** Vídeo tem limite maior: uma capa em movimento não cabe em 8 MB. */
const MAX_BYTES = { image: 8 * 1024 * 1024, video: 40 * 1024 * 1024 } as const;

const ALLOWED = new Map<string, { extension: string; kind: 'image' | 'video' }>([
  ['image/jpeg', { extension: 'jpg', kind: 'image' }],
  ['image/png', { extension: 'png', kind: 'image' }],
  ['image/webp', { extension: 'webp', kind: 'image' }],
  ['image/avif', { extension: 'avif', kind: 'image' }],
  ['video/mp4', { extension: 'mp4', kind: 'video' }],
  ['video/webm', { extension: 'webm', kind: 'video' }],
  ['video/quicktime', { extension: 'mov', kind: 'video' }],
]);

export const ACCEPT_ATTRIBUTE = [...ALLOWED.keys()].join(',');

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : process.env.NODE_ENV === 'production'
    ? path.join(homedir(), 'uploads')
    : path.join(process.cwd(), 'uploads');

export type UploadResult =
  | { ok: true; url: string; path: string; bytes: number; mimeType: string }
  | { ok: false; error: string };

/** O armazenamento local está sempre disponível — não depende de serviço externo. */
export function storageConfigured(): boolean {
  return true;
}

/** Nome sem acentos nem espaços, com sufixo aleatório para não haver colisões. */
function safeName(filename: string, extension: string): string {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${base || 'imagem'}-${randomBytes(4).toString('hex')}.${extension}`;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const allowed = ALLOWED.get(file.type);
  if (!allowed) {
    return { ok: false, error: 'Formato não aceite. Use JPG, PNG, WebP, AVIF, MP4, WebM ou MOV.' };
  }

  const limit = MAX_BYTES[allowed.kind];
  if (file.size > limit) {
    const size = (file.size / 1024 / 1024).toFixed(1);
    const max = limit / 1024 / 1024;
    return { ok: false, error: `O ficheiro tem ${size} MB. O limite é ${max} MB.` };
  }

  const name = safeName(file.name, allowed.extension);

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));

    return {
      ok: true,
      url: `/uploads/${name}`,
      path: name,
      bytes: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('[storage] falha a gravar a imagem em', UPLOAD_DIR, error);
    return { ok: false, error: 'Não foi possível gravar o ficheiro no servidor.' };
  }
}

export async function deleteImage(storagePath: string): Promise<boolean> {
  // Só o nome do ficheiro: impede que um valor manipulado apague algo fora da pasta.
  const name = path.basename(storagePath);

  try {
    await unlink(path.join(UPLOAD_DIR, name));
    return true;
  } catch (error) {
    console.error('[storage] falha a apagar', name, error);
    return false;
  }
}
