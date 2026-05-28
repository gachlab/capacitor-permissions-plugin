#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 gachlab
#
# Block until the emulator is REALLY ready to accept package installs.
#
# `sys.boot_completed=1` (what android-emulator-runner waits for) fires before
# the package/activity system services are registered, so installing right away
# hits "Failure calling service package: Broken pipe". We additionally wait for
# `service check package` / `activity` to report "found", then settle briefly.

set -euo pipefail

# Portable bounded poll (avoids GNU `timeout`, which isn't on stock macOS hosts).
poll_until() {
  local secs="$1"; shift
  local end=$(( $(date +%s) + secs ))
  until "$@"; do
    [[ $(date +%s) -ge $end ]] && return 124
    sleep 2
  done
}

echo "→ Waiting for emulator to be install-ready"
adb wait-for-device

for svc in package activity; do
  if ! poll_until 300 sh -c "adb shell service check ${svc} 2>/dev/null | grep -q 'found'"; then
    echo "✗ service '${svc}' did not come up in 300s"; exit 1
  fi
  echo "  • service '${svc}' is up"
done

if ! poll_until 300 sh -c '[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d "\r")" = "1" ]'; then
  echo "✗ sys.boot_completed never reached 1 in 300s"; exit 1
fi
echo "  • sys.boot_completed=1"

adb shell input keyevent 82 >/dev/null 2>&1 || true   # dismiss keyguard
sleep 10
echo "→ Emulator ready"
