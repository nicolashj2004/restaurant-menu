import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el dev server desde otros dispositivos en la misma red Wi-Fi
  // (celular, tablet) para probar el menú fuera de esta máquina. Solo dev.
  allowedDevOrigins: ["192.168.5.*", "192.168.78.*"],
  images: {
    // Supabase Storage local vive en 127.0.0.1 (IP privada); solo aplica en dev.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
