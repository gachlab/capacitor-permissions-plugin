import { DevicePermissionsPlugin } from '@gachlab/capacitor-permissions';

let isMonitoring = false;
let lastPermissions = {};

function log(message) {
    const logDiv = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();
    logDiv.innerHTML += `[${timestamp}] ${message}\n`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function updatePermissionsDisplay(permissions) {
    const container = document.getElementById('permissions');
    container.innerHTML = '';
    
    Object.entries(permissions).forEach(([key, value]) => {
        const div = document.createElement('div');
        div.className = 'permission';
        div.innerHTML = `
            <span>${key}</span>
            <span class="status ${value}">${value}</span>
        `;
        container.appendChild(div);
    });
    
    // Update toggle switches to match current permissions
    updateToggleSwitches(permissions);
}

function updateToggleSwitches(permissions) {
    const locationToggle = document.getElementById('locationToggle');
    const notificationToggle = document.getElementById('notificationToggle');
    
    if (locationToggle) {
        const isGranted = permissions.geolocation === 'granted';
        if (locationToggle.checked !== isGranted) {
            locationToggle.checked = isGranted;
            log(`Location toggle updated: ${isGranted}`);
        }
    }
    
    if (notificationToggle) {
        const isGranted = permissions.notifications === 'granted';
        if (notificationToggle.checked !== isGranted) {
            notificationToggle.checked = isGranted;
            log(`Notification toggle updated: ${isGranted}`);
        }
    }
}

function detectChanges(newPermissions) {
    const changes = [];
    
    Object.entries(newPermissions).forEach(([key, value]) => {
        if (lastPermissions[key] && lastPermissions[key] !== value) {
            changes.push(`${key}: ${lastPermissions[key]} → ${value}`);
        }
    });
    
    if (changes.length > 0) {
        log(`Permission changes detected: ${changes.join(', ')}`);
    }
    
    lastPermissions = { ...newPermissions };
}

window.startMonitoring = async () => {
    if (isMonitoring) return;
    
    isMonitoring = true;
    log('Starting permission monitoring...');
    
    // Add event listener for permission changes
    DevicePermissionsPlugin.addListener('permissionChange', (permissions) => {
        log(`Permissions update received`);
        detectChanges(permissions);
        updatePermissionsDisplay(permissions);
    });
    
    // Start monitoring
    await DevicePermissionsPlugin.monitor();
};

window.stopMonitoring = () => {
    isMonitoring = false;
    DevicePermissionsPlugin.removeAllListeners();
    log('Monitoring stopped');
};

window.requestPermissions = async () => {
    log('Requesting permissions...');
    
    try {
        // Request geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => log('Geolocation permission granted'),
                () => log('Geolocation permission denied')
            );
        }
        
        // Request notifications
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            log(`Notification permission: ${permission}`);
        }
    } catch (error) {
        log(`Error requesting permissions: ${error.message}`);
    }
};

window.toggleGeolocation = async (enabled) => {
    log(`Location toggle clicked: ${enabled}`);
    
    if (enabled) {
        log('Requesting geolocation permission...');
        
        try {
            if (window.DevicePermissionsPlugin) {
                // Request permission through our plugin
                const result = await window.DevicePermissionsPlugin.requestPermissions();
                log(`Permission request result: ${JSON.stringify(result)}`);
            }
            
            // Then try to get location
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    log(`Location permission GRANTED`);
                    log(`Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                },
                (error) => {
                    log(`Location error: ${error.code} - ${error.message}`);
                    document.getElementById('locationToggle').checked = false;
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } catch (error) {
            log(`Permission request failed: ${error.message}`);
            document.getElementById('locationToggle').checked = false;
        }
    } else {
        log('Location toggle turned OFF');
    }
};

window.toggleNotifications = async (enabled) => {
    if (enabled) {
        log('Requesting notification permission...');
        try {
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                // Use Capacitor Local Notifications plugin for native platforms
                try {
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    const result = await LocalNotifications.requestPermissions();
                    log(`Notification permission: ${result.display}`);
                    if (result.display === 'granted') {
                        // Schedule a test notification
                        await LocalNotifications.schedule({
                            notifications: [{
                                title: 'Permission Granted!',
                                body: 'Notifications are now enabled',
                                id: 1,
                                schedule: { at: new Date(Date.now() + 1000) }
                            }]
                        });
                    } else {
                        setTimeout(() => {
                            document.getElementById('notificationToggle').checked = false;
                        }, 100);
                    }
                } catch (error) {
                    log(`Notification error: ${error.message}`);
                    setTimeout(() => {
                        document.getElementById('notificationToggle').checked = false;
                    }, 100);
                }
            } else if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                log(`Notification permission: ${permission}`);
                if (permission === 'granted') {
                    new Notification('Permission granted!', {
                        body: 'Notifications are now enabled'
                    });
                } else {
                    setTimeout(() => {
                        document.getElementById('notificationToggle').checked = false;
                    }, 100);
                }
            } else {
                log('Notifications not supported');
                setTimeout(() => {
                    document.getElementById('notificationToggle').checked = false;
                }, 100);
            }
        } catch (error) {
            log(`Notification toggle error: ${error.message}`);
            setTimeout(() => {
                document.getElementById('notificationToggle').checked = false;
            }, 100);
        }
    } else {
        log('To revoke notifications: Go to device Settings > Apps > Permissions');
    }
};

// Auto-start monitoring
document.addEventListener('DOMContentLoaded', () => {
    log('Example loaded - click "Start Monitoring" to begin');
});