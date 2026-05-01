import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ rollupTypes: true, outDir: 'dist/esm' })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'capacitorDevicePermissions',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'esm/index.js';
        if (format === 'cjs') return 'plugin.cjs.js';
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
