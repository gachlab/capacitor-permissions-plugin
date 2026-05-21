package com.gachlab.capacitor.permissions;

import static org.junit.Assert.*;

import com.getcapacitor.PermissionState;
import java.lang.reflect.Method;
import org.junit.Test;

public class DevicePermissionsPluginTest {

    @Test
    public void stateToString_granted() throws Exception {
        DevicePermissionsPlugin plugin = new DevicePermissionsPlugin();
        Method method = DevicePermissionsPlugin.class.getDeclaredMethod("stateToString", PermissionState.class);
        method.setAccessible(true);
        assertEquals("granted", method.invoke(plugin, PermissionState.GRANTED));
    }

    @Test
    public void stateToString_denied() throws Exception {
        DevicePermissionsPlugin plugin = new DevicePermissionsPlugin();
        Method method = DevicePermissionsPlugin.class.getDeclaredMethod("stateToString", PermissionState.class);
        method.setAccessible(true);
        assertEquals("denied", method.invoke(plugin, PermissionState.DENIED));
    }

    @Test
    public void stateToString_prompt() throws Exception {
        DevicePermissionsPlugin plugin = new DevicePermissionsPlugin();
        Method method = DevicePermissionsPlugin.class.getDeclaredMethod("stateToString", PermissionState.class);
        method.setAccessible(true);
        assertEquals("prompt", method.invoke(plugin, PermissionState.PROMPT));
    }

    @Test
    public void stateToString_null() throws Exception {
        DevicePermissionsPlugin plugin = new DevicePermissionsPlugin();
        Method method = DevicePermissionsPlugin.class.getDeclaredMethod("stateToString", PermissionState.class);
        method.setAccessible(true);
        assertEquals("prompt", method.invoke(plugin, (PermissionState) null));
    }
}
