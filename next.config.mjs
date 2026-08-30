/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // As imagens do painel são servidas pela própria aplicação em /uploads,
    // por isso não há domínios externos a autorizar.
  },
};

export default nextConfig;
