'use client';

import { useSyncExternalStore } from 'react';

/**
 * Lê "reduzir movimento" como uma fonte externa, via useSyncExternalStore —
 * o idioma correto para subscrever uma media query sem setState num efeito.
 * No servidor devolve `true` (assume-se movimento reduzido), por isso a primeira
 * pintura mostra a imagem estática e nunca o vídeo a quem o não quer.
 */
function subscribe(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  );
}

/**
 * Vídeo de fundo do hero que respeita "reduzir movimento".
 *
 * Os browsers NÃO suspendem o autoplay de vídeo sem som por causa de
 * prefers-reduced-motion, por isso a decisão é tomada aqui: com movimento
 * reduzido mostra-se a imagem estática (poster ou fotografia). WCAG 2.2.2.
 */
export function HeroVideo({
  src,
  poster,
  alt,
  objectPosition,
}: {
  src: string;
  poster?: string;
  alt?: string;
  objectPosition?: string;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    const still = poster || src;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="hero__video"
        src={still}
        alt={alt || ''}
        style={{ objectPosition: objectPosition ?? 'center' }}
      />
    );
  }

  return (
    <video
      className="hero__video"
      src={src}
      poster={poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt || undefined}
      style={{ objectPosition: objectPosition ?? 'center' }}
    />
  );
}
