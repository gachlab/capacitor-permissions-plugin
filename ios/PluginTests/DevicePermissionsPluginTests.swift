import XCTest
@testable import DevicePermissionsPlugin

class DevicePermissionsTests: XCTestCase {
    func testStopMonitoringWithoutStartDoesNotCrash() {
        let impl = DevicePermissionsImpl()
        impl.stopMonitoring()
    }

    func testStartAndStopMonitoringDoesNotCrash() {
        let impl = DevicePermissionsImpl()
        impl.startMonitoring { }
        impl.stopMonitoring()
    }

    func testDoubleStopDoesNotCrash() {
        let impl = DevicePermissionsImpl()
        impl.startMonitoring { }
        impl.stopMonitoring()
        impl.stopMonitoring()
    }
}
