/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@synq/ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'your-supabase-project-ref.supabase.co',
      },
    ],
  },
};

export default nextConfig;
