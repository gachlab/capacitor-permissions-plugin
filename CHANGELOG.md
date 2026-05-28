# Changelog

## Unreleased

## 3.1.2 (2026-05-28)

### Bug Fixes

- **Packaging:** Node ESM consumers failed to import the package with `SyntaxError: exports is not defined in ES module scope`. The CJS bundle was emitted as `dist/plugin.cjs.js` (`.js` extension), and because `package.json` declares `"type": "module"`, Node parsed it as ESM and rejected its CommonJS syntax. Renamed the CJS output to `dist/plugin.cjs` (matches the existing convention used by the web chunk), pointed `"main"` at it, and added an `"exports"` field with conditional `import`/`require` so resolvers no longer fall through `main` ambiguously. Closes #10.

### Build

- Bumped Android Gradle Plugin `8.13.0` → `9.2.1` and Gradle wrapper `8.14.3` → `9.5.1` so the plugin's own CI builds against the same AGP major (9.x) that consumer apps use. No consumer-facing change — consuming apps apply their own root AGP at build time. Closes #1.
- Refreshed `@capacitor/*` toolchain in the lockfile to `8.3.4` (was `8.0.1`). The bundled `@capacitor/android@8.0.1` build script still referenced `proguard-android.txt`, which AGP 9 rejects when compiling the `:capacitor-android` module. Lockfile only — `^8.0.1` spec unchanged.

### CI

- Moved the iOS job from `macos-15` (GitHub-hosted) to the same self-hosted Mac Mini that already runs Android e2e. Eliminates the recurring Swift Package Manager cache-stale flake (`Cordova.xcframework.zip already exists in file system`) — that cache lives at `~/Library/Caches/org.swift.swiftpm` and stays hot between runs on a persistent runner. Wall-time iOS dropped from ~7m41s to ~2m12s on the same workload.
- iOS e2e script (`e2e-ios-permissions.sh`) now defaults to a substring match (`"iPhone"`) instead of hard-coding `"iPhone 16"`, so the simulator selector picks whatever model is installed on the runner. The Python selector already iterates runtimes newest-first; the substring is the looser of two filters. Override with `SIMULATOR_NAME=…` if a specific model is required.

## 3.0.2 (2026-05-21)

### CI

- Publish workflow: install `npm@latest` into `$RUNNER_TEMP/npm-latest` via `--prefix` instead of `--global` to avoid the bundled npm overwriting itself mid-install. The v3.0.1 release attempt failed three reruns in a row with `Cannot find module 'promise-retry'` while upgrading the runner's globally-installed npm; the isolated-prefix approach sidesteps that path entirely.

## 3.0.1 (2026-05-21) — never published

> Failed to publish to npm because the `npm install -g npm@latest` step in the publish workflow corrupted the runner's globally-installed npm. The 3.0.1 release was created on GitHub (tag exists) but never reached the npm registry. All changes below ship in [`3.0.2`](#302-2026-05-21).

### Bug Fixes

- **Web:** Fixed listener leak — `startMonitoring()` registered `'change'` listeners on each `PermissionStatus` from `navigator.permissions.query()` but `stopMonitoring()` only detached the `visibilitychange` handler. Repeated start/stop cycles accumulated permission listeners. Now `stopMonitoring()` removes them via a tracked references list.
- **Build:** Fixed empty `dist/esm/index.d.ts` — `vite-plugin-dts` with `rollupTypes: true` produced an empty types bundle under TypeScript 6 (its internal API Extractor uses TS 5.x and silently dropped all declarations). Removed `rollupTypes` and set `tsconfig.json` `rootDir: "src"` so per-file `.d.ts` files land flat at `dist/esm/` and consumers actually get types instead of `any`.

### Improvements

- iOS Swift version aligned: `GachlabCapacitorPermissions.podspec` now declares `swift_version = '5.9'` to match `Package.swift`'s `swift-tools-version: 5.9` (was `5.1`).
- iOS dependency pinned: `Package.swift` now uses `.upToNextMajor(from: "8.0.0")` for `capacitor-swift-pm` instead of `branch: "main"`, so released versions get a stable, reproducible dependency.
- Added `publishConfig.access: public` to `package.json`.

## 3.0.0

### Breaking Changes

- **Complete API redesign**: replaced callback-based `monitor()` with `checkPermissions()`, `startMonitoring()`, `stopMonitoring()`
- **Event-based**: use `addListener('permissionChange', ...)` instead of callback parameter
- **Typed**: all `any` types replaced with `PermissionState` and `PermissionStatus`
- **Export renamed**: `DevicePermissionsPlugin` → `DevicePermissions`

### Bug Fixes

- **iOS:** Fixed complete breakage — `.m` bridge registered `echo` instead of `monitor`, plugin name mismatched (`DevicePermissionsPlugin` vs `DevicePermissions`)
- **iOS:** Fixed main-thread deadlock — replaced `DispatchSemaphore.wait()` with async completion handler for `UNUserNotificationCenter`
- **iOS:** Migrated to `CAPBridgedPlugin` protocol (removed `.m` bridge file)
- **Android:** Fixed crash on devices below API 33 — removed `@RequiresApi(TIRAMISU)` from class, moved API check to notification permission only
- **Android:** Fixed Timer leak — `stopMonitoring()` cancels the timer, `handleOnDestroy()` cleans up
- **Web:** Fixed `document` reference without guard (SSR safe)
- **Web:** Fixed interval leak — `stopMonitoring()` clears the interval

### Improvements

- Upgraded to TypeScript 6, AGP 8.13.0, Gradle 8.14.3, SDK 36, Java 21
- Replaced `tsc` + custom vite-plugin-dts config with standardized `rollupTypes` setup
- Removed unused `rxjs` and `@eslint/js` dependencies
- Added tests: 6 web (Vitest), 4 Android (JUnit), 3 iOS (XCTest)
- Added GitHub Actions CI (web + Android + iOS) and publish workflow
