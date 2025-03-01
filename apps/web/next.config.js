/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@synq/ui"],
  images: {
    domains: [
      "127.0.0.1", // For local development
      "your-supabase-project-ref.supabase.co", // TODO: Add for production
    ],
  },
};

export default nextConfig;
