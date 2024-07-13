package com.gachlab.capacitor.permissions;

import android.Manifest;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.RequiresApi;

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

@RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
@CapacitorPlugin(
    name = "DevicePermissions",
    permissions = {
        @Permission(
            alias = "geolocation",
            strings = {
                Manifest.permission.ACCESS_BACKGROUND_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION
            }
        ),
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS }),
        @Permission(alias = "notifications-policy", strings = { Manifest.permission.ACCESS_NOTIFICATION_POLICY })
    }
)
public class DevicePermissionsPlugin extends Plugin {
    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void monitor(PluginCall call) {
        call.setKeepAlive(true);
        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                    JSObject permissionsResponse = getPermissionsState();
                    call.resolve(permissionsResponse);
            }
        }, 0, 10000);
    }

    private JSObject getPermissionsState(){
        Map<String, PermissionState> permissionsResult = getPermissionStates();
        JSObject permissionsResultJSON = new JSObject();

        if (!permissionsResult.isEmpty()) {
            for (Map.Entry<String, PermissionState> entry : permissionsResult.entrySet()) {
                permissionsResultJSON.put(entry.getKey(), entry.getValue());
            }
        }
        return permissionsResultJSON;
    }
}
