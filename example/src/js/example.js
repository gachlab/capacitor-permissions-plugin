import { DevicePermissionsPlugin } from '@gachlab/capacitor-permissions';

window.testMonitor = () => {
    DevicePermissionsPlugin.monitor(console.log)
}
 
