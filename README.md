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
Node (Vercel, Railway). Para alojamento estático (Hostinger), acrescentar
`output: 'export'` ao `next.config.mjs`, `images.unoptimized: true` e substituir
o formulário por um serviço externo — a rota de API deixa de funcionar.

## Notas de acessibilidade e desempenho

- O conteúdo nunca depende de JavaScript para ser lido; sem JS falha apenas o
  menu móvel (a navegação completa continua disponível no rodapé).
- `prefers-reduced-motion` desliga todas as animações.
- Contraste, foco visível e `skip link` verificados.
