import type { PluginListenerHandle } from '@capacitor/core';

export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface PermissionStatus {
  geolocation: PermissionState;
  notifications: PermissionState;
  notificationsPolicy: PermissionState;
}

export interface DevicePermissionsPlugin {
  /**
   * Returns the current state of all monitored permissions.
   */
  checkPermissions(): Promise<PermissionStatus>;

  /**
   * Starts monitoring permissions and emits events when they change.
   */
  startMonitoring(): Promise<void>;

  /**
   * Stops monitoring permissions.
   */
  stopMonitoring(): Promise<void>;

  /**
   * Listens for permission state changes.
   */
  addListener(
    eventName: 'permissionChange',
    listenerFunc: (status: PermissionStatus) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Removes all listeners for this plugin.
   */
  removeAllListeners(): Promise<void>;
}
