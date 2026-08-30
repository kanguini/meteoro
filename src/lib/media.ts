/** Utilitários partilhados entre o painel e o site para classificar uma capa. */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];

/** Um endereço fora do site — precisa de tratamento diferente no next/image. */
export function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function isVideo(url: string): boolean {
  if (!url) return false;
  // Ignora query string e âncora antes de olhar para a extensão.
  const clean = url.split(/[?#]/)[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => clean.endsWith(extension));
}

export function mediaKind(url: string): 'video' | 'image' | 'none' {
  if (!url) return 'none';
  return isVideo(url) ? 'video' : 'image';
}
