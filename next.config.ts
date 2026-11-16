import type { NextConfig } from "next";
import { getUploadthingAppId } from "./src/lib/uploadthing-app-id";

const uploadthingAppId = getUploadthingAppId();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.a.transfermarkt.technology",
        pathname: "/portrait/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      ...(uploadthingAppId
        ? [
            {
              protocol: "https" as const,
              hostname: `${uploadthingAppId}.ufs.sh`,
              pathname: "/f/**",
            },
          ]
        : []),
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
