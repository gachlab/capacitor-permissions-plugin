import { Observable } from "rxjs";

export interface DevicePermissions { geolocation: 'denied' | 'granted'; notifications: 'denied' | 'granted' | 'prompt'; "notifications-policy": 'denied' | 'granted'; doNotDisturb: 0 | 1; }

export interface DevicePermissionsPlugin {
  monitor(): Observable<DevicePermissions>;
}
