import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist/esm',
      include: ['src/**/*.ts'],
      exclude: ['**/__tests__/**', '**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'capacitorDevicePermissions',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'esm/index.js';
        // .cjs extension is mandatory: package.json declares `"type": "module"`,
        // so Node treats any `.js` file as ESM and rejects CommonJS syntax with
        // "exports is not defined in ES module scope". The web chunk already
        // ships as `.cjs`; this aligns the main entry with that convention.
        if (format === 'cjs') return 'plugin.cjs';
        return 'plugin.js';
      },
    },
    rollupOptions: {
      external: ['@capacitor/core'],
      output: {
        globals: {
          '@capacitor/core': 'capacitorExports',
        },
      },
    },
    sourcemap: true,
  },
});
