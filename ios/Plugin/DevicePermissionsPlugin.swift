import Foundation

@objc public class DevicePermissionsPlugin: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
