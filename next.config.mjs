/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Não anunciar a framework (defesa em profundidade / menos superfície de fingerprint).
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // As imagens do painel são servidas pela própria aplicação em /uploads.
    // Endereços externos colados no painel são renderizados com `unoptimized`
    // (ver o componente Media), por isso não passam pelo optimizador nem
    // exigem lista de domínios aqui.
  },
  async headers() {
    // Cabeçalhos de segurança aplicados a todas as respostas. O CSP é
    // deliberadamente permissivo com estilos/imagens inline por o site os usar,
    // mas fecha o enquadramento (clickjacking) e o carregamento de scripts de
    // terceiros. Ajustar `frame-ancestors`/`img-src` se se adicionarem serviços.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // 'unsafe-eval' só em dev: o React usa eval() para debug; em produção nunca.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "connect-src 'self'",
      'upgrade-insecure-requests',
    ].join('; ');

    const common = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Content-Security-Policy', value: csp },
    ];

    // Cache curta para o HTML das páginas. O Next marca as páginas estáticas com
    // s-maxage de 1 ano, à espera que a CDN limpe no deploy; a CDN da Hostinger
    // NÃO limpa, e ficava a servir HTML velho até 1 ano. Isto força a CDN a
    // revalidar a cada minuto — um redeploy fica visível quase de imediato. Os
    // ficheiros com hash (/_next/static) e as imagens ficam de fora, para
    // manterem a cache longa (o conteúdo deles nunca muda para o mesmo URL).
    const htmlCache = {
      key: 'Cache-Control',
      value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400',
    };

    return [
      { source: '/:path*', headers: common },
      // Documentos, robots e sitemap: cache curta e revalidação. Exclui os
      // assets estáticos e as imagens (mantêm a sua própria cache longa).
      {
        source: '/:path((?!_next/static|_next/image|images/|uploads/|admin|api/).*)',
        headers: [htmlCache],
      },
      // O painel nunca deve ser indexado nem cacheado por intermediários.
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
