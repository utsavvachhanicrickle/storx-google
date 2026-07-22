import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:10002/api/v0";
    const serverRoot = backendUrl.replace(/\/api\/v0\/?$/, "");

    return [
      {
        source: "/api/proxy/payment-plans",
        destination: `${serverRoot}/payment-plans`,
      },
      {
        source: "/payment-plans",
        destination: `${serverRoot}/payment-plans`,
      },
      {
        source: "/api/proxy/resources-list",
        destination: `${serverRoot}/resources-list`,
      },
      {
        source: "/api/proxy/guides",
        destination: `${serverRoot}/guides`,
      },
      {
        source: "/api/proxy/blog-list",
        destination: `${serverRoot}/blog-list`,
      },
      {
        source: "/static/:path*",
        destination: `${serverRoot}/static/:path*`,
      },
      {
        source: "/api/proxy/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
