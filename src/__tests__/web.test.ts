import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevicePermissionsWeb } from '../web';
import type { PermissionChangeEvent, PermissionState } from '../definitions';

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

  describe('permissionChange events', () => {
    let states: Record<string, PermissionState>;
    let changeHandlers: Record<string, (() => void) | undefined>;

    beforeEach(() => {
      states = { geolocation: 'granted', notifications: 'granted' };
      changeHandlers = {};
      const query = vi.fn(async ({ name }: { name: string }) => ({
        get state() {
          return states[name];
        },
        addEventListener: (ev: string, cb: () => void) => {
          if (ev === 'change') changeHandlers[name] = cb;
        },
        removeEventListener: () => undefined,
      }));
      vi.stubGlobal('navigator', { permissions: { query } });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('emits with changes/from/to/timestamp when a permission changes', async () => {
      const events: PermissionChangeEvent[] = [];
      await plugin.addListener('permissionChange', (e) => events.push(e));
      await plugin.startMonitoring();

      states.geolocation = 'denied';
      changeHandlers.geolocation?.();
      await flush();

      expect(events).toHaveLength(1);
      expect(events[0].geolocation).toBe('denied');
      expect(events[0].changes).toEqual([{ permission: 'geolocation', from: 'granted', to: 'denied' }]);
      expect(typeof events[0].timestamp).toBe('number');
    });

    it('does not emit when nothing actually changed', async () => {
      const events: PermissionChangeEvent[] = [];
      await plugin.addListener('permissionChange', (e) => events.push(e));
      await plugin.startMonitoring();

      changeHandlers.geolocation?.();
      await flush();

      expect(events).toHaveLength(0);
    });
  });
});
