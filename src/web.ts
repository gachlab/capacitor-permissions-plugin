import { WebPlugin } from "@capacitor/core";

import type { DevicePermissionsPlugin } from "./definitions";

export class DevicePermissionsWeb extends WebPlugin
  implements DevicePermissionsPlugin {
  private PermissionNames: PermissionOption[] = [
    { id: "geolocation", options: { userVisibleOnly: true } },
    { id: "notifications", options: { userVisibleOnly: true } },
    { id: "push", options: { userVisibleOnly: true } },
  ];

  monitor(callback: any): void {
    this.PermissionNames.map((permission) =>
      navigator.permissions
        .query(
          Object.assign(
            { name: permission.id },
            permission.options
          ) as PermissionDescriptor
        )
        .then((permissionStatus) => {
          permissionStatus.addEventListener("change", (event) => {
            const change = {
              [(event.target as PermissionStatus)
                .name]: (event.target as PermissionStatus).state,
            };
            console.log(
              "DevicePermissionsPlugin",
              "Permission Changed",
              change
            );
            callback(change);
          });

          callback(permissionStatus);
        })
        .catch(console.error)
    );
  }
}

export interface PermissionOption {
  id: string;
  options?: {} | undefined;
}
