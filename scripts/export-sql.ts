/**
 * Gera um ficheiro SQL único com as tabelas e o conteúdo inicial do site.
 *
 *   npm run db:sql
 *
 * Serve para instalar a base de dados colando o resultado no phpMyAdmin, sem
 * precisar de ligação remota ao MySQL nem de partilhar a password.
 *
 * O ficheiro é idempotente: `CREATE TABLE IF NOT EXISTS` e `INSERT IGNORE`.
 * Correr duas vezes não apaga nada nem duplica.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pt } from '../src/i18n/pt';
import { en } from '../src/i18n/en';
import { site } from '../src/lib/site';
import { newId } from '../src/lib/id';

const PAGES = ['meta', 'nav', 'common', 'home', 'about', 'method', 'projects', 'contact', 'footer'] as const;

/** Escapa um valor para literal de string MySQL. */
function q(value: string | null): string {
  if (value === null) return 'NULL';
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u001a/g, '\\Z');
  return `'${escaped}'`;
}

function json(value: unknown): string {
  return q(JSON.stringify(value));
}

async function schemaSql(): Promise<string> {
  const dir = path.join(process.cwd(), 'drizzle');
  const files = (await readdir(dir)).filter((name) => name.endsWith('.sql') && name !== 'instalacao.sql').sort();

  if (files.length === 0) {
    throw new Error('Não há migrações em drizzle/. Correr `npm run db:generate` primeiro.');
  }

  const parts: string[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    parts.push(
      raw
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean)
        // Torna a instalação repetível sem erro se as tabelas já existirem.
        .map((statement) => statement.replace(/^CREATE TABLE /, 'CREATE TABLE IF NOT EXISTS '))
        .join('\n\n'),
    );
  }

  return parts.join('\n\n');
}

function dataSql(): string {
  const lines: string[] = [];

  lines.push('-- Definições ---------------------------------------------------------------');
  lines.push(
    'INSERT IGNORE INTO `settings` (`id`, `phone`, `email`, `address_street`, `address_city`, `slogan`, `hours_pt`, `hours_en`, `linkedin`, `instagram`, `facebook`, `cover_image`, `cover_alt_pt`, `cover_alt_en`) VALUES (' +
      [
        q('singleton'),
        q(site.phone),
        q(site.email),
        q(site.address.street),
        q(site.address.city),
        q(site.slogan),
        q(site.hours.pt),
        q(site.hours.en),
        q(site.social.linkedin),
        q(site.social.instagram),
        q(site.social.facebook),
        q('/images/hero-obra.jpg'),
        q(''),
        q(''),
      ].join(', ') +
      ');',
  );

  lines.push('');
  lines.push('-- Textos das páginas --------------------------------------------------------');
  for (const [locale, content] of [
    ['pt', pt],
    ['en', en],
  ] as const) {
    for (const page of PAGES) {
      const data = (content as unknown as Record<string, unknown>)[page];
      lines.push(
        `INSERT IGNORE INTO \`page_content\` (\`locale\`, \`page\`, \`data\`) VALUES (${q(locale)}, ${q(page)}, ${json(data)});`,
      );
    }
  }

  lines.push('');
  lines.push('-- Serviços ------------------------------------------------------------------');
  for (const [index, service] of pt.services.items.entries()) {
    const englishService = en.services.items.find((item) => item.slug === service.slug);
    if (!englishService) continue;

    const id = newId();

    lines.push(
      'INSERT IGNORE INTO `services` (`id`, `slug`, `number`, `position`, `published`, `image`, `image_alt_pt`, `image_alt_en`) VALUES (' +
        [
          q(id),
          q(service.slug),
          q(service.number),
          String(index),
          '1',
          service.image ? q(service.image.src) : 'NULL',
          q(service.image?.alt ?? ''),
          q(englishService.image?.alt ?? ''),
        ].join(', ') +
        ');',
    );

    for (const [locale, source] of [
      ['pt', service],
      ['en', englishService],
    ] as const) {
      lines.push(
        'INSERT IGNORE INTO `service_translations` (`service_id`, `locale`, `title`, `short`, `lead`, `body`, `points`, `keywords`) VALUES (' +
          [
            q(id),
            q(locale),
            q(source.title),
            q(source.short),
            q(source.lead),
            json(source.body),
            json(source.points),
            json(source.keywords),
          ].join(', ') +
          ');',
      );
    }
  }

  return lines.join('\n');
}

async function main() {
  const output = [
    '-- ============================================================================',
    '-- Meteoro 24 — instalação da base de dados',
    '--',
    '-- Colar no phpMyAdmin, separador SQL, com a base do site seleccionada.',
    '-- Pode correr-se mais do que uma vez: não apaga nem duplica nada.',
    '-- Gerado por `npm run db:sql` a partir do conteúdo actual do site.',
    '-- ============================================================================',
    '',
    'SET NAMES utf8mb4;',
    '',
    await schemaSql(),
    '',
    dataSql(),
    '',
  ].join('\n');

  const target = path.join(process.cwd(), 'drizzle', 'instalacao.sql');
  await writeFile(target, output, 'utf8');
  console.log(`Escrito: ${target}`);
  console.log(`${output.split('\n').length} linhas, ${(output.length / 1024).toFixed(1)} KB`);
}

main().catch((error) => {
  console.error('Falhou:', error);
  process.exit(1);
});
