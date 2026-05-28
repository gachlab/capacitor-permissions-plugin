package com.gachlab.capacitor.permissions;

import android.Manifest;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.HashMap;
import java.util.List;
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
    private Map<String, String> previousStates;
    private final PermissionDiffEngine diffEngine = new PermissionDiffEngine();

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        call.resolve(buildPermissionsResponse());
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        stopTimer();
        // Seed the baseline so the first real change is detected (and we don't emit
        // a spurious event on start).
        previousStates = currentStates();
        monitorTimer = new Timer();
        monitorTimer.schedule(
            new TimerTask() {
                @Override
                public void run() {
                    emitIfChanged();
                }
            },
            10000,
            10000
        );
        call.resolve();
    }

    private void emitIfChanged() {
        Map<String, String> current = currentStates();
        List<PermissionDiffEngine.Change> changes = diffEngine.diff(previousStates, current);
        previousStates = current;
        if (changes.isEmpty()) return;

        JSObject ret = buildPermissionsResponse();
        ret.put("timestamp", System.currentTimeMillis());
        JSArray changesArr = new JSArray();
        for (PermissionDiffEngine.Change change : changes) {
            JSObject obj = new JSObject();
            obj.put("permission", change.permission);
            obj.put("from", change.from);
            obj.put("to", change.to);
            changesArr.put(obj);
        }
        ret.put("changes", changesArr);
        notifyListeners("permissionChange", ret);
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        stopTimer();
        call.resolve();
    }

    private JSObject buildPermissionsResponse() {
        JSObject result = new JSObject();
        for (Map.Entry<String, String> entry : currentStates().entrySet()) {
            result.put(entry.getKey(), entry.getValue());
        }
        return result;
    }

    private Map<String, String> currentStates() {
        Map<String, PermissionState> states = getPermissionStates();
        Map<String, String> result = new HashMap<>();

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
        previousStates = null;
    }

    @Override
    protected void handleOnDestroy() {
        stopTimer();
    }
}
