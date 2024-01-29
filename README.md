# @gachlab/capacitor-permissions-plugin

A plugin to monitor different permissions

## Install

```bash
npm install @gachlab/capacitor-permissions-plugin
npx cap sync
```

## API

<docgen-index>

* [`monitor()`](#monitor)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### monitor()

```typescript
monitor() => Observable<DevicePermissions>
```

**Returns:** <code>Observable&lt;<a href="#devicepermissions">DevicePermissions</a>&gt;</code>

--------------------


### Interfaces


#### DevicePermissions

| Prop                         | Type                                           |
| ---------------------------- | ---------------------------------------------- |
| **`geolocation`**            | <code>'denied' \| 'granted'</code>             |
| **`notifications`**          | <code>'denied' \| 'granted' \| 'prompt'</code> |
| **`"notifications-policy"`** | <code>'denied' \| 'granted'</code>             |
| **`doNotDisturb`**           | <code>0 \| 1</code>                            |

</docgen-api>
