import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
    plugins: lazyPlugins(() => [react(), tailwindcss()]),
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        watch: {
            ignored: ['**/.claude/**'],
        },
    },
    lint: {
        ignorePatterns: [
            'node_modules/**',
            'dist/**',
            '.claude/**',
            'src/common/components/ui/*',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    fmt: {
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        semi: true,
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'css',
        ignorePatterns: [
            '.claude/**',
            '.github/**',
            'CLAUDE.md',
            'src/common/components/ui/*',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            stylesheet: 'src/common/styles/app.css',
        },
    },
    test: {
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
    },
});
