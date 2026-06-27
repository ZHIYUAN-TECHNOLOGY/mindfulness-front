import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "", "");
  return {
    envDir: "",
    server: {
      host: "0.0.0.0",
      port: 3030,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:4004",
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on("proxyRes", (proxyRes, _req) => {
              if (proxyRes.headers["content-range"]) {
                proxyRes.headers["accept-ranges"] = "bytes";
              }
            });
            proxy.on("error", (err, _req, _res) => {
              console.error("Vite proxy error:", err);
            });
          },
        },
      },
    },
    plugins: [
      tanstackStart({
        srcDirectory: "app",
        router: {
          routesDirectory: "./routes",
          generatedRouteTree: "./routeTree.gen.ts",
        },
      }),
      react(),
    ],
  };
});
