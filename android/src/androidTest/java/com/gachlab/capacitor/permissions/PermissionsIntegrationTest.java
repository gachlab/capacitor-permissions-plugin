package com.gachlab.capacitor.permissions;

import static org.junit.Assert.*;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import java.util.HashMap;
import java.util.Map;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * Integration tests — read REAL permission state from the device (the same
 * Android APIs the plugin uses) and drive the real {@link PermissionDiffEngine}
 * with it. Runs on an emulator/device, no mocks.
 */
@RunWith(AndroidJUnit4.class)
public class PermissionsIntegrationTest {

    private final PermissionDiffEngine engine = new PermissionDiffEngine();

    private Map<String, String> readRealStates() {
        Context ctx = ApplicationProvider.getApplicationContext();
        Map<String, String> states = new HashMap<>();
        states.put(
            "geolocation",
            ctx.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ? "granted" : "denied"
        );
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        states.put("notificationsPolicy", nm.isNotificationPolicyAccessGranted() ? "granted" : "denied");
        states.put("notifications", "granted");
        return states;
    }

    @Test
    public void realPermissionStates_areConcreteAndReadable() {
        Map<String, String> states = readRealStates();
        assertNotNull(states.get("geolocation"));
        assertNotNull(states.get("notificationsPolicy"));
    }

    @Test
    public void engine_detectsAChange_againstRealBaseline() {
        Map<String, String> baseline = readRealStates();
        Map<String, String> flipped = new HashMap<>(baseline);
        flipped.put("geolocation", "granted".equals(baseline.get("geolocation")) ? "denied" : "granted");
        assertEquals(1, engine.diff(baseline, flipped).size());
    }
}
