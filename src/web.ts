import { WebPlugin } from '@capacitor/core';

import type { DevicePermissionsPlugin, PermissionState, PermissionStatus } from './definitions';

export class DevicePermissionsWeb extends WebPlugin implements DevicePermissionsPlugin {
  private monitoring = false;
  private intervalId?: ReturnType<typeof setInterval>;

  async checkPermissions(): Promise<PermissionStatus> {
    return {
      geolocation: await this.queryPermission('geolocation'),
      notifications: await this.queryPermission('notifications'),
      notificationsPolicy: await this.queryPermission('notifications'),
    };
  }

  async startMonitoring(): Promise<void> {
    if (this.monitoring) return;
    this.monitoring = true;

    // Listen for visibility changes to re-check on tab focus
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    // Listen for native permission change events
    for (const name of ['geolocation', 'notifications'] as PermissionName[]) {
      try {
        const status = await navigator.permissions.query({ name });
        status.addEventListener('change', this.onPermissionChange);
      } catch {
        // Permission not supported in this browser
      }
    }

    // Periodic fallback check
    this.intervalId = setInterval(() => this.emitUpdate(), 30000);
  }

  async stopMonitoring(): Promise<void> {
    this.monitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  private onVisibilityChange = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.emitUpdate();
    }
  };

  private onPermissionChange = (): void => {
    this.emitUpdate();
  };

  private async emitUpdate(): Promise<void> {
    if (!this.monitoring) return;
    const status = await this.checkPermissions();
    this.notifyListeners('permissionChange', status);
  }

  private async queryPermission(name: string): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: name as PermissionName });
      return result.state as PermissionState;
    } catch {
      return 'denied';
    }
  }
}
