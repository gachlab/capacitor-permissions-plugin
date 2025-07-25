# Device Permissions Plugin Example

This example demonstrates the real-time permission monitoring capabilities of the Device Permissions plugin.

## Features

- **Real-time monitoring**: Automatically detects when permissions change
- **Visual status display**: Shows current state of all monitored permissions
- **Change detection**: Logs when permissions change from one state to another
- **Permission requests**: Buttons to trigger permission requests for testing

## Monitored Permissions

- **Geolocation**: Location access permissions
- **Notifications**: Push notification permissions  
- **Notifications-policy**: Notification policy access
- **DoNotDisturb**: Do not disturb status (limited on some platforms)

## Usage

1. Open the example in a browser or Capacitor app
2. Click "Start Monitoring" to begin permission monitoring
3. Click "Request Permissions" to trigger permission dialogs
4. Watch the real-time updates as permissions change
5. Check the event log for detailed change information

## Testing Permission Changes

- **Web**: Use browser developer tools to simulate permission changes
- **iOS**: Go to Settings > Privacy & Security to change app permissions
- **Android**: Go to Settings > Apps > [App] > Permissions to modify permissions

The plugin will automatically detect and report these changes in real-time.