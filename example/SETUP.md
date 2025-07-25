# Example App Setup Guide

## Prerequisites

- Node.js and npm installed
- For Android: Android Studio and Android SDK
- For iOS: Xcode and CocoaPods

## Setup Instructions

### 1. Install Dependencies

```bash
cd example
npm install
```

### 2. Build Web Assets

```bash
npm run build
```

### 3. Android Setup

```bash
# Sync Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

**Required Permissions (already added to AndroidManifest.xml):**
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION` 
- `POST_NOTIFICATIONS`
- `ACCESS_NOTIFICATION_POLICY`

### 4. iOS Setup

```bash
# Sync iOS project
npx cap sync ios

# Install CocoaPods dependencies
cd ios && pod install && cd ..

# Open in Xcode
npx cap open ios
```

**Required Permissions (already added to Info.plist):**
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `NSUserNotificationsUsageDescription`

## Testing the Example

### Web Testing
```bash
npm run start
```
Open http://localhost:5173 in your browser

### Mobile Testing

1. **Start monitoring** - Click "Start Monitoring" to begin permission monitoring
2. **Request permissions** - Click "Request Permissions" to trigger permission dialogs
3. **Change permissions** - Go to device settings and change app permissions
4. **Observe real-time updates** - Watch the UI update automatically when permissions change

### Permission Change Testing

**Android:**
- Settings > Apps > Permissions Monitor > Permissions
- Toggle location, notification permissions

**iOS:**
- Settings > Privacy & Security > Location Services > Permissions Monitor
- Settings > Notifications > Permissions Monitor

**Web:**
- Browser Developer Tools > Application > Permissions
- Manually change permission states

## Features Demonstrated

- ✅ Real-time permission monitoring
- ✅ Event-based change detection
- ✅ Cross-platform compatibility
- ✅ Visual permission status display
- ✅ Permission request handling
- ✅ Comprehensive logging