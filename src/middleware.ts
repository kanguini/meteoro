import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/cookie';
import { defaultLocale, locales } from '@/i18n/config';

/**
 * Duas responsabilidades:
 *
 * 1. Encaminhar a raiz para um idioma. Todas as páginas vivem sob /pt ou /en,
 *    por isso quem escreve só o domínio apanhava um 404.
 *
 * 2. Mandar para o login quem tenta entrar no painel sem cookie de sessão.
 *    Isto é conveniência, não segurança: o middleware corre no runtime edge e
 *    não consegue validar a sessão contra a base de dados. Quem forjar um
 *    cookie passa aqui e é travado no `requireUser()` da página ou da action.
 */

/** Escolhe o idioma a partir do cabeçalho do browser, com o português por omissão. */
function preferredLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language') ?? '';

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, quality] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), quality: quality ? Number(quality) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if ((locales as readonly string[]).includes(base)) return base;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const target = request.nextUrl.clone();
    target.pathname = `/${preferredLocale(request)}`;
    return NextResponse.redirect(target);
  }

  // O arranque tem de ser alcançável sem sessão — é onde a primeira conta nasce.
  if (!pathname.startsWith('/admin') || pathname === '/admin/login' || pathname === '/admin/setup') {
    return NextResponse.next();
  }

  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const login = new URL('/admin/login', request.url);
  login.searchParams.set('seguinte', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
