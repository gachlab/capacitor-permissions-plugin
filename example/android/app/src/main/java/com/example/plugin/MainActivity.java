package com.example.plugin;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the plugin
        registerPlugin(com.gachlab.capacitor.permissions.DevicePermissionsPlugin.class);
    }
}