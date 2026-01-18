import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist/esm',
      include: ['src/**/*']
    })
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts')
    },
    rollupOptions: {
      external: ['@capacitor/core'],
      output: [
        {
          format: 'es',
          entryFileNames: 'esm/index.js',
          chunkFileNames: 'esm/[name].js'
        },
        {
          format: 'cjs',
          entryFileNames: 'plugin.cjs.js',
          inlineDynamicImports: true
        },
        {
          format: 'iife',
          entryFileNames: 'plugin.js',
          name: 'capacitorDevicePermissionsPlugin',
          globals: {
            '@capacitor/core': 'capacitorExports'
          },
          inlineDynamicImports: true
        }
      ]
    },
    sourcemap: true,
    outDir: 'dist'
  }
});