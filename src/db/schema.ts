import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/* ==========================================================================
   Acesso ao painel
   ========================================================================== */

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    /** 'owner' não pode ser removido nem despromovido pelos outros */
    role: text('role', { enum: ['owner', 'editor'] })
      .notNull()
      .default('editor'),
    active: boolean('active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const sessions = pgTable(
  'sessions',
  {
    /** hash do token — o valor em claro só existe no cookie do browser */
    tokenHash: text('token_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('sessions_user_idx').on(table.userId)],
);

/* ==========================================================================
   Conteúdo
   ========================================================================== */

/**
 * Definições globais: contactos, slogan, redes sociais, imagem de capa.
 * Linha única — `id` é sempre 'singleton'.
 */
export const settings = pgTable('settings', {
  id: text('id').primaryKey().default('singleton'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  addressStreet: text('address_street').notNull(),
  addressCity: text('address_city').notNull(),
  slogan: text('slogan').notNull(),
  hoursPt: text('hours_pt').notNull(),
  hoursEn: text('hours_en').notNull(),
  linkedin: text('linkedin').notNull().default(''),
  instagram: text('instagram').notNull().default(''),
  facebook: text('facebook').notNull().default(''),
  /** imagem do hero da página inicial */
  coverImage: text('cover_image').notNull(),
  coverAltPt: text('cover_alt_pt').notNull().default(''),
  coverAltEn: text('cover_alt_en').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Textos das páginas, um registo por idioma e por página.
 * O `data` segue o mesmo formato do dicionário estático — o tipo `Content`
 * continua a ser a fonte de verdade da forma do conteúdo.
 */
export const pageContent = pgTable(
  'page_content',
  {
    locale: text('locale', { enum: ['pt', 'en'] }).notNull(),
    page: text('page', { enum: ['meta', 'nav', 'common', 'home', 'about', 'method', 'projects', 'contact', 'footer'] }).notNull(),
    data: jsonb('data').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.locale, table.page] })],
);

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    /** número mostrado no site (01, 02, ...) — separado da ordenação */
    number: text('number').notNull(),
    position: integer('position').notNull().default(0),
    published: boolean('published').notNull().default(true),
    image: text('image'),
    imageAltPt: text('image_alt_pt').notNull().default(''),
    imageAltEn: text('image_alt_en').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('services_slug_unique').on(table.slug)],
);

export const serviceTranslations = pgTable(
  'service_translations',
  {
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    locale: text('locale', { enum: ['pt', 'en'] }).notNull(),
    title: text('title').notNull(),
    short: text('short').notNull(),
    lead: text('lead').notNull(),
    /** parágrafos */
    body: jsonb('body').notNull().$type<string[]>(),
    /** [{ title, text }] */
    points: jsonb('points').notNull().$type<{ title: string; text: string }[]>(),
    keywords: jsonb('keywords').notNull().$type<string[]>(),
  },
  (table) => [primaryKey({ columns: [table.serviceId, table.locale] })],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    position: integer('position').notNull().default(0),
    published: boolean('published').notNull().default(true),
    year: text('year').notNull().default(''),
    client: text('client').notNull().default(''),
    location: text('location').notNull().default(''),
    coverImage: text('cover_image'),
    /** galeria: [{ url, altPt, altEn }] */
    gallery: jsonb('gallery').notNull().default([]).$type<{ url: string; altPt: string; altEn: string }[]>(),
    /** serviços envolvidos, por slug */
    serviceSlugs: jsonb('service_slugs').notNull().default([]).$type<string[]>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('projects_slug_unique').on(table.slug)],
);

export const projectTranslations = pgTable(
  'project_translations',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    locale: text('locale', { enum: ['pt', 'en'] }).notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    body: jsonb('body').notNull().default([]).$type<string[]>(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.locale] })],
);

/* ==========================================================================
   Mensagens do formulário
   ========================================================================== */

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    subject: text('subject').notNull().default(''),
    body: text('body').notNull(),
    locale: text('locale').notNull().default('pt'),
    /** null enquanto não for lida */
    readAt: timestamp('read_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    /** false quando o envio de email falhou — a mensagem fica na mesma guardada */
    emailed: boolean('emailed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('messages_created_idx').on(table.createdAt)],
);

/* ==========================================================================
   Biblioteca de imagens
   ========================================================================== */

export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  /** caminho dentro do bucket, necessário para apagar */
  storagePath: text('storage_path').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  bytes: integer('bytes').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
