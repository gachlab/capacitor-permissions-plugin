import { WebPlugin } from "@capacitor/core";
import type { DevicePermissionsPlugin } from "./definitions";

export class DevicePermissionsWeb extends WebPlugin implements DevicePermissionsPlugin {
  private callback: any;
  private backgroundInterval?: number;

  monitor(callback: any): void {
    this.callback = callback;
    
    // Monitor geolocation
    navigator.permissions.query({ name: 'geolocation' }).then(status => {
      status.addEventListener('change', () => this.sendUpdate());
      this.sendUpdate();
    }).catch(() => {});

    // Monitor notifications
    navigator.permissions.query({ name: 'notifications' }).then(status => {
      status.addEventListener('change', () => this.sendUpdate());
    }).catch(() => {});
    
    // Background monitoring
    this.setupBackgroundMonitoring();
  }

  private async sendUpdate() {
    const permissions: any = {};
    
    try {
      const geo = await navigator.permissions.query({ name: 'geolocation' });
      permissions.geolocation = geo.state === 'granted' ? 'granted' : 'denied';
    } catch { permissions.geolocation = 'denied'; }

    try {
      const notif = await navigator.permissions.query({ name: 'notifications' });
      permissions.notifications = notif.state;
      permissions['notifications-policy'] = notif.state;
    } catch { 
      permissions.notifications = 'denied';
      permissions['notifications-policy'] = 'denied';
    }

    permissions.doNotDisturb = 0;
    this.callback(permissions);
  }
  
  private setupBackgroundMonitoring() {
    // Page Visibility API for background detection
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sendUpdate();
      }
    });
    
    // Periodic background check
    this.backgroundInterval = window.setInterval(() => {
      this.sendUpdate();
    }, 30000); // Check every 30 seconds
    
    // Service Worker support if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'PERMISSION_CHECK') {
          this.sendUpdate();
        }
      });
    }
  }
  
  destroy() {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
  }
}