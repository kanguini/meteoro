/**
 * Upload de imagens para o Supabase Storage, pela API REST.
 *
 * Sem SDK de propósito: é um POST e um DELETE, e menos uma dependência para
 * manter. Precisa de três variáveis de ambiente:
 *
 *   SUPABASE_URL          https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY  chave "service_role" (só no servidor, nunca no cliente)
 *   SUPABASE_BUCKET       nome do bucket público (por omissão "meteoro")
 */

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

export type UploadResult =
  | { ok: true; url: string; path: string; bytes: number; mimeType: string }
  | { ok: false; error: string };

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const bucket = process.env.SUPABASE_BUCKET ?? 'meteoro';
  return url && key ? { url: url.replace(/\/$/, ''), key, bucket } : null;
}

export function storageConfigured(): boolean {
  return config() !== null;
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

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || 'imagem'}-${suffix}.${extension}`;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const settings = config();
  if (!settings) {
    return { ok: false, error: 'O armazenamento de imagens não está configurado (SUPABASE_URL e SUPABASE_SERVICE_KEY).' };
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return { ok: false, error: 'Formato não aceite. Use JPG, PNG, WebP ou AVIF.' };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: `A imagem tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite é 8 MB.` };
  }

  const path = safeName(file.name, extension);
  const endpoint = `${settings.url}/storage/v1/object/${settings.bucket}/${path}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.key}`,
        'Content-Type': file.type,
        'x-upsert': 'false',
      },
      body: await file.arrayBuffer(),
    });

    if (!response.ok) {
      console.error('[storage] upload falhou', response.status, await response.text());
      return { ok: false, error: 'O servidor de imagens recusou o ficheiro.' };
    }

    return {
      ok: true,
      url: `${settings.url}/storage/v1/object/public/${settings.bucket}/${path}`,
      path,
      bytes: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('[storage] erro de rede no upload', error);
    return { ok: false, error: 'Não foi possível contactar o servidor de imagens.' };
  }
}

export async function deleteImage(path: string): Promise<boolean> {
  const settings = config();
  if (!settings) return false;

  try {
    const response = await fetch(`${settings.url}/storage/v1/object/${settings.bucket}/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${settings.key}` },
    });
    return response.ok;
  } catch (error) {
    console.error('[storage] erro ao apagar', error);
    return false;
  }
}
