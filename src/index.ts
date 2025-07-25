import { registerPlugin } from '@capacitor/core';

import type { DevicePermissionsPlugin } from './definitions';

const DevicePermissions = registerPlugin<DevicePermissionsPlugin>(
  'DevicePermissions',
  {
    web: () => import('./web').then(m => new m.DevicePermissionsWeb()),
  },
);

export * from './definitions';
export { DevicePermissions as DevicePermissionsPlugin };
