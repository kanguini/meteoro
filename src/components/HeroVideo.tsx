'use client';

import { useEffect, useState } from 'react';

/**
 * Vídeo de fundo do hero que respeita "reduzir movimento".
 *
 * Ao contrário do que o código anterior assumia, os browsers NÃO suspendem o
 * autoplay de vídeo sem som por causa de prefers-reduced-motion. Por isso a
 * decisão é tomada aqui: com movimento reduzido mostramos a imagem estática
 * (poster ou fotografia) em vez do vídeo. Cumpre a WCAG 2.2.2 (Pause/Stop/Hide).
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
  // Assumir movimento reduzido até saber o contrário evita um flash de vídeo
  // em quem pediu para não o ter.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

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
