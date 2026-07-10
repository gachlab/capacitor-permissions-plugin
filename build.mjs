// Builds the three distributables from src, matching the shape the previous
// Vite build shipped:
//   - dist/esm/index.js   bundled ESM (self-contained; loadable by native Node
//                          ESM — tsc's multi-file emit uses extensionless
//                          relative imports which "type": "module" rejects)
//   - dist/plugin.cjs     bundled CommonJS, for bundler/Node consumers
//   - dist/plugin.js      IIFE, loaded into the WebView global scope
//
// tsc runs separately (--emitDeclarationOnly) to typecheck and emit the .d.ts.
// It replaces vite-plugin-dts, which can't run against the native TS7 compiler
// (no JS API).
import esbuild from 'esbuild';

const GLOBAL_NAME = 'capacitorDevicePermissions';

// In the IIFE there is no module system: `@capacitor/core` must resolve to the
// `capacitorExports` object Capacitor injects into the global scope. The ESM and
// CJS builds instead keep it as a normal external import.
const capacitorCoreGlobal = {
  name: 'capacitor-core-global',
  setup(build) {
    build.onResolve({ filter: /^@capacitor\/core$/ }, () => ({
      path: '@capacitor/core',
      namespace: 'capacitor-core-global',
    }));
    build.onLoad({ filter: /.*/, namespace: 'capacitor-core-global' }, () => ({
      contents: 'module.exports = globalThis.capacitorExports;',
      loader: 'js',
    }));
  },
};

const base = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
};

await esbuild.build({ ...base, format: 'esm', outfile: 'dist/esm/index.js', external: ['@capacitor/core'] });
await esbuild.build({ ...base, format: 'cjs', outfile: 'dist/plugin.cjs', external: ['@capacitor/core'] });
await esbuild.build({
  ...base,
  format: 'iife',
  globalName: GLOBAL_NAME,
  outfile: 'dist/plugin.js',
  plugins: [capacitorCoreGlobal],
});
