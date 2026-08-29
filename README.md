# Site institucional Meteoro 24

Site bilingue (PT/EN) da Meteoro 24 — Construção e Gestão de Projectos, Angola.
Conteúdo baseado na apresentação institucional `Apresentacao_Institucional_Meteoro_24.pptx`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- CSS puro com tokens em `src/app/globals.css` — sem Tailwind, sem dependências de UI
- Tipografia: Archivo (Google Fonts, servida localmente pelo `next/font`)
- Zero JavaScript para as animações: as revelações usam `animation-timeline: view()`
  onde o browser suporta e, onde não suporta, o conteúdo aparece sem animação

## Correr localmente

```bash
npm install
npm run dev
```

http://localhost:3000 — `/` redirecciona para `/pt`.

## Estrutura

```
src/
  app/[locale]/                 páginas por idioma (pt | en)
    page.tsx                    início
    sobre/ metodo/ projectos/ contacto/
    servicos/                   índice + [slug] para os 6 serviços
  app/api/contact/route.ts      recebe o formulário e envia por Resend
  components/                   Header, Footer, Blocks, Reveal, ContactForm
  i18n/                         pt.ts, en.ts — TODO o texto do site
  lib/site.ts                   contactos e dados institucionais
```

Todo o texto vive em `src/i18n/pt.ts` e `src/i18n/en.ts`. Os dois ficheiros
partilham o tipo `Content` (`src/i18n/types.ts`), por isso o TypeScript acusa
qualquer campo que falte numa das traduções.

## Antes de publicar

1. **Contactos reais** — `src/lib/site.ts` tem placeholders (telefone, email,
   morada). É o único ficheiro a editar para isso.
2. **Formulário de contacto** — copiar `.env.example` para `.env.local` e
   preencher `RESEND_API_KEY`, `CONTACT_FROM` (remetente verificado no domínio)
   e `CONTACT_TO`. Sem isto o formulário mostra o email directo em vez de enviar.
3. **Fotografias** — as imagens em `public/images/` vieram da apresentação e são
   banco de imagens, não obras da Meteoro 24. Substituir por registo próprio.
4. **Domínio** — actualizar `site.url` em `src/lib/site.ts` (usado nos metadados
   e nos canonical).

## Publicar

```bash
npm run build
npm start
```

O `/api/contact` corre no servidor, por isso o site precisa de um alojamento com
Node (Hostinger Node, Vercel, Railway). O `start` não fixa porta — usa a variável
`PORT` que o alojamento injecta.

**O build usa Webpack, não Turbopack** (`next build --webpack`). O Turbopack, que
é o motor por omissão do Next 16, exige bindings nativas que faltam no ambiente de
compilação da Hostinger — o build falha com *"Turbopack is not supported on this
platform (linux/x64)"*. Não remover a flag.

Para alojamento estático puro, acrescentar `output: 'export'` ao `next.config.mjs`
e `images.unoptimized: true`, e substituir o formulário por um serviço externo — a
rota de API deixa de funcionar.

## Notas de acessibilidade e desempenho

- O conteúdo nunca depende de JavaScript para ser lido; sem JS falha apenas o
  menu móvel (a navegação completa continua disponível no rodapé).
- `prefers-reduced-motion` desliga todas as animações.
- Contraste, foco visível e `skip link` verificados.

## Painel de administração

O conteúdo do site é editável em `/admin`. Serve-se de Postgres (Supabase) e, se
a base de dados não estiver configurada ou estiver em baixo, o site **serve o
conteúdo estático** de `src/i18n/pt.ts` e `en.ts` em vez de rebentar. É por isso
que o `next build` corre sem `DATABASE_URL`.

### O que se edita

| Secção | Conteúdo |
| --- | --- |
| Definições | Contactos, horário, slogan, redes sociais, imagem de capa |
| Textos das páginas | Todos os textos, PT e EN lado a lado |
| Serviços | Criar, editar, reordenar, publicar/ocultar |
| Obras | Portefólio com galeria, cliente, local e ano |
| Mensagens | Tudo o que chega pelo formulário de contacto |
| Imagens | Biblioteca partilhada por todas as secções |
| Utilizadores | Contas de acesso (só para quem tem papel *owner*) |

### Arranque

```bash
cp .env.example .env.local     # preencher DATABASE_URL e as chaves do Supabase
npm run db:push                # cria as tabelas
npm run db:seed                # carrega o conteúdo actual do site para a base de dados
npm run admin:create -- --email pessoa@empresa.ao --nome "Nome" --papel owner
```

O `db:seed` é idempotente e não pisa conteúdo já editado. Para repor os textos
originais de raiz: `npm run db:seed -- --force`.

### Notas de implementação

- **Passwords** com `scrypt` do próprio Node. Nada de bcrypt ou argon2: exigem
  compilação nativa, e o ambiente de build da Hostinger já mostrou que não a
  suporta (ver a nota do Turbopack acima).
- **Sessões** em cookie `httpOnly`; a base de dados guarda apenas o SHA-256 do
  token, nunca o token.
- **O `middleware.ts` só verifica se o cookie existe.** Corre no runtime edge e
  não tem acesso à base de dados, por isso é conveniência e não segurança — a
  verificação a sério é o `requireUser()`, repetido em cada página e em cada
  server action.
- **O editor de textos é gerado a partir da estrutura do conteúdo**
  (`src/lib/json-form.ts`). Acrescentar um campo ao tipo `Content` faz aparecer
  o campo no painel sem escrever formulário nenhum.
- O Next 16 avisa que `middleware` está depreciado a favor de `proxy`. Continua
  a funcionar; a migração fica para quando a API estabilizar.
