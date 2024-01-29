import { registerPlugin } from '@capacitor/core';

import type { DevicePermissionsPlugin } from './definitions';

const DevicePermissionsPlugin = registerPlugin<DevicePermissionsPlugin>(
  'DevicePermissionsPlugin',
  {
    web: () => import('./web').then(m => new m.DevicePermissionsPluginWeb()),
  },
);

export * from './definitions';
export { DevicePermissionsPlugin };
