// SPDX-License-Identifier: MIT
// Copyright (c) 2026 gachlab

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gachlab.capacitor.permissions.example',
  appName: 'Permissions Example',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
