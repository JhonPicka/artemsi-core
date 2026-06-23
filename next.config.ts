import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.192", "172.20.10.3"],
  images: {
    qualities: [75, 92],
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/artemsi-logo.png",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
