import Foundation
import UIKit
import CoreLocation
import UserNotifications

@objc public class DevicePermissionsImpl: NSObject, CLLocationManagerDelegate {
    private var callback: (() -> Void)?
    private var locationManager: CLLocationManager?

    @objc public func startMonitoring(callback: @escaping () -> Void) {
        self.callback = callback
        locationManager = CLLocationManager()
        locationManager?.delegate = self

        NotificationCenter.default.addObserver(
            self, selector: #selector(onAppActive),
            name: UIApplication.didBecomeActiveNotification, object: nil
        )
    }

    @objc public func stopMonitoring() {
        callback = nil
        locationManager = nil
        NotificationCenter.default.removeObserver(self)
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        callback?()
    }

    @objc private func onAppActive() {
        callback?()
    }

    @objc public func checkPermissions(completion: @escaping ([String: String]) -> Void) {
        let geo = locationManager?.authorizationStatus ?? .notDetermined
        let geoState: String
        switch geo {
        case .authorizedAlways, .authorizedWhenInUse:
            geoState = "granted"
        case .notDetermined:
            geoState = "prompt"
        default:
            geoState = "denied"
        }

        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let notifState: String
            switch settings.authorizationStatus {
            case .authorized, .provisional:
                notifState = "granted"
            case .notDetermined:
                notifState = "prompt"
            default:
                notifState = "denied"
            }

            completion([
                "geolocation": geoState,
                "notifications": notifState,
                "notificationsPolicy": notifState
            ])
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
