import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig(function ({ mode }) {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return {
        plugins: [
            laravel({ input: [ "resources/js/app.js" ], refresh: true }),
            react(),
        ],
        define: {
            "process.env.SHOPIFY_API_KEY": JSON.stringify(
                process.env.VITE_SHOPIFY_API_KEY
            ),
        },
        resolve: {
            preserveSymlinks: true,
        },
        server: {
            host: "localhost",
            port: 5173,
            https: false,
        },
    };
});
