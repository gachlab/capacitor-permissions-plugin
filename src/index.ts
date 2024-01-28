import { registerPlugin } from '@capacitor/core';

import type { DevicePermissionsPluginPlugin } from './definitions';

const DevicePermissionsPlugin = registerPlugin<DevicePermissionsPluginPlugin>(
  'DevicePermissionsPlugin',
  {
    web: () => import('./web').then(m => new m.DevicePermissionsPluginWeb()),
  },
);

export * from './definitions';
export { DevicePermissionsPlugin };
