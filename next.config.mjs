/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "72.62.128.63",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;