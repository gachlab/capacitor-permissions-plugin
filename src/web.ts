import { WebPlugin } from '@capacitor/core';

import type { DevicePermissionsPlugin } from './definitions';

export class DevicePermissionsPluginWeb
  extends WebPlugin
  implements DevicePermissionsPlugin {
  private PermissionNames: PermissionName[] = ["geolocation", "notifications", "push"];

  monitor(callback: any): void {
    setInterval(() => {
      Promise.all(this.PermissionNames.map((permissionName) => navigator.permissions
        .query({ name: permissionName })
        .then((response) => ({
          [permissionName]: response.state,
        }))))
        .then((response) => response.reduce((response, permission) => {
          response = Object.assign({}, response, permission);
          return response;
        }, {})).then(callback)
    }, 5000);

  }
}
