import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
export default defineConfig({
    server: {
        host: true,
        strictPort: false,
        allowedHosts: true,
    },
    plugins: [
        react(),
        nodePolyfills(),
        svgr(),
        checker({
            typescript: true,
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
