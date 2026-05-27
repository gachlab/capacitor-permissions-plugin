import { WebPlugin } from '@capacitor/core';

import type {
  DevicePermissionsPlugin,
  PermissionChange,
  PermissionState,
  PermissionStatus as PluginPermissionStatus,
} from './definitions';

export class DevicePermissionsWeb extends WebPlugin implements DevicePermissionsPlugin {
  private monitoring = false;
  private intervalId?: ReturnType<typeof setInterval>;
  private trackedStatuses: PermissionStatus[] = [];
  private lastStatus?: PluginPermissionStatus;

  async checkPermissions(): Promise<PluginPermissionStatus> {
    return {
      geolocation: await this.queryPermission('geolocation'),
      notifications: await this.queryPermission('notifications'),
      notificationsPolicy: await this.queryPermission('notifications'),
    };
  }

  async startMonitoring(): Promise<void> {
    if (this.monitoring) return;
    this.monitoring = true;

    // Seed the baseline so the first real change is detected (and we don't emit
    // a spurious "everything changed" event on start).
    this.lastStatus = await this.checkPermissions();

    // Listen for visibility changes to re-check on tab focus
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    // Listen for native permission change events. Keep refs so stopMonitoring
    // can detach them — otherwise repeated start/stop cycles leak listeners.
    for (const name of ['geolocation', 'notifications'] as PermissionName[]) {
      try {
        const status = await navigator.permissions.query({ name });
        status.addEventListener('change', this.onPermissionChange);
        this.trackedStatuses.push(status);
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
    for (const status of this.trackedStatuses) {
      status.removeEventListener('change', this.onPermissionChange);
    }
    this.trackedStatuses = [];
    this.lastStatus = undefined;
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
    const current = await this.checkPermissions();
    const previous = this.lastStatus;
    this.lastStatus = current;
    if (!previous) return;

    const changes = this.diff(previous, current);
    if (changes.length === 0) return;

    this.notifyListeners('permissionChange', {
      ...current,
      timestamp: Date.now(),
      changes,
    });
  }

  private diff(previous: PluginPermissionStatus, current: PluginPermissionStatus): PermissionChange[] {
    const keys: (keyof PluginPermissionStatus)[] = ['geolocation', 'notifications', 'notificationsPolicy'];
    const changes: PermissionChange[] = [];
    for (const key of keys) {
      if (previous[key] !== current[key]) {
        changes.push({ permission: key, from: previous[key], to: current[key] });
      }
    }
    return changes;
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
