import type { PluginListenerHandle } from '@capacitor/core';

export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface PermissionStatus {
  geolocation: PermissionState;
  notifications: PermissionState;
  notificationsPolicy: PermissionState;
}

/**
 * A single permission whose state changed between two observations.
 */
export interface PermissionChange {
  permission: 'geolocation' | 'notifications' | 'notificationsPolicy';
  from: PermissionState;
  to: PermissionState;
}

/**
 * Payload of the `permissionChange` event. Extends the full {@link PermissionStatus}
 * snapshot with the moment it was observed and the list of permissions that changed.
 */
export interface PermissionChangeEvent extends PermissionStatus {
  /** Epoch time in milliseconds when the change was observed. */
  timestamp: number;
  /** Permissions that changed since the previous observation (never empty). */
  changes: PermissionChange[];
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
   *
   * The event fires **only when at least one permission actually changed** (it is
   * no longer emitted on every poll tick). The payload carries the full current
   * status plus `timestamp` and the `changes` that occurred, for audit logging.
   */
  addListener(
    eventName: 'permissionChange',
    listenerFunc: (event: PermissionChangeEvent) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Removes all listeners for this plugin.
   */
  removeAllListeners(): Promise<void>;
}
