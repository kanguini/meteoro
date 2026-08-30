import {
  boolean,
  char,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

/*
 * MySQL da Hostinger.
 *
 * Duas diferenças em relação ao Postgres que se notam em todo o ficheiro:
 *  - não há tipo uuid nem `defaultRandom()`; as chaves são char(36) e o
 *    identificador é gerado na aplicação com `crypto.randomUUID()`;
 *  - índices únicos precisam de comprimento em colunas de texto, por isso os
 *    campos indexados são varchar e não text.
 */

/* ==========================================================================
   Acesso ao painel
   ========================================================================== */

export const users = mysqlTable(
  'users',
  {
    id: char('id', { length: 36 }).primaryKey(),
    email: varchar('email', { length: 200 }).notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    /** 'owner' pode gerir contas; 'editor' só edita conteúdo */
    role: varchar('role', { length: 16 }).notNull().default('editor').$type<'owner' | 'editor'>(),
    active: boolean('active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const sessions = mysqlTable(
  'sessions',
  {
    /** hash do token — o valor em claro só existe no cookie do browser */
    tokenHash: char('token_hash', { length: 64 }).primaryKey(),
    userId: char('user_id', { length: 36 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('sessions_user_idx').on(table.userId)],
);

/* ==========================================================================
   Conteúdo
   ========================================================================== */

/** Definições globais. Linha única — `id` é sempre 'singleton'. */
export const settings = mysqlTable('settings', {
  id: varchar('id', { length: 16 }).primaryKey(),
  phone: varchar('phone', { length: 60 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  addressStreet: varchar('address_street', { length: 240 }).notNull(),
  addressCity: varchar('address_city', { length: 120 }).notNull(),
  slogan: varchar('slogan', { length: 200 }).notNull(),
  hoursPt: varchar('hours_pt', { length: 160 }).notNull(),
  hoursEn: varchar('hours_en', { length: 160 }).notNull(),
  linkedin: varchar('linkedin', { length: 300 }).notNull().default(''),
  instagram: varchar('instagram', { length: 300 }).notNull().default(''),
  facebook: varchar('facebook', { length: 300 }).notNull().default(''),
  /** imagem do hero da página inicial */
  coverImage: varchar('cover_image', { length: 400 }).notNull(),
  coverAltPt: text('cover_alt_pt').notNull(),
  coverAltEn: text('cover_alt_en').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Textos das páginas, um registo por idioma e por página.
 * O `data` segue o formato do tipo `Content`, que continua a ser a fonte de
 * verdade da forma do conteúdo.
 */
export const pageContent = mysqlTable(
  'page_content',
  {
    locale: varchar('locale', { length: 5 }).notNull().$type<'pt' | 'en'>(),
    page: varchar('page', { length: 32 }).notNull(),
    data: json('data').notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.locale, table.page] })],
);

export const services = mysqlTable(
  'services',
  {
    id: char('id', { length: 36 }).primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull(),
    /** número mostrado no site (01, 02, ...) — separado da ordenação */
    number: varchar('number', { length: 8 }).notNull(),
    position: int('position').notNull().default(0),
    published: boolean('published').notNull().default(true),
    image: varchar('image', { length: 400 }),
    imageAltPt: text('image_alt_pt').notNull(),
    imageAltEn: text('image_alt_en').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('services_slug_unique').on(table.slug)],
);

export const serviceTranslations = mysqlTable(
  'service_translations',
  {
    serviceId: char('service_id', { length: 36 }).notNull(),
    locale: varchar('locale', { length: 5 }).notNull().$type<'pt' | 'en'>(),
    title: varchar('title', { length: 200 }).notNull(),
    short: text('short').notNull(),
    lead: text('lead').notNull(),
    /** parágrafos */
    body: json('body').notNull().$type<string[]>(),
    /** [{ title, text }] */
    points: json('points').notNull().$type<{ title: string; text: string }[]>(),
    keywords: json('keywords').notNull().$type<string[]>(),
  },
  (table) => [primaryKey({ columns: [table.serviceId, table.locale] })],
);

export const projects = mysqlTable(
  'projects',
  {
    id: char('id', { length: 36 }).primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull(),
    position: int('position').notNull().default(0),
    published: boolean('published').notNull().default(true),
    year: varchar('year', { length: 16 }).notNull().default(''),
    client: varchar('client', { length: 200 }).notNull().default(''),
    location: varchar('location', { length: 200 }).notNull().default(''),
    coverImage: varchar('cover_image', { length: 400 }),
    /** galeria: [{ url, altPt, altEn }] */
    gallery: json('gallery').notNull().$type<{ url: string; altPt: string; altEn: string }[]>(),
    /** serviços envolvidos, por slug */
    serviceSlugs: json('service_slugs').notNull().$type<string[]>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('projects_slug_unique').on(table.slug)],
);

export const projectTranslations = mysqlTable(
  'project_translations',
  {
    projectId: char('project_id', { length: 36 }).notNull(),
    locale: varchar('locale', { length: 5 }).notNull().$type<'pt' | 'en'>(),
    title: varchar('title', { length: 200 }).notNull(),
    summary: text('summary').notNull(),
    body: json('body').notNull().$type<string[]>(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.locale] })],
);

/* ==========================================================================
   Mensagens do formulário
   ========================================================================== */

export const messages = mysqlTable(
  'messages',
  {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    email: varchar('email', { length: 200 }).notNull(),
    phone: varchar('phone', { length: 60 }).notNull().default(''),
    subject: varchar('subject', { length: 200 }).notNull().default(''),
    body: text('body').notNull(),
    locale: varchar('locale', { length: 5 }).notNull().default('pt'),
    /** null enquanto não for lida */
    readAt: timestamp('read_at'),
    archivedAt: timestamp('archived_at'),
    /** false quando o envio de email falhou — a mensagem fica guardada na mesma */
    emailed: boolean('emailed').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('messages_created_idx').on(table.createdAt)],
);

/* ==========================================================================
   Biblioteca de imagens
   ========================================================================== */

export const media = mysqlTable('media', {
  id: char('id', { length: 36 }).primaryKey(),
  /** caminho público servido pela aplicação, ex. /uploads/obra-a1b2c3.jpg */
  url: varchar('url', { length: 400 }).notNull(),
  /** nome do ficheiro dentro da pasta de uploads, necessário para apagar */
  storagePath: varchar('storage_path', { length: 300 }).notNull(),
  filename: varchar('filename', { length: 300 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  bytes: int('bytes').notNull(),
  width: int('width'),
  height: int('height'),
  uploadedBy: char('uploaded_by', { length: 36 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
