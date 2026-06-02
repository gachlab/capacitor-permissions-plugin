import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
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
      assert.ok('geolocation' in Object(result));
      assert.ok('notifications' in Object(result));
      assert.ok('notificationsPolicy' in Object(result));
    });

    it('returns valid PermissionState values', async () => {
      const result = await plugin.checkPermissions();
      const validStates = ['granted', 'denied', 'prompt'];
      assert.ok(validStates.includes(result.geolocation));
      assert.ok(validStates.includes(result.notifications));
      assert.ok(validStates.includes(result.notificationsPolicy));
    });
  });

  describe('startMonitoring', () => {
    it('resolves without error', async () => {
      assert.strictEqual(await plugin.startMonitoring(), undefined);
    });

    it('calling twice does not throw', async () => {
      await plugin.startMonitoring();
      assert.strictEqual(await plugin.startMonitoring(), undefined);
    });
  });

  describe('stopMonitoring', () => {
    it('resolves without error', async () => {
      assert.strictEqual(await plugin.stopMonitoring(), undefined);
    });

    it('stops after start without error', async () => {
      await plugin.startMonitoring();
      assert.strictEqual(await plugin.stopMonitoring(), undefined);
    });
  });

  describe('permissionChange events', () => {
    let states: Record<string, PermissionState>;
    let changeHandlers: Record<string, (() => void) | undefined>;
    let originalNavigator: typeof globalThis.navigator;

    beforeEach(() => {
      originalNavigator = globalThis.navigator;
      states = { geolocation: 'granted', notifications: 'granted' };
      changeHandlers = {};
      const query = mock.fn(async ({ name }: { name: string }) => ({
        get state() {
          return states[name];
        },
        addEventListener: (ev: string, cb: () => void) => {
          if (ev === 'change') changeHandlers[name] = cb;
        },
        removeEventListener: () => undefined,
      }));
      Object.defineProperty(globalThis, 'navigator', {
        value: { permissions: { query } },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('emits with changes/from/to/timestamp when a permission changes', async () => {
      const events: PermissionChangeEvent[] = [];
      await plugin.addListener('permissionChange', (e) => events.push(e));
      await plugin.startMonitoring();

      states.geolocation = 'denied';
      changeHandlers.geolocation?.();
      await flush();

      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].geolocation, 'denied');
      assert.deepStrictEqual(events[0].changes, [{ permission: 'geolocation', from: 'granted', to: 'denied' }]);
      assert.strictEqual(typeof events[0].timestamp, 'number');
    });

    it('does not emit when nothing actually changed', async () => {
      const events: PermissionChangeEvent[] = [];
      await plugin.addListener('permissionChange', (e) => events.push(e));
      await plugin.startMonitoring();

      changeHandlers.geolocation?.();
      await flush();

      assert.strictEqual(events.length, 0);
    });
  });
});
