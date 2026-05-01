import Foundation
import Capacitor

@objc(DevicePermissionsPlugin)
public class DevicePermissionsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DevicePermissionsPlugin"
    public let jsName = "DevicePermissions"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startMonitoring", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopMonitoring", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = DevicePermissionsImpl()

    @objc public override func checkPermissions(_ call: CAPPluginCall) {
        implementation.checkPermissions { permissions in
            call.resolve(permissions)
        }
    }

    @objc func startMonitoring(_ call: CAPPluginCall) {
        implementation.startMonitoring { [weak self] in
            guard let self = self else { return }
            self.implementation.checkPermissions { permissions in
                self.notifyListeners("permissionChange", data: permissions)
            }
        }
        call.resolve()
    }

    @objc func stopMonitoring(_ call: CAPPluginCall) {
        implementation.stopMonitoring()
        call.resolve()
    }

    deinit {
        implementation.stopMonitoring()
    }
}
