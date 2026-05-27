# @gachlab/capacitor-permissions

A Capacitor plugin to monitor device permission states across Android, iOS, and Web.

Monitors **geolocation**, **notifications**, and **notification policy** permissions with real-time change events.

## Installation

```bash
npm install @gachlab/capacitor-permissions
npx cap sync
```

## Usage

```typescript
import { DevicePermissions } from '@gachlab/capacitor-permissions';

// Check current permission states
const status = await DevicePermissions.checkPermissions();
console.log('Geolocation:', status.geolocation);
console.log('Notifications:', status.notifications);

// Listen for permission changes (fires only when something actually changes)
await DevicePermissions.addListener('permissionChange', (event) => {
  console.log('Permissions changed at', new Date(event.timestamp));
  for (const change of event.changes) {
    console.log(`${change.permission}: ${change.from} -> ${change.to}`);
  }
});

// Start monitoring (emits permissionChange events)
await DevicePermissions.startMonitoring();

// Stop monitoring when done
await DevicePermissions.stopMonitoring();

// Clean up listeners
await DevicePermissions.removeAllListeners();
```

## API

### checkPermissions()

```typescript
checkPermissions() => Promise<PermissionStatus>
```

Returns the current state of all monitored permissions.

**Returns:** `PermissionStatus` with `geolocation`, `notifications`, and `notificationsPolicy` fields, each being `'granted'`, `'denied'`, or `'prompt'`.

---

### startMonitoring()

```typescript
startMonitoring() => Promise<void>
```

Starts monitoring permissions. Emits `permissionChange` events when any permission state changes. On Android, polls every 10 seconds. On iOS, listens for app lifecycle and location authorization changes. On Web, uses the Permissions API change events with a 30-second fallback poll.

---

### stopMonitoring()

```typescript
stopMonitoring() => Promise<void>
```

Stops monitoring permissions and cleans up timers/listeners.

---

### addListener('permissionChange', ...)

```typescript
addListener(
  eventName: 'permissionChange',
  listenerFunc: (event: PermissionChangeEvent) => void,
) => Promise<PluginListenerHandle>
```

Fires **only when at least one permission actually changed** (no longer on every poll tick). The payload is the full current `PermissionStatus` plus `timestamp` (epoch ms) and `changes` (the permissions that changed), for audit logging.

---

### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

## Types

```typescript
type PermissionState = 'granted' | 'denied' | 'prompt';

interface PermissionStatus {
  geolocation: PermissionState;
  notifications: PermissionState;
  notificationsPolicy: PermissionState;
}

interface PermissionChange {
  permission: 'geolocation' | 'notifications' | 'notificationsPolicy';
  from: PermissionState;
  to: PermissionState;
}

interface PermissionChangeEvent extends PermissionStatus {
  timestamp: number;
  changes: PermissionChange[];
}
```

## Platform Notes

### Android
- Geolocation uses `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION`
- Notifications use `POST_NOTIFICATIONS` (Android 13+); pre-13 always returns `'granted'`
- Notification policy uses `ACCESS_NOTIFICATION_POLICY`

### iOS
- Geolocation uses `CLLocationManager.authorizationStatus`
- Notifications use `UNUserNotificationCenter.getNotificationSettings` (async, no deadlock)
- Notification policy mirrors notification state

### Web
- Uses the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- Falls back to `'denied'` if a permission query is not supported

## Migration from v2

v3 is a complete API redesign:

```diff
- DevicePermissions.monitor((permissions) => { ... });
+ await DevicePermissions.startMonitoring();
+ DevicePermissions.addListener('permissionChange', (status) => { ... });

+ const status = await DevicePermissions.checkPermissions();

+ await DevicePermissions.stopMonitoring();
+ await DevicePermissions.removeAllListeners();
```
