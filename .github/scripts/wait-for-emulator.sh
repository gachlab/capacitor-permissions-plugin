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

echo "→ Waiting for emulator to be install-ready"
adb wait-for-device

for svc in package activity; do
  timeout 300 bash -c "until adb shell service check ${svc} 2>/dev/null | grep -q 'found'; do sleep 2; done"
  echo "  • service '${svc}' is up"
done

timeout 300 bash -c 'until [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d "\r")" == "1" ]]; do sleep 2; done'
echo "  • sys.boot_completed=1"

adb shell input keyevent 82 >/dev/null 2>&1 || true   # dismiss keyguard
sleep 10
echo "→ Emulator ready"
