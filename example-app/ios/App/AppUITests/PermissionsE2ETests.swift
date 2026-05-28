// SPDX-License-Identifier: MIT
// Copyright (c) 2026 gachlab
//
// End-to-end test for the permissions plugin on the iOS Simulator.
//
// Driving permission grants/revocations deterministically from a UITest is
// unreliable on iOS, so the permissionChange EVENT is covered by Android e2e +
// the manual checklist (TESTING.md). This XCUITest verifies the part that IS
// automatable end-to-end: the JS↔native bridge round-trip — tapping
// checkPermissions resolves the native call and renders a concrete state.

import XCTest

final class PermissionsE2ETests: XCTestCase {

    private let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
        let webView = app.webViews.firstMatch
        XCTAssert(webView.waitForExistence(timeout: 20), "WebView did not load in 20 s")
    }

    override func tearDownWithError() throws {
        app.terminate()
    }

    func testCheckPermissionsRoundTrip() throws {
        let webView = app.webViews.firstMatch
        let btn = webView.buttons["checkPermissions"]
        XCTAssert(btn.waitForExistence(timeout: 30), "checkPermissions button not found in WebView")
        btn.tap()

        // The geolocation-state span starts at "unknown" and flips to a concrete
        // PermissionState once the native checkPermissions() call resolves.
        let resolved = NSPredicate(format: "label == 'granted' OR label == 'denied' OR label == 'prompt'")
        let stateEl = webView.staticTexts.matching(resolved).firstMatch
        XCTAssert(
            stateEl.waitForExistence(timeout: 10),
            "checkPermissions() round-trip did not resolve to a concrete state"
        )
    }
}
