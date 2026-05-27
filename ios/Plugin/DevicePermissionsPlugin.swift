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
    private let permissionKeys = ["geolocation", "notifications", "notificationsPolicy"]
    private var lastStatus: [String: String]?

    @objc public override func checkPermissions(_ call: CAPPluginCall) {
        implementation.checkPermissions { permissions in
            call.resolve(permissions)
        }
    }

    @objc func startMonitoring(_ call: CAPPluginCall) {
        // Seed the baseline so the first real change is detected (and we don't emit
        // a spurious event on start).
        implementation.checkPermissions { [weak self] initial in
            self?.lastStatus = initial
        }
        implementation.startMonitoring { [weak self] in
            guard let self = self else { return }
            self.implementation.checkPermissions { permissions in
                self.emitIfChanged(permissions)
            }
        }
        call.resolve()
    }

    private func emitIfChanged(_ current: [String: String]) {
        let previous = lastStatus
        lastStatus = current

        guard let previous = previous else { return }

        var changes: [[String: String]] = []
        for key in permissionKeys {
            let from = previous[key]
            let to = current[key]
            if let from = from, let to = to, from != to {
                changes.append(["permission": key, "from": from, "to": to])
            }
        }
        if changes.isEmpty { return }

        var data: [String: Any] = current
        data["timestamp"] = Date().timeIntervalSince1970 * 1000
        data["changes"] = changes
        notifyListeners("permissionChange", data: data)
    }

    @objc func stopMonitoring(_ call: CAPPluginCall) {
        implementation.stopMonitoring()
        lastStatus = nil
        call.resolve()
    }

    deinit {
        implementation.stopMonitoring()
    }
}
