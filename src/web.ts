import { WebPlugin } from '@capacitor/core';

import type { DevicePermissionsPluginPlugin } from './definitions';

export class DevicePermissionsPluginWeb
  extends WebPlugin
  implements DevicePermissionsPluginPlugin
{
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
