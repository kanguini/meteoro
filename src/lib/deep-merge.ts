/**
 * Sobrepõe `override` (o que está na base de dados) sobre `base` (o dicionário
 * estático), recursivamente. Uma chave ausente no override mantém o valor do
 * base — é isto que impede um snapshot antigo, gravado antes de o código ganhar
 * um campo novo, de servir `undefined` e rebentar o render.
 *
 * Arrays e valores primitivos do override substituem os do base (não se fundem
 * elemento a elemento): editar a lista de pilares no painel deve substituí-la,
 * não misturá-la com a antiga.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;

  if (
    typeof base === 'object' &&
    base !== null &&
    !Array.isArray(base) &&
    typeof override === 'object' &&
    !Array.isArray(override)
  ) {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    const source = override as Record<string, unknown>;

    for (const key of Object.keys(result)) {
      if (key in source) {
        result[key] = deepMerge(result[key], source[key]);
      }
    }

    return result as T;
  }

  // Tipos incompatíveis (ex.: a base espera objecto e a base de dados trouxe uma
  // string) — fica com a base, que é a forma de confiança.
  if (typeof base !== typeof override || Array.isArray(base) !== Array.isArray(override)) {
    return base;
  }

  return override as T;
}
