import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/cookie';

/**
 * Redirecciona para o login quem não traz cookie de sessão.
 *
 * Isto é conveniência, não segurança: o middleware corre no runtime edge e não
 * consegue validar a sessão contra a base de dados. Quem forjar um cookie passa
 * aqui e é travado no `requireUser()` da página ou da action.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
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
  matcher: ['/admin/:path*'],
};
