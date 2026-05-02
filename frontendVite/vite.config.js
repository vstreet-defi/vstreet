import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { fileURLToPath } from 'node:url';
var __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        allowedHosts: ['localhost', '3000-varalab-dapptemplate-9c1fz312gi9.ws-us118.gitpod.io'],
    },
    plugins: [
        react(),
        nodePolyfills(),
        svgr(),
        checker({
            typescript: true,
            eslint: {
                lintCommand: 'eslint "./src/**/*.{ts,tsx}" --ignore-pattern "src/vstreet/**"',
                dev: { logLevel: ['error'] },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            components: path.resolve(__dirname, './src/vstreet/components'),
            contexts: path.resolve(__dirname, './src/vstreet/contexts'),
            hooks: path.resolve(__dirname, './src/vstreet/hooks'),
            services: path.resolve(__dirname, './src/vstreet/services'),
            types: path.resolve(__dirname, './src/vstreet/types'),
            utils: path.resolve(__dirname, './src/vstreet/utils'),
            'smart-contracts-tools': path.resolve(__dirname, './src/vstreet/smart-contracts-tools'),
            consts: path.resolve(__dirname, './src/vstreet/consts.ts'),
        },
    },
});
