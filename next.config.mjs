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
      "script-src 'self' 'unsafe-inline'",
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

    return [
      { source: '/:path*', headers: common },
      // O painel nunca deve ser indexado nem cacheado por intermediários.
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
