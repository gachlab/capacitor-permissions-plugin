package com.gachlab.capacitor.permissions;

import android.Manifest;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

@CapacitorPlugin(
    name = "DevicePermissions",
    permissions = {
        @Permission(
            alias = "geolocation",
            strings = { Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION }
        ),
        @Permission(alias = "notifications", strings = {}),
        @Permission(alias = "notificationsPolicy", strings = { Manifest.permission.ACCESS_NOTIFICATION_POLICY })
    }
)
public class DevicePermissionsPlugin extends Plugin {

    private Timer monitorTimer;

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        call.resolve(buildPermissionsResponse());
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        stopTimer();
        monitorTimer = new Timer();
        monitorTimer.schedule(
            new TimerTask() {
                @Override
                public void run() {
                    notifyListeners("permissionChange", buildPermissionsResponse());
                }
            },
            0,
            10000
        );
        call.resolve();
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        stopTimer();
        call.resolve();
    }

    private JSObject buildPermissionsResponse() {
        JSObject result = new JSObject();
        Map<String, PermissionState> states = getPermissionStates();

        result.put("geolocation", stateToString(states.get("geolocation")));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            result.put("notifications", stateToString(states.get("notifications")));
        } else {
            // Pre-Android 13: notifications don't require runtime permission
            result.put("notifications", "granted");
        }

        result.put("notificationsPolicy", stateToString(states.get("notificationsPolicy")));
        return result;
    }

    private String stateToString(PermissionState state) {
        if (state == null) return "prompt";
        switch (state) {
            case GRANTED:
                return "granted";
            case DENIED:
                return "denied";
            default:
                return "prompt";
        }
    }

    private void stopTimer() {
        if (monitorTimer != null) {
            monitorTimer.cancel();
            monitorTimer = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        stopTimer();
    }
}
