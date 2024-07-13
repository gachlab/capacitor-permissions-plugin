
export interface DevicePermissionsResponse { geolocation: 'denied' | 'granted'; notifications: 'denied' | 'granted' | 'prompt'; "notifications-policy": 'denied' | 'granted'; doNotDisturb: 0 | 1; }

export interface DevicePermissionsPlugin {
  monitor(callback: any): void;
}
