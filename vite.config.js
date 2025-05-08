import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

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
        css: {
            devSourcemap: true,
        },
        build: {
            cssCodeSplit: true,
            minify: 'esbuild',
            sourcemap: false,
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('react')) return 'react';
                            if (id.includes('@shopify')) return 'shopify';
                            if (id.includes('ag-grid')) return 'grid';
                            if (id.includes('axios')) return 'vendor';
                            if (id.includes('jodit')) return 'jodit';
                            return 'vendor-other';
                        }
                    }
                }
            }
        },
        server: {
            host: "localhost",
            port: 5173,
            https: false,
        },
    };
});
