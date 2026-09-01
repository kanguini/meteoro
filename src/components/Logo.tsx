/**
 * Logótipo da Meteoro.
 *
 * INTERINO: mostra só o lettering. O símbolo oficial das órbitas deve vir dos
 * ficheiros fidedignos da marca — assim que estiverem em public/images/
 * (logo.svg para fundos claros, logo-white.svg para fundos escuros), este
 * componente passa a usá-los. Não se recria o símbolo.
 */
export function Logo() {
  return (
    <span className="logo" aria-label="Meteoro 24">
      <span className="logo__word">METEORO</span>
    </span>
  );
}
