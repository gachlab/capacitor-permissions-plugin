import { WebPlugin } from '@capacitor/core';

import type { DevicePermissions, DevicePermissionsPlugin } from './definitions';
import { Observable, Subscriber } from 'rxjs';

export class DevicePermissionsPluginWeb
  extends WebPlugin
  implements DevicePermissionsPlugin {
  private PermissionNames: PermissionName[] = ["geolocation", "notifications", "push"];

  monitor(): Observable<DevicePermissions> {
    return new Observable((observer: Subscriber<DevicePermissions>) => {
      setInterval(() => {
        Promise.all(this.PermissionNames.map((permissionName) => navigator.permissions
          .query({ name: permissionName })
          .then((response) => ({
            [permissionName]: response.state,
          }))))
          .then((response) => response.reduce((response, permission) => {
            response = Object.assign({}, response, permission);
            return response;
          }, {}))
          .then((response: any) => observer.next(response));
      }, 5000);
    })
  }
}
