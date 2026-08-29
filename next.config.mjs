/**
 * O next/image recusa qualquer domínio que não esteja declarado aqui. As imagens
 * carregadas pelo painel vivem no Supabase Storage, por isso sem esta lista
 * apareceriam como erro em vez de aparecerem.
 *
 * O host específico é derivado do SUPABASE_URL quando existe no momento do build;
 * o padrão `**.supabase.co` é a rede de segurança para quando a variável não está
 * disponível durante a compilação (é o caso de alguns alojamentos).
 */
const supabaseHost = (() => {
  if (!process.env.SUPABASE_URL) return null;
  try {
    return new URL(process.env.SUPABASE_URL).hostname;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
        : []),
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

export default nextConfig;
