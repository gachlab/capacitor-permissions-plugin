#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 gachlab
#
# iOS DND e2e test. Boots a simulator and runs the AppUITests XCUITest suite
# against the example-app, which verifies the JS↔native bridge round-trip.
# (The dndStateChanged event itself is manual on iOS — see TESTING.md.)
#
# Called by CI after `npm ci` + `npx cap sync ios` in example-app.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXAMPLE_IOS="${REPO_ROOT}/example-app/ios/App"
SCHEME="${XCODE_SCHEME:-AppUITests}"
# Default to a substring match so we pick whatever iPhone simulator is
# installed on the runner (the selector below iterates runtimes newest-first
# and takes the first iPhone whose name contains this string). Self-hosted
# runners may not have the same model that GitHub-hosted macos-15 ships,
# so hard-coding a specific generation made this script brittle to runner
# changes. Override with SIMULATOR_NAME=… to pin a specific model.
SIM_NAME="${SIMULATOR_NAME:-iPhone}"
RESULT_BUNDLE="/tmp/e2e-ios-results.xcresult"

log() { echo "[e2e-ios-permissions] $*"; }

log "Locating simulator: ${SIM_NAME}…"
UDID=$(xcrun simctl list devices available --json | python3 -c "
import json,sys
d=json.load(sys.stdin)
for rt,devs in sorted(d['devices'].items(), reverse=True):
    for dev in devs:
        if dev.get('isAvailable') and '${SIM_NAME}' in dev['name']:
            print(dev['udid']); exit()
")
if [ -z "${UDID:-}" ]; then
  echo "ERROR: no available simulator matching '${SIM_NAME}'" >&2
  exit 1
fi
log "Using simulator UDID: ${UDID}"

STATE=$(xcrun simctl list devices --json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
    [print(dev['state']) for rt,devs in d['devices'].items() for dev in devs if dev['udid']=='${UDID}']" \
  | head -1)
if [ "${STATE}" != "Booted" ]; then
  log "Booting simulator…"
  xcrun simctl boot "${UDID}"
fi
# Block until the simulator is fully booted, then let it settle — launching too
# early causes "Timed out while acquiring background assertion" flakes.
xcrun simctl bootstatus "${UDID}" -b || true
sleep 20

rm -rf "${RESULT_BUNDLE}"

# -retry-tests-on-failure absorbs transient simulator flakes (background
# assertion timeouts on first launch); the xcodebuild exit code is the source
# of truth for pass/fail.
set +e
xcodebuild test \
  -project "${EXAMPLE_IOS}/App.xcodeproj" \
  -scheme "${SCHEME}" \
  -destination "id=${UDID}" \
  -resultBundlePath "${RESULT_BUNDLE}" \
  -retry-tests-on-failure \
  -test-iterations 3 \
  2>&1 | tee /tmp/e2e-ios-xcodebuild.log \
       | grep -E "(Test Case|error:|XCTAssert|\\*\\* TEST|Executed)" || true
XCODE_EXIT=${PIPESTATUS[0]}
set -e

TESTS_RUN=$(grep -c "Test Case '.*' passed (" /tmp/e2e-ios-xcodebuild.log 2>/dev/null || true); TESTS_RUN=${TESTS_RUN:-0}
TESTS_FAIL=$(grep -c "Test Case '.*' failed (" /tmp/e2e-ios-xcodebuild.log 2>/dev/null || true); TESTS_FAIL=${TESTS_FAIL:-0}

echo ""
echo "────────────────────────────────────────"
if [ "${XCODE_EXIT}" -eq 0 ] && [ "${TESTS_RUN}" -gt 0 ]; then
  echo "✓ DND iOS E2E PASSED (xcodebuild exit 0; ${TESTS_RUN} passing test-case run(s))"
  exit 0
else
  echo "✗ DND iOS E2E FAILED (passed=${TESTS_RUN}, failed=${TESTS_FAIL}, xcode_exit=${XCODE_EXIT})"
  echo "--- last 40 lines of xcodebuild output ---"
  tail -40 /tmp/e2e-ios-xcodebuild.log || true
  exit 1
fi
