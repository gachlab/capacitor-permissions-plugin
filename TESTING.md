# Testing — @gachlab/capacitor-permissions

This plugin follows the gachlab **test pyramid: unit + integration + e2e on the 3
platforms**. The e2e layer reuses the harness pattern proven in
`capacitor-background-geolocation` (example host app + emulator/simulator driven
by scripts — **no Appium**). CI runs all layers in `.github/workflows/build.yml`.

## Layers

| Layer | Web | Android | iOS |
|---|---|---|---|
| **Unit** | vitest (`src/__tests__`) | `PermissionDiffEngine` pure JVM JUnit (`android/src/test`) | XCTest (`ios/PluginTests`) |
| **Integration** (real OS, no mocks) | — | instrumented (`android/src/androidTest`, emulator) | XCTest on simulator |
| **E2E** (round-trip to JS) | — | `example-app` + `adb pm grant` + logcat (`scripts/e2e-permissions.sh`) | `example-app` XCUITest (`scripts/e2e-ios-permissions.sh`) |

The diff logic lives in a pure `PermissionDiffEngine` (no Android/Capacitor deps)
so it unit-tests on the plain JVM; the `Plugin` keeps only `getPermissionStates()`
+ `notifyListeners()`.

## Run locally

```bash
npm test                                              # web unit
cd android && ./gradlew test                          # JVM unit (PermissionDiffEngine)
cd android && ./gradlew connectedDebugAndroidTest     # integration (needs emulator)
npm run build && (cd example-app && npm install && npx cap sync android && cd android && ./gradlew assembleDebug)
./.github/scripts/e2e-permissions.sh                  # Android e2e (needs emulator)
xcodebuild test -scheme GachlabCapacitorPermissions -destination 'platform=iOS Simulator,name=iPhone 16'  # iOS unit
npm run build && (cd example-app && npm install && npx cap sync ios) && ./.github/scripts/e2e-ios-permissions.sh
```

## How the e2e harness works

`example-app/www/main.js` auto-starts monitoring and logs each event as
`[PERM-E2E] event:permissionChange {...}`. The Android script **grants** a
location permission with `adb shell pm grant` (granting does not kill the app;
revoking would), waits past the ~10 s monitor poll, and greps logcat for the
delivered event (`geolocation` now `granted`, with the `changes` delta and an
epoch-ms `timestamp`). The iOS XCUITest verifies the `checkPermissions()` bridge
round-trip.

## Manual checklist (not automatable)

- **iOS `permissionChange`**: driving grants/revocations deterministically from a
  UITest is unreliable; verify by hand in Settings while the example app runs.
- **Android revoke path**: revoking a runtime permission kills the app, so the
  automated e2e grants instead. Verify the revoke→event path by hand on a device.
