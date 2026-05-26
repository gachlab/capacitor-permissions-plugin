# Roadmap — @gachlab/capacitor-permissions

**Contexto:** Monitorea el estado de permisos del dispositivo (geolocation, notifications, notification-policy) y emite `permissionChange` cuando algo cambia. Caso de uso principal: **detectar y registrar** cuándo un permiso ya concedido es revocado (p. ej. localización), para auditoría — más que impedirlo.

**Estado actual:** v3.0.2 — las 3 plataformas implementadas; monitoreo por polling (Android 10s, Web 30s fallback, iOS event-driven + foreground). Bump AGP 9 mergeado, sin release npm.

---

## Fase 1 — Eventos con timestamp

- Añadir `timestamp` a `permissionChange` (y `from`/`to` del estado) para bitácora precisa.
- El plugin emite; el consumidor reporta. Para reporte confiable en background ver `event-sink`.

## Fase 2 — Reacción blanda (opcional)

Para consumidores que quieran forzar la re-concesión sin bloquear a nivel de SO:

```typescript
openAppSettings(): Promise<void>   // deep-link a la pantalla de permisos de la app
```

El gate de UI (bloquear la app hasta re-conceder) vive en el consumidor; el plugin solo provee la detección y el deep-link.

## Fase 3 — Captura confiable en background (la difícil)

Android **no** emite un broadcast al revocar un permiso → la revocación que ocurre con la app fuera de foco se pierde con el polling actual (el timer muere con la app). Capturarla requiere un componente vivo que haga polling periódico.

- Integrar con `event-sink` (servicio + cola compartidos) para muestrear permisos en background y encolar los cambios.
- Documentar el límite de latencia (no es push, es muestreo).

---

## Backlog

- Ampliar el set de permisos: cámara, micrófono, contactos, fotos/almacenamiento — solo cuando haya demanda concreta.
- **Enforcement duro (opcional, avanzado):** en dispositivos donde la app es **Device Owner** (Android Enterprise), `DevicePolicyManager.setPermissionGrantState` fija permisos que el usuario no puede revocar. Fuera del alcance por defecto; documentar como integración para flotas gestionadas.

## Notas de plataforma

- **Android primero.** iOS se mantiene sin inversión nueva; Web según `Permissions API` disponible.
