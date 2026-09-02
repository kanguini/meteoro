import Image from 'next/image';

/**
 * Logótipo oficial da Meteoro (ficheiros fidedignos em public/images).
 *
 * Rende as duas versões e o CSS mostra a certa conforme o fundo: a branca sobre
 * o hero vermelho, o painel móvel e o rodapé (fundos escuros); a escura no
 * cabeçalho sólido (fundo claro). Ver .logo__img em globals.css.
 */
export function Logo() {
  return (
    <span className="logo" aria-label="Meteoro 24">
      <Image
        className="logo__img logo__img--dark"
        src="/images/logo-dark.png"
        alt="Meteoro 24"
        width={1236}
        height={319}
        priority
      />
      <Image
        className="logo__img logo__img--white"
        src="/images/logo-white.png"
        alt=""
        width={1236}
        height={320}
        aria-hidden="true"
        priority
      />
    </span>
  );
}
