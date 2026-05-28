package com.gachlab.capacitor.permissions;

import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.Test;

/** Pure-JVM unit tests for the permission diff logic (no Android, no device). */
public class PermissionDiffEngineTest {

    private final PermissionDiffEngine engine = new PermissionDiffEngine();

    private Map<String, String> state(String geo, String notif, String policy) {
        Map<String, String> m = new HashMap<>();
        m.put("geolocation", geo);
        m.put("notifications", notif);
        m.put("notificationsPolicy", policy);
        return m;
    }

    @Test
    public void noChange_returnsEmpty() {
        assertTrue(engine.diff(state("granted", "granted", "granted"), state("granted", "granted", "granted")).isEmpty());
    }

    @Test
    public void nullPrevious_isBaseline_returnsEmpty() {
        assertTrue(engine.diff(null, state("granted", "granted", "granted")).isEmpty());
    }

    @Test
    public void singleChange_reportsPermissionFromAndTo() {
        List<PermissionDiffEngine.Change> changes = engine.diff(
            state("granted", "granted", "granted"),
            state("denied", "granted", "granted")
        );
        assertEquals(1, changes.size());
        assertEquals("geolocation", changes.get(0).permission);
        assertEquals("granted", changes.get(0).from);
        assertEquals("denied", changes.get(0).to);
    }

    @Test
    public void multipleChanges_reportedInKeyOrder() {
        List<PermissionDiffEngine.Change> changes = engine.diff(
            state("granted", "granted", "denied"),
            state("denied", "granted", "granted")
        );
        assertEquals(2, changes.size());
        assertEquals("geolocation", changes.get(0).permission);
        assertEquals("notificationsPolicy", changes.get(1).permission);
    }
}
