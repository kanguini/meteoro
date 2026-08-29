/**
 * Converte a estrutura do conteúdo em campos de formulário e volta a montá-la.
 *
 * O conteúdo de cada página é um objecto com strings, listas de strings e
 * objectos encaixados. Em vez de escrever um formulário por página, percorre-se
 * a estrutura e gera-se um campo por folha. Assim, acrescentar um texto novo ao
 * tipo `Content` faz aparecer o campo no painel sem mais nenhum trabalho.
 */

export type LeafKind = 'string' | 'stringList';

export type Leaf = {
  /** caminho com pontos, ex. "hero.eyebrow" ou "pillars.0.label" */
  path: string;
  kind: LeafKind;
  value: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function flatten(input: unknown, prefix = ''): Leaf[] {
  const leaves: Leaf[] = [];

  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      leaves.push({ path, kind: 'string', value });
      return;
    }

    // Listas de texto (parágrafos, palavras-chave) editam-se como um bloco,
    // uma linha por item — é menos atrito do que um campo por linha.
    if (isStringArray(value)) {
      leaves.push({ path, kind: 'stringList', value: value.join('\n') });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, path ? `${path}.${index}` : String(index)));
      return;
    }

    if (isPlainObject(value)) {
      for (const [key, child] of Object.entries(value)) {
        walk(child, path ? `${path}.${key}` : key);
      }
      return;
    }

    // Números e booleanos não aparecem no conteúdo editável; se aparecerem,
    // ficam de fora em vez de serem convertidos em texto por engano.
  };

  walk(input, prefix);
  return leaves;
}

function setAtPath(target: unknown, path: string, value: string | string[]): void {
  const segments = path.split('.');
  let cursor: Record<string, unknown> | unknown[] = target as Record<string, unknown>;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    const next = Array.isArray(cursor)
      ? (cursor as unknown[])[Number(key)]
      : (cursor as Record<string, unknown>)[key];

    if (!isPlainObject(next) && !Array.isArray(next)) return; // caminho inválido, ignora
    cursor = next as Record<string, unknown> | unknown[];
  }

  const last = segments[segments.length - 1];
  if (Array.isArray(cursor)) {
    (cursor as unknown[])[Number(last)] = value;
  } else {
    (cursor as Record<string, unknown>)[last] = value;
  }
}

/**
 * Reconstrói o conteúdo a partir dos campos submetidos, usando o objecto actual
 * como base. Só se escrevem os caminhos que vieram no formulário — o que não
 * for editável mantém-se tal como está.
 */
export function applyLeaves(base: unknown, entries: { path: string; kind: LeafKind; value: string }[]): unknown {
  const next = structuredClone(base);

  for (const entry of entries) {
    if (entry.kind === 'stringList') {
      const items = entry.value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      setAtPath(next, entry.path, items);
    } else {
      setAtPath(next, entry.path, entry.value);
    }
  }

  return next;
}

/** Nomes legíveis para as chaves do conteúdo. O resto é derivado da própria chave. */
const LABELS: Record<string, string> = {
  hero: 'Destaque',
  eyebrow: 'Sobretítulo',
  title: 'Título',
  statement: 'Frase de posicionamento',
  lead: 'Texto de entrada',
  body: 'Parágrafos',
  note: 'Nota',
  text: 'Texto',
  label: 'Etiqueta',
  cta: 'Chamada para acção',
  ctaPrimary: 'Botão principal',
  ctaSecondary: 'Botão secundário',
  button: 'Botão',
  intro: 'Introdução',
  about: 'Sobre',
  services: 'Serviços',
  method: 'Método',
  value: 'Valor',
  pillars: 'Pilares',
  items: 'Itens',
  steps: 'Etapas',
  story: 'História',
  principle: 'Princípio',
  keywords: 'Palavras-chave',
  notice: 'Aviso',
  typologies: 'Tipologias',
  details: 'Detalhes',
  form: 'Formulário',
  sections: 'Secções',
  meta: 'Metadados (SEO)',
  nav: 'Navegação',
  common: 'Textos comuns',
  footer: 'Rodapé',
  number: 'Número',
  key: 'Chave',
  short: 'Resumo',
  points: 'Pontos',
  subjectOptions: 'Opções de assunto',
  rights: 'Direitos',
  country: 'País',
  tagline: 'Frase de marca',
};

export function labelFor(path: string): string {
  const segments = path.split('.');
  return segments
    .map((segment) => {
      if (/^\d+$/.test(segment)) return `#${Number(segment) + 1}`;
      if (LABELS[segment]) return LABELS[segment];
      // camelCase -> "camel case", com a primeira letra maiúscula
      const spaced = segment.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    })
    .join(' › ');
}
