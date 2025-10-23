/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@importacao/types"],
  images: {
    domains: [
      "localhost",
      // Adicionar domínio Supabase storage quando disponível
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;



