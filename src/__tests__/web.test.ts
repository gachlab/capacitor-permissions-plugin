import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DevicePermissionsWeb } from '../web';

describe('DevicePermissionsWeb', () => {
  let plugin: DevicePermissionsWeb;

  beforeEach(() => {
    plugin = new DevicePermissionsWeb();
  });

  afterEach(async () => {
    await plugin.stopMonitoring();
  });

  describe('checkPermissions', () => {
    it('returns all permission fields', async () => {
      const result = await plugin.checkPermissions();
      expect(result).toHaveProperty('geolocation');
      expect(result).toHaveProperty('notifications');
      expect(result).toHaveProperty('notificationsPolicy');
    });

    it('returns valid PermissionState values', async () => {
      const result = await plugin.checkPermissions();
      const validStates = ['granted', 'denied', 'prompt'];
      expect(validStates).toContain(result.geolocation);
      expect(validStates).toContain(result.notifications);
      expect(validStates).toContain(result.notificationsPolicy);
    });
  });

  describe('startMonitoring', () => {
    it('resolves without error', async () => {
      await expect(plugin.startMonitoring()).resolves.toBeUndefined();
    });

    it('calling twice does not throw', async () => {
      await plugin.startMonitoring();
      await expect(plugin.startMonitoring()).resolves.toBeUndefined();
    });
  });

  describe('stopMonitoring', () => {
    it('resolves without error', async () => {
      await expect(plugin.stopMonitoring()).resolves.toBeUndefined();
    });

    it('stops after start without error', async () => {
      await plugin.startMonitoring();
      await expect(plugin.stopMonitoring()).resolves.toBeUndefined();
    });
  });
});
