import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx', 'src/wifi.ts'],
            exclude: ['**/*.test.ts', '**/*.test.tsx']
        }
    }
});
