package com.gachlab.capacitor.permissions;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Pure diff logic for permission-state changes. Has NO Android/Capacitor
 * dependencies on purpose, so it unit-tests on the plain JVM (no Robolectric,
 * no device): the {@code Plugin} class keeps only the bridge wiring
 * ({@code getPermissionStates()} + {@code notifyListeners()}).
 */
public final class PermissionDiffEngine {

    public static final String[] PERMISSION_KEYS = { "geolocation", "notifications", "notificationsPolicy" };

    /** A single permission whose state changed between two snapshots. */
    public static final class Change {

        public final String permission;
        public final String from;
        public final String to;

        public Change(String permission, String from, String to) {
            this.permission = permission;
            this.from = from;
            this.to = to;
        }
    }

    /**
     * Returns the permissions that changed from {@code previous} to {@code current}.
     * Empty when nothing changed or when there is no baseline yet ({@code previous == null}).
     */
    public List<Change> diff(Map<String, String> previous, Map<String, String> current) {
        List<Change> changes = new ArrayList<>();
        if (previous == null) {
            return changes;
        }
        for (String key : PERMISSION_KEYS) {
            String from = previous.get(key);
            String to = current.get(key);
            if (from != null && !from.equals(to)) {
                changes.add(new Change(key, from, to));
            }
        }
        return changes;
    }
}
