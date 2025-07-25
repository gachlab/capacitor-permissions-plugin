import Foundation
import Capacitor

@objc(DevicePermissionsPlugin)
public class DevicePermissionsPlugin: CAPPlugin {
    private let implementation = DevicePermissionsImpl()

    @objc func monitor(_ call: CAPPluginCall) {
        call.keepAlive = true
        
        implementation.startMonitoring { permissions in
            call.resolve(permissions)
        }
    }
}