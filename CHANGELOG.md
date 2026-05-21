# Changelog

## Unreleased

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
