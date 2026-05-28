// SPDX-License-Identifier: MIT
// Copyright (c) 2026 gachlab
//
// Minimal host page exercising the permissions plugin on web/Android/iOS.
// The e2e harness asserts by grepping logcat (Android) / reading the WebView
// (iOS) for the tagged lines emitted below.

/* global Capacitor */

document.addEventListener('DOMContentLoaded', () => {
  const DevicePermissions = Capacitor.Plugins.DevicePermissions;

  const out = document.getElementById('log');
  const geoEl = document.querySelector('[data-testid="geolocation-state"]');
  const lastEvEl = document.querySelector('[data-testid="last-event"]');

  const log = (label, data) => {
    const line =
      `[${new Date().toISOString().slice(11, 19)}] ${label}` +
      (data === undefined ? '' : ' ' + JSON.stringify(data));
    out.textContent = line + '\n' + out.textContent;
    lastEvEl.textContent = label;
  };

  async function safe(label, fn) {
    try {
      const r = await fn();
      log(label, r);
      return r;
    } catch (e) {
      log(label + ' ERROR', { message: e?.message ?? String(e) });
    }
  }

  document.getElementById('check').onclick = () =>
    safe('checkPermissions', async () => {
      const r = await DevicePermissions.checkPermissions();
      geoEl.textContent = r.geolocation;
      return r;
    });
  document.getElementById('start').onclick = () =>
    safe('startMonitoring', () => DevicePermissions.startMonitoring());
  document.getElementById('stop').onclick = () =>
    safe('stopMonitoring', () => DevicePermissions.stopMonitoring());

  DevicePermissions.addListener('permissionChange', (event) => {
    geoEl.textContent = event.geolocation;
    // Tagged line the e2e script greps for in logcat.
    console.log('[PERM-E2E] event:permissionChange ' + JSON.stringify(event));
    log('event:permissionChange', event);
  });

  // Auto-start so the e2e harness doesn't need to tap before triggering a change.
  DevicePermissions.checkPermissions().then((r) => {
    geoEl.textContent = r.geolocation;
  });
  DevicePermissions.startMonitoring();

  log('ready');
});
