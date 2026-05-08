import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        allowedHosts: ['localhost', '3000-varalab-dapptemplate-9c1fz312gi9.ws-us118.gitpod.io'],
    },
    assetsInclude: ['**/*.glb'],
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
            '@': '/src',
            components: '/src/vstreet/components',
            contexts: '/src/vstreet/contexts',
            hooks: '/src/vstreet/hooks',
            services: '/src/vstreet/services',
            types: '/src/vstreet/types',
            utils: '/src/vstreet/utils',
            'smart-contracts-tools': '/src/vstreet/smart-contracts-tools',
            consts: '/src/vstreet/consts.ts',
        },
    },
});
