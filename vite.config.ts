import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
    plugins: isTest
        ? [react()]
        : [
              react(),
              electron([
                  {
                      entry: 'main.ts',
                      vite: {
                          build: {
                              outDir: 'dist-electron',
                              rollupOptions: {
                                  external: ['electron']
                              }
                          }
                      }
                  }
              ]),
              electronRenderer()
          ],
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts', '**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['ui/**/*.ts', 'ui/**/*.tsx', 'wifi.ts'],
            exclude: ['**/*.test.ts', '**/*.test.tsx']
        }
    }
});
