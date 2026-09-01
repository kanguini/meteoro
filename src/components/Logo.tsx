/**
 * Logótipo oficial da Meteoro: lettering METEORO + símbolo das órbitas.
 *
 * O símbolo (dois anéis orbitais vermelhos que se cruzam, à laia de átomo/
 * meteoro) é sempre vermelho; o lettering usa currentColor, por isso fica
 * escuro sobre fundos claros e branco sobre o hero/painel escuros.
 */
export function Logo() {
  return (
    <span className="logo" aria-label="Meteoro 24">
      <span className="logo__word">METEORO</span>
      <svg className="logo__symbol" viewBox="0 0 100 100" role="img" aria-hidden="true">
        <g fill="none" stroke="var(--red, #c8102e)" strokeWidth="7.5" strokeLinecap="round">
          <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(62 50 50)" />
          <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(-62 50 50)" />
        </g>
      </svg>
    </span>
  );
}
