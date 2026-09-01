/**
 * Gera UPDATEs para sincronizar o corpo (body) dos serviços na base de dados com
 * o texto actual em pt.ts/en.ts. Necessário porque o conteúdo dos serviços vive
 * na base (foi semeado uma vez); editar o código não altera a base já semeada.
 *
 *   npx tsx scripts/update-servicos-sql.ts   → escreve drizzle/atualizar-servicos.sql
 *
 * Actualiza SÓ a coluna `body`, por slug e idioma. Se o serviço tiver sido
 * editado no painel, isto repõe o body pelo do código — correr só se for isso
 * que se quer.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pt } from '../src/i18n/pt';
import { en } from '../src/i18n/en';

function q(value: string): string {
  return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
}

async function main() {
  const lines = [
  '-- ============================================================================',
  '-- Meteoro 24 — actualizar o corpo dos serviços (texto mais enxuto)',
  '-- Colar no phpMyAdmin. Actualiza só a coluna body, por slug e idioma.',
  '-- ============================================================================',
  '',
  'SET NAMES utf8mb4;',
  '',
];

for (const [locale, content] of [
  ['pt', pt],
  ['en', en],
] as const) {
  for (const service of content.services.items) {
    lines.push(
      `UPDATE \`service_translations\` st JOIN \`services\` s ON s.id = st.service_id ` +
        `SET st.body = ${q(JSON.stringify(service.body))} ` +
        `WHERE s.slug = ${q(service.slug)} AND st.locale = ${q(locale)};`,
    );
  }
}

  lines.push('');
  const target = path.join(process.cwd(), 'drizzle', 'atualizar-servicos.sql');
  await writeFile(target, lines.join('\n'), 'utf8');
  console.log('Escrito:', target);
}

main();
