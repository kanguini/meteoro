import { randomBytes } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
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

/**
 * Verifica a assinatura (magic bytes) do ficheiro contra o tipo declarado. O
 * Content-Type vem do cliente e é falsificável; isto confirma que o conteúdo é
 * mesmo do formato que diz ser, antes de o gravar.
 */
function signatureMatches(buffer: Buffer, mime: string): boolean {
  const startsWith = (bytes: number[], offset = 0) =>
    bytes.every((b, i) => buffer[offset + i] === b);
  const ascii = (text: string, offset: number) =>
    [...text].every((ch, i) => buffer[offset + i] === ch.charCodeAt(0));

  switch (mime) {
    case 'image/jpeg':
      return startsWith([0xff, 0xd8, 0xff]);
    case 'image/png':
      return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/webp':
      return ascii('RIFF', 0) && ascii('WEBP', 8);
    case 'image/avif':
      return ascii('ftyp', 4); // caixa ISO-BMFF; a marca avif vem a seguir
    case 'video/mp4':
    case 'video/quicktime':
      // Ambos são contentores ISO-BMFF: caixa ftyp/moov/mdat logo no início.
      return ascii('ftyp', 4) || ascii('moov', 4) || ascii('mdat', 4);
    case 'video/webm':
      return startsWith([0x1a, 0x45, 0xdf, 0xa3]); // EBML (Matroska/WebM)
    default:
      return false;
  }
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

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!signatureMatches(buffer, file.type)) {
    return { ok: false, error: 'O conteúdo do ficheiro não corresponde ao formato indicado.' };
  }

  const name = safeName(file.name, allowed.extension);

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), buffer);

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

/* ==========================================================================
   Currículos (CVs) — pasta PRIVADA, nunca servida pela rota pública /uploads
   ========================================================================== */

/** Os CVs contêm dados pessoais: ficam fora do alcance da rota pública. */
const CV_DIR = process.env.CV_DIR ? path.resolve(process.env.CV_DIR) : path.join(UPLOAD_DIR, 'cv');

const CV_MAX_BYTES = 5 * 1024 * 1024;

const CV_TYPES = new Map<string, { extension: string; contentType: string }>([
  ['application/pdf', { extension: 'pdf', contentType: 'application/pdf' }],
  ['application/msword', { extension: 'doc', contentType: 'application/msword' }],
  [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    { extension: 'docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  ],
]);

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Confirma que o conteúdo é mesmo do formato indicado, antes de gravar. */
function cvSignatureMatches(buffer: Buffer, extension: string): boolean {
  const ascii = (text: string, offset = 0) => [...text].every((ch, i) => buffer[offset + i] === ch.charCodeAt(0));
  switch (extension) {
    case 'pdf':
      return ascii('%PDF');
    case 'docx':
      // DOCX é um ZIP: começa por "PK\x03\x04".
      return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
    case 'doc':
      // DOC antigo (OLE2): D0 CF 11 E0 A1 B1 1A E1.
      return buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
    default:
      return false;
  }
}

export type CvUploadResult =
  | { ok: true; path: string; filename: string }
  | { ok: false; error: string };

export async function uploadCv(file: File): Promise<CvUploadResult> {
  const byExt = file.name.split('.').pop()?.toLowerCase() ?? '';
  const allowed = CV_TYPES.get(file.type) ?? [...CV_TYPES.values()].find((v) => v.extension === byExt);

  if (!allowed) {
    return { ok: false, error: 'Apenas PDF, DOC ou DOCX são aceites.' };
  }

  if (file.size === 0) {
    return { ok: false, error: 'O ficheiro está vazio.' };
  }

  if (file.size > CV_MAX_BYTES) {
    return { ok: false, error: `O CV tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite é 5 MB.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!cvSignatureMatches(buffer, allowed.extension)) {
    return { ok: false, error: 'O conteúdo do ficheiro não corresponde a um documento válido.' };
  }

  // Nome impossível de adivinhar — impede recolha dos CVs de outros por tentativa.
  const name = `cv-${randomBytes(12).toString('hex')}.${allowed.extension}`;

  try {
    await mkdir(CV_DIR, { recursive: true });
    await writeFile(path.join(CV_DIR, name), buffer);
    return { ok: true, path: name, filename: file.name.slice(0, 200) };
  } catch (error) {
    console.error('[storage] falha a gravar o CV em', CV_DIR, error);
    return { ok: false, error: 'Não foi possível gravar o ficheiro no servidor.' };
  }
}

/** Lê um CV para descarregar no painel. `storagePath` é só o nome do ficheiro. */
export async function readCv(storagePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const name = path.basename(storagePath);
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  const contentType = CONTENT_TYPE_BY_EXT[extension];
  if (!contentType) return null;

  try {
    const buffer = await readFile(path.join(CV_DIR, name));
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export async function deleteCv(storagePath: string): Promise<boolean> {
  if (!storagePath) return true;
  try {
    await unlink(path.join(CV_DIR, path.basename(storagePath)));
    return true;
  } catch (error) {
    console.error('[storage] falha a apagar o CV', storagePath, error);
    return false;
  }
}
