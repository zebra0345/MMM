import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_DOMAIN,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: env.VITE_BASE_URL, 
          ws: true,
          changeOrigin: true,
        }
      }
    },
    define: {
      global: 'window',
    },
  };
});

// import { defineConfig, loadEnv } from "vite";
// import react from "@vitejs/plugin-react";
// import fs from 'fs';
// import tailwindcss from "@tailwindcss/vite";
// import path from "path";

// export default defineConfig(({ mode }) => {

//   const env = loadEnv(mode, process.cwd());

//   return {
//     plugins: [react(), tailwindcss()],
//     server: {
//       proxy: {
//         '/ws': {
//           target: env.VITE_BASE_URL, 
//           ws: true,
//           changeOrigin: true,
//         }
//       },
//       https: {
//         key: fs.readFileSync(path.resolve(__dirname, "localhost-key.pem")),
//         cert: fs.readFileSync(path.resolve(__dirname, "localhost.pem")),
//       },
//       host: "localhost",
//       port: 3000
//     },
//     define: {
//       global: 'window',
//     },
//   };
// });
