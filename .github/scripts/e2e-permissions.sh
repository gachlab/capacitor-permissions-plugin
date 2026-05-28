#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 gachlab
#
# E2E: permissionChange round-trip for @gachlab/capacitor-permissions.
#
# The host app auto-starts monitoring and logs each event as
# `[PERM-E2E] event:permissionChange {...}`. We GRANT a location permission via
# adb (granting does NOT kill the app, whereas revoking a runtime permission
# does), wait past one monitor poll, and grep logcat for the delivered event.

set -euo pipefail

APK=$(find example-app/android/app/build/outputs/apk/debug -name "*.apk" | head -1)
PACKAGE="com.gachlab.capacitor.permissions.example"
ACTIVITY=".MainActivity"
LOGCAT_OUT="/tmp/e2e-logcat.txt"
FINE="android.permission.ACCESS_FINE_LOCATION"
COARSE="android.permission.ACCESS_COARSE_LOCATION"
PASS=0

"$(dirname "$0")/wait-for-emulator.sh"

echo "→ Installing APK: $APK"
adb install -r --no-streaming "$APK"

# Baseline: location DENIED before launch so the grant below is a real change.
adb shell pm revoke "$PACKAGE" "$FINE" 2>/dev/null || true
adb shell pm revoke "$PACKAGE" "$COARSE" 2>/dev/null || true

echo "→ Launching app (auto-starts monitoring)"
adb shell am start -n "${PACKAGE}/${ACTIVITY}"

echo "→ Waiting for the WebView to register the permissionChange listener"
LISTENER_END=$(( $(date +%s) + 90 ))
until adb logcat -d 2>/dev/null | grep -q "addListener.*permissionChange"; do
  if [[ $(date +%s) -ge $LISTENER_END ]]; then
    echo "✗ JS never registered the permissionChange listener within 90 s"
    adb logcat -d | grep -iE "Capacitor|chromium|console|error" | tail -30
    exit 1
  fi
  sleep 2
done

# Let monitoring seed its baseline (denied), then only capture the grant event.
sleep 3
adb logcat -c

echo "→ Granting location permission"
adb shell pm grant "$PACKAGE" "$FINE"
adb shell pm grant "$PACKAGE" "$COARSE"

# Android polls permission state every ~10 s — wait past one interval.
echo "→ Waiting for the monitor poll to detect the change"
sleep 15

adb logcat -d > "$LOGCAT_OUT" 2>&1 || true

echo ""
echo "── Assertions ──────────────────────────────────────────────────────"
PERM_LINES=$(grep '\[PERM-E2E\] event:permissionChange' "$LOGCAT_OUT" || true)

if echo "$PERM_LINES" | grep -q '"geolocation":"granted"'; then
  echo "✓ permissionChange delivered with geolocation now granted"
  PASS=$((PASS + 1))
else
  echo "✗ no permissionChange with geolocation granted"
fi

if echo "$PERM_LINES" | grep -q '"permission":"geolocation"' && echo "$PERM_LINES" | grep -q '"to":"granted"'; then
  echo "✓ changes[] reports a geolocation → granted delta"
  PASS=$((PASS + 1))
else
  echo "✗ changes[] missing the geolocation → granted delta"
fi

if echo "$PERM_LINES" | grep -qE '"timestamp":[0-9]{10,}'; then
  echo "✓ event payload carries an epoch-ms timestamp"
  PASS=$((PASS + 1))
else
  echo "✗ event payload missing a numeric timestamp"
fi

echo ""
if [[ "$PASS" -eq 3 ]]; then
  echo "✓ Permissions E2E PASSED ($PASS/3)"
else
  echo "✗ Permissions E2E FAILED ($PASS/3)"
  echo "--- PERM-E2E / permissionChange log lines ---"
  grep -iE "PERM-E2E|permissionChange" "$LOGCAT_OUT" | tail -30 || echo "(none — event never reached JS)"
  exit 1
fi
