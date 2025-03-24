import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.jsx',
                'resources/js/history/app.jsx',
                'resources/js/plan/app.jsx',
                'resources/js/products/app.jsx',
                'resources/js/products/columns.js',
                'resources/js/products/grid_controller.js',
                // 'resources/js/product/app.jsx',
                'resources/css/app.css',
                'resources/css/mobile.css',
            ],
            refresh: true,
        }),
        react(),
    ],
    server: {
        https: false,
        host: 'localhost',
        port: 5173,
    },
});
