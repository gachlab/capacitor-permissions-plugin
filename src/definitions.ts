export interface DevicePermissionsPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
