import { WebPlugin } from "@capacitor/core";

import type { DevicePermissionsPlugin } from "./definitions";

export class DevicePermissionsWeb extends WebPlugin
  implements DevicePermissionsPlugin {
  private PermissionNames: PermissionName[] = [
    "geolocation",
    "notifications",
    "push",
  ];

  monitor(callback: any): void {
    this.PermissionNames.map((permissionName) =>
      navigator.permissions
        .query(Object.assign({ name: permissionName, userVisibleOnly: true }))
        .then((permissionStatus) => {
          permissionStatus.addEventListener("change", (event) => {
            const change = {
              [(event.target as PermissionStatus).name]: (event.target as PermissionStatus).state,
            };
            console.log(
              "DevicePermissionsPlugin",
              "Permission Changed",
              change
            );
            callback(change);
          });
        })
        .catch(console.error)
    );
  }
}
