import Foundation
import CoreLocation
import UserNotifications

@objc public class DevicePermissionsImpl: NSObject, CLLocationManagerDelegate {
    private var callback: ((([String: Any]) -> Void))?
    private var locationManager: CLLocationManager?
    
    @objc public func startMonitoring(callback: @escaping ([String: Any]) -> Void) {
        self.callback = callback
        
        setupLocationMonitoring()
        setupNotificationMonitoring()
        sendPermissionsUpdate()
    }
    
    private func setupLocationMonitoring() {
        locationManager = CLLocationManager()
        locationManager?.delegate = self
    }
    
    private func setupNotificationMonitoring() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }
    
    @objc private func appDidBecomeActive() {
        sendPermissionsUpdate()
    }
    
    @objc private func appDidEnterBackground() {
        // Continue monitoring in background
        sendPermissionsUpdate()
    }
    
    @objc private func appWillEnterForeground() {
        sendPermissionsUpdate()
    }
    
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        sendPermissionsUpdate()
    }
    
    private func sendPermissionsUpdate() {
        let permissions = getPermissionsState()
        callback?(permissions)
    }
    
    @objc public func getPermissionsState() -> [String: Any] {
        var permissions: [String: Any] = [:]
        
        let locationStatus = CLLocationManager.authorizationStatus()
        permissions["geolocation"] = (locationStatus == .authorizedAlways || locationStatus == .authorizedWhenInUse) ? "granted" : "denied"
        
        let semaphore = DispatchSemaphore(value: 0)
        var notificationStatus = "denied"
        
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            switch settings.authorizationStatus {
            case .authorized, .provisional:
                notificationStatus = "granted"
            case .notDetermined:
                notificationStatus = "prompt"
            default:
                notificationStatus = "denied"
            }
            semaphore.signal()
        }
        
        semaphore.wait()
        permissions["notifications"] = notificationStatus
        permissions["notifications-policy"] = notificationStatus
        permissions["doNotDisturb"] = 0
        
        return permissions
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}